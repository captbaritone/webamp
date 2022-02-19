import * as Skins from "../data/skins";
import * as S3 from "../s3";
import {
  INSTAGRAM_ACCESS_TOKEN,
  INSTAGRAM_ACCOUNT_ID,
  TWEET_BOT_CHANNEL_ID,
} from "../config";
import { Client } from "discord.js";
import sharp from "sharp";
import SkinModel from "../data/SkinModel";
import UserContext from "../data/UserContext";
import fetch from "node-fetch";

export async function insta(
  discordClient: Client,
  md5: string | null
): Promise<void> {
  if (md5 == null) {
    md5 = await Skins.getSkinToPostToInstagram();
  }
  if (md5 == null) {
    console.error("No skins to post to instagram");
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

async function createContent(
  imageUrl: string,
  caption: string
): Promise<string> {
  const url = new URL(
    `https://graph.facebook.com/v12.0/${INSTAGRAM_ACCOUNT_ID}/media`
  );
  url.searchParams.set("access_token", INSTAGRAM_ACCESS_TOKEN);
  url.searchParams.set("image_url", imageUrl);
  url.searchParams.set("caption", caption);
  const response = await fetch(url, { method: "POST" });
  if (!response.ok) {
    throw new Error(`API error: ${await response.text()}`);
  }

  console.log("crate content status", response.status);
  const result: { id: string } = await response.json();
  console.log(result);

  return result.id;
}

async function publish(id: string): Promise<string> {
  const url = new URL(
    `https://graph.facebook.com/v12.0/${INSTAGRAM_ACCOUNT_ID}/media_publish`
  );
  url.searchParams.set("access_token", INSTAGRAM_ACCESS_TOKEN);
  url.searchParams.set("creation_id", id);
  //url.searchParams.set("fields", "permalink");

  const response = await fetch(url, { method: "POST" });
  console.log("publish status", response.status);
  if (!response.ok) {
    throw new Error(`API error: ${await response.text()}`);
  }
  const result: { id: string; permalink: string } = await response.json();
  console.log("publish result", result);
  return result.id;
}

async function getPermalink(id: string): Promise<string> {
  const url = new URL(`https://graph.facebook.com/v12.0/${id}`);
  url.searchParams.set("access_token", INSTAGRAM_ACCESS_TOKEN);
  url.searchParams.set("fields", "permalink");

  const response = await fetch(url);
  console.log("permalink status", response.status);
  if (!response.ok) {
    throw new Error(`API error: ${await response.text()}`);
  }
  const result: { id: string; permalink: string } = await response.json();
  console.log("permalink result", result);
  return result.permalink;
}

const PADDING = 100;
const UPSCALE = 4;

async function post(md5: string): Promise<string> {
  const ctx = new UserContext();
  const skin = await SkinModel.fromMd5Assert(ctx, md5);
  const screenshot = await Skins.getScreenshotBuffer(md5);
  const { width, height } = await sharp(screenshot).metadata();

  const targetWidth = width * UPSCALE;
  const targetHeight = height * UPSCALE;

  const dimension = Math.max(targetWidth, targetHeight) + PADDING;

  const paddingX = (dimension - targetWidth) / 2;
  const paddingY = (dimension - targetHeight) / 2;

  const background = { r: 0, g: 0, b: 0, alpha: 255 };

  const image = await sharp(screenshot)
    .resize(targetWidth, targetHeight, {
      kernel: sharp.kernel.nearest,
    })
    .extend({
      top: paddingY,
      bottom: paddingY,
      left: paddingX,
      right: paddingX,
      background,
    })
    .toBuffer();

  const name = await skin.getFileName();

  const text = `${name}
.
.
.
.
.
#winampskins #winamp #nostalgia #napster #skins #windows #nullsoft #digitalart #design #software #ui #uidesign`;
  console.log("Uplaoding to S3");
  const uploadFileName = `${md5}.png`;
  await S3.putTemp(uploadFileName, image);
  console.log("Done uploading to S3");
  const imageUrl = `https://cdn.webampskins.org/temp/${uploadFileName}`;

  console.log("Creating content...");
  const contentId = await createContent(imageUrl, text);

  console.log("Deleting temp file");
  await S3.putTemp(uploadFileName, image);
  console.log("Publishing content...");
  const id = await publish(contentId);

  console.log("Getting permalink");
  const permalink = await getPermalink(id);
  console.log("Permalink", permalink);

  console.log("Marking posted in DB");
  await Skins.markAsPostedToInstagram(md5, id, permalink);

  return permalink;
}
