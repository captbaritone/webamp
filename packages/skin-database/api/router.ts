import { Router } from "express";
import asyncHandler from "express-async-handler";
import SkinModel from "../data/SkinModel";
import * as Skins from "../data/skins";
import S3 from "../s3";
import Discord, { TextChannel } from "discord.js";
import * as Config from "../config";
import * as DiscordUtils from "../discord-bot/utils";
import LRU from "lru-cache";
import { addSkinFromBuffer, Result as AddResult } from "../addSkin";
import { MuseumPage } from "../data/skins";

const router = Router();

const options = {
  max: 100,
  maxAge: 1000 * 60 * 60,
};
let skinCount: number | null = null;
const cache = new LRU<string, MuseumPage>(options);

router.get(
  "/skins/",
  asyncHandler(async (req, res) => {
    if (skinCount == null) {
      skinCount = await Skins.getClassicSkinCount();
    }
    const { offset = 0, first = 100 } = req.query;
    const key = req.originalUrl;
    const cached = cache.get(key);
    if (cached != null) {
      console.log(`Cache hit for ${key}`);
      res.json({ skinCount, skins: cached });
      return;
    }
    console.log(`Getting offset: ${offset}, first: ${first}`);

    const start = Date.now();
    const skins = await Skins.getMuseumPage({
      offset: Number(offset),
      first: Number(first),
    });
    console.log(`Query took ${(Date.now() - start) / 1000}`);
    console.log(`Cache set for ${key}`);
    cache.set(key, skins);
    res.json({ skinCount, skins });
  })
);

router.post(
  "/skins/missing",
  asyncHandler(async (req, res) => {
    console.log("Checking for missing skins.");
    const missing: string[] = [];
    const found: string[] = [];
    for (const md5 of req.body.hashes as string[]) {
      if (!(await SkinModel.exists(req.ctx, md5))) {
        missing.push(md5);
      } else {
        found.push(md5);
      }
    }
    console.log(
      `${found.length} skins are found and ${missing.length} are missing.`
    );
    res.json({ missing, found });
  })
);

router.post(
  "/skins/get_upload_urls",
  asyncHandler(async (req, res) => {
    console.log("Checking which skins can upload.");
    const payload = req.body.skins as { [md5: string]: string };
    const missing = {};
    for (const [md5, filename] of Object.entries(payload)) {
      if (!(await SkinModel.exists(req.ctx, md5))) {
        const id = await Skins.recordUserUploadRequest(md5, filename);
        const url = S3.getSkinUploadUrl(md5, id);
        missing[md5] = { id, url };
      }
    }
    console.log({ missing });
    res.json(missing);
  })
);

router.post(
  "/skins/status",
  asyncHandler(async (req, res) => {
    console.log("Checking status of uploaded skins.");
    const statuses = await Skins.getUploadStatuses(req.body.hashes);
    res.json(statuses);
  })
);

router.get(
  "/skins/:md5",
  asyncHandler(async (req, res) => {
    const { md5 } = req.params;
    console.log(`Details for hash "${md5}"`);
    const skin = await SkinModel.fromMd5(req.ctx, md5);
    if (skin == null) {
      console.log(`Details for hash "${md5}" NOT FOUND`);
      res.status(404).json();
      return;
    }
    res.json({
      md5: skin.getMd5(),
      nsfw: await skin.getIsNsfw(),
      fileName: await skin.getFileName(),
    });
  })
);

// TODO: Make this POST
router.post(
  "/skins/:md5/report",
  asyncHandler(async (req, res) => {
    const { md5 } = req.params;
    console.log(`Reporting skin with hash "${md5}"`);
    const client = new Discord.Client();
    await client.login(Config.discordToken);

    const dest = client.channels.get(
      Config.NSFW_SKIN_CHANNEL_ID
    ) as TextChannel | null;

    if (dest == null) {
      throw new Error("Could not get NSFW channel");
    }

    const skin = await SkinModel.fromMd5(req.ctx, md5);
    if (skin == null) {
      throw new Error(`Cold not locate as skin with md5 ${md5}`);
    }

    const tweetStatus = await skin.getTweetStatus();

    if (tweetStatus === "UNREVIEWED") {
      // Don't await
      DiscordUtils.postSkin({
        md5,
        title: (filename) => `Review: ${filename}`,
        dest,
      });
    } else {
      DiscordUtils.sendAlreadyReviewed({ md5, dest });
    }

    res.send("The skin has been reported and will be reviewed shortly.");
  })
);

