import * as Skins from "../data/skins";
import {
  AppBskyEmbedImages,
  AppBskyFeedPost,
  AtpAgent,
  BlobRef,
  RichText,
} from "@atproto/api";
import {
  TWEET_BOT_CHANNEL_ID,
  BLUESKY_USERNAME,
  BLUESKY_PASSWORD,
} from "../config";
import { Client } from "discord.js";
import sharp from "sharp";
import SkinModel from "../data/SkinModel";
import UserContext from "../data/UserContext";
import { withBufferAsTempFile } from "../utils";
import fs from "fs";

const agent = new AtpAgent({ service: "https://bsky.social" });

export async function postToBluesky(
  discordClient: Client,
  md5: string | null
): Promise<void> {
  if (md5 == null) {
    md5 = await Skins.getSkinToPostToBluesky();
  }
  if (md5 == null) {
    console.error("No skins to post to Bluesky");
    return;
  }
  const url = await post(md5);

  console.log("Going to post to discord");
  const tweetBotChannel = await discordClient.channels.fetch(
    TWEET_BOT_CHANNEL_ID
  );
  // @ts-ignore
  await tweetBotChannel.send(url);
  console.log("Posted to discord");
}

async function post(md5: string): Promise<string> {
  const ctx = new UserContext();
  const skin = await SkinModel.fromMd5Assert(ctx, md5);
  const screenshot = await Skins.getScreenshotBuffer(md5);
  const { width, height } = await sharp(screenshot).metadata();

  const image = await sharp(screenshot)
    .resize(width * 2, height * 2, {
      kernel: sharp.kernel.nearest,
    })
    .toBuffer();

  const name = await skin.getFileName();
  const url = skin.getMuseumUrl();
  const screenshotFileName = await skin.getScreenshotFileName();

  const status = `${name}\n`; // TODO: Should we add hashtags?

  await agent.login({
    identifier: BLUESKY_USERNAME!,
    password: BLUESKY_PASSWORD!,
  });

  const blob = await withBufferAsTempFile(
    image,
    screenshotFileName,
    async (filePath) => {
      return uploadImageFromFilePath(agent, filePath);
    }
  );

  const postData = await buildPost(
    agent,
    status,
    buildImageEmbed(blob, width * 2, height * 2)
  );
  const postResp = await agent.post(postData);
  console.log(postResp);

  const postId = postResp.cid;
  const postUrl = postResp.uri;

  await Skins.markAsPostedToBlueSky(md5, postId, postUrl);

  const prefix = "Try on the ";
  const suffix = "Winamp Skin Museum";

  agent.post({
    text: prefix + suffix,
    createdAt: new Date().toISOString(),
    facets: [
      {
        $type: "app.bsky.richtext.facet",
        index: {
          byteStart: prefix.length,
          byteEnd: prefix.length + suffix.length,
        },
        features: [
          {
            $type: "app.bsky.richtext.facet#link",
            uri: url,
          },
        ],
      },
    ],
    reply: {
      root: postResp,
      parent: postResp,
    },
    $type: "app.bsky.feed.post",
  });

  // return permalink;
  return postUrl;
}

/** Build the embed data for an image. */
function buildImageEmbed(
  imgBlob: BlobRef,
  width: number,
  height: number
): AppBskyEmbedImages.Main {
  const image = {
    image: imgBlob,
    aspectRatio: { width, height },
    alt: "",
  };
  return {
    $type: "app.bsky.embed.images",
    images: [image],
  };
}

/** Build the post data for an image. */
async function buildPost(
  agent: AtpAgent,
  rawText: string,
  imageEmbed: AppBskyEmbedImages.Main
): Promise<AppBskyFeedPost.Record> {
  const rt = new RichText({ text: rawText });
  await rt.detectFacets(agent);
  const { text, facets } = rt;
  return {
    text,
    facets,
    $type: "app.bsky.feed.post",
    createdAt: new Date().toISOString(),
    embed: {
      $type: "app.bsky.embed.recordWithMedia",
      ...imageEmbed,
    },
  };
}

/** Upload an image from a URL to Bluesky. */
async function uploadImageFromFilePath(
  agent: AtpAgent,
  filePath: string
): Promise<BlobRef> {
  const imageBuff = fs.readFileSync(filePath);
  const imgU8 = new Uint8Array(imageBuff);

  const dstResp = await agent.uploadBlob(imgU8);
  if (!dstResp.success) {
    throw new Error("Failed to upload image");
  }
  return dstResp.data.blob;
}
