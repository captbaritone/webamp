import * as Skins from "../data/skins";
import Mastodon from "mastodon-api";
import { TWEET_BOT_CHANNEL_ID, MASTODON_ACCESS_TOKEN } from "../config";
import { Client } from "discord.js";
import sharp from "sharp";
import SkinModel from "../data/SkinModel";
import UserContext from "../data/UserContext";
import { withBufferAsTempFile } from "../utils";
import fs from "fs";

export async function postToMastodon(
  discordClient: Client,
  md5: string | null
): Promise<void> {
  if (md5 == null) {
    md5 = await Skins.getSkinToPostToMastodon();
  }
  if (md5 == null) {
    console.error("No skins to post to mastodon");
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

  const status = `${name}\n\n${url}`; // TODO: Should we add hashtags?

  const API_URL = "https://botsin.space/api/v1/";

  // Does file need to be a readStream?
  const M = new Mastodon({
    access_token: MASTODON_ACCESS_TOKEN,
    timeout_ms: 60 * 1000, // optional HTTP request timeout to apply to all requests.
    api_url: API_URL, // optional, defaults to https://mastodon.social/api/v1/
  });

  const { resp, data } = await withBufferAsTempFile(
    image,
    screenshotFileName,
    async (filePath) => {
      return M.post("media", {
        file: fs.createReadStream(filePath),
        focus: "0,1",
      });
    }
  );

  if (resp.statusCode != 200) {
    console.log(JSON.stringify(resp, null, 2));
    console.log("data", data);
    throw new Error(
      `Failed to upload media. Got status code ${resp.statusCode}`
    );
  }
  const result = await M.post("statuses", { status, media_ids: [data.id] });

  const postId = result.data.id;
  const postUrl = result.data.url;

  await Skins.markAsPostedToMastodon(md5, postId, postUrl);

  // return permalink;
  return postUrl;
}
