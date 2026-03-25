import * as Skins from "../data/skins";
import {
  AppBskyEmbedImages,
  AppBskyFeedPost,
  AppBskyRichtextFacet,
  AtpAgent,
  BlobRef,
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

  const facets: AppBskyRichtextFacet.Main[] = [
    {
      $type: "app.bsky.richtext.facet",
      index: {
        byteStart: 0,
        byteEnd: name.length,
      },
      features: [
        {
          $type: "app.bsky.richtext.facet#link",
          uri: url,
        },
      ],
    },
  ];

  const postData = await buildPost(
    `${name} via the Winamp Skin Museum`,
    facets,
    buildImageEmbed(blob, width * 2, height * 2)
  );
  const postResp = await agent.post(postData);

  const postId = postResp.cid;
  const postUrl = postResp.uri;

  await Skins.markAsPostedToBlueSky(md5, postId, postUrl);

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
  text: string,
  facets: AppBskyRichtextFacet.Main[],
  imageEmbed: AppBskyEmbedImages.Main
): Promise<AppBskyFeedPost.Record> {
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