async function reportSkinUpload(result: AddResult, dest: TextChannel) {
  if (result.status === "ADDED") {
    // await new Promise((resolve) => setTimeout(resolve, 3000));
    if (result.skinType === "CLASSIC") {
      console.log(`Going to post new skin to discord: ${result.md5}`);
      // Don't await
      DiscordUtils.postSkin({
        md5: result.md5,
        title: (filename) => `New skin uploaded: ${filename}`,
        dest,
      });
    } else if (result.skinType === "MODERN") {
      dest.send(`Someone uploaded a new modern skin: ${result.md5}`);
    }
  }
}

router.post(
  "/skins/",
  asyncHandler(async (req, res) => {
    const client = new Discord.Client();
    await client.login(Config.discordToken);
    const dest = client.channels.get(
      Config.SKIN_UPLOADS_CHANNEL_ID
    ) as TextChannel;

    // https://github.com/richardgirges/express-fileupload#usage
    // @ts-ignore
    const files = req.files as {
      [key: string]: { name: string; data: Buffer };
    };
    if (files == null) {
      dest.send("Someone hit the upload endpoint with no files attached.");
      res.status(500).send({ error: "No file supplied" });
      return;
    }
    const upload = files.skin;
    if (upload == null) {
      dest.send("Someone hit the upload endpoint with no files attached.");
      res.status(500).send({ error: "No file supplied" });
      return;
    }
    let result: AddResult;
    try {
      result = await addSkinFromBuffer(upload.data, upload.name, "Web API");
    } catch (e) {
      console.error(e);
      dest.send(`Encountered an error uploading a skin: ${e.message}`);
      res.status(500).send({ error: `Error adding skin: ${e.message}` });
      return;
    }

    await reportSkinUpload(result, dest);
    res.json({ ...result, filename: upload.name });
  })
);

let processing = false;

async function processesUserUploads() {
  // Ensure we only have one worker processing requests.
  if (processing) {
    return;
  }
  processing = true;
  const client = new Discord.Client();
  await client.login(Config.discordToken);
  const dest = client.channels.get(
    Config.SKIN_UPLOADS_CHANNEL_ID
  ) as TextChannel;

  let upload = await Skins.getReportedUpload();
  while (upload != null) {
    try {
      if (upload.id == null || upload.filename == null) {
        throw new Error(
          `Missing value in upload: ${upload.id} ${upload.filename}`
        );
      }
      const buffer = await S3.getUploadedSkin(upload.id);
      const result = await addSkinFromBuffer(
        buffer,
        upload.filename,
        "Web API"
      );
      await Skins.recordUserUploadArchived(upload.id);
      await reportSkinUpload(result, dest);
    } catch (e) {
      dest.send(
        `Encountered an error processing upload ${upload.id}: ${e.message}`
      );
      console.error(e);
      await Skins.recordUserUploadErrored(upload.id);
    }
    upload = await Skins.getReportedUpload();
  }

  processing = false;
}

// User reports that they uploaded a skin
router.post(
  "/skins/:md5/uploaded",
  asyncHandler(async (req, res) => {
    const { md5 } = req.params;
    const id = req.query.id as string;
    if (id == null) {
      throw new Error("Missing upload id");
    }
    // TODO: Validate md5 and id;
    await Skins.recordUserUploadComplete(md5, id);
    console.log(`Reporting skin uploaded: md5: ${md5} id: ${id}`);
    // Don't await, just kick off the task.
    processesUserUploads();
    res.json({ done: true });
  })
);

router.post(
  "/skins/:md5/index",
  asyncHandler(async (req, res) => {
    const { md5 } = req.params;
    console.log(`Going to index hash "${md5}"`);
    const skin = await Skins.updateSearchIndex(md5);
    res.json(skin);
  })
);

router.get(
  "/stylegan.json",
  asyncHandler(async (req, res) => {
    const images = await Skins.getAllClassicScreenshotUrls();
    res.json(images);
  })
);

export default router;
