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
      req.log(`Cache hit for ${key}`);
      res.json({ skinCount, skins: cached });
      return;
    }
    req.log(`Getting offset: ${offset}, first: ${first}`);

    const start = Date.now();
    const skins = await Skins.getMuseumPage({
      offset: Number(offset),
      first: Number(first),
    });
    req.log(`Query took ${(Date.now() - start) / 1000}`);
    req.log(`Cache set for ${key}`);
    cache.set(key, skins);
    res.json({ skinCount, skins });
  })
);

router.post(
  "/skins/get_upload_urls",
  asyncHandler(async (req, res) => {
    const payload = req.body.skins as { [md5: string]: string };
    const missing = {};
    for (const [md5, filename] of Object.entries(payload)) {
      if (!(await SkinModel.exists(req.ctx, md5))) {
        const id = await Skins.recordUserUploadRequest(md5, filename);
        const url = S3.getSkinUploadUrl(md5, id);
        missing[md5] = { id, url };
      }
    }
    res.json(missing);
  })
);

router.post(
  "/skins/status",
  asyncHandler(async (req, res) => {
    const statuses = await Skins.getUploadStatuses(req.body.hashes);
    res.json(statuses);
  })
);

router.get(
  "/skins/:md5",
  asyncHandler(async (req, res) => {
    const { md5 } = req.params;
    const skin = await SkinModel.fromMd5(req.ctx, md5);
    if (skin == null) {
      req.log(`Details for hash "${md5}" NOT FOUND`);
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

router.post(
  "/skins/:md5/report",
  asyncHandler(async (req, res) => {
    const { md5 } = req.params;
    req.log(`Reporting skin with hash "${md5}"`);
    const skin = await SkinModel.fromMd5(req.ctx, md5);
    if (skin == null) {
      throw new Error(`Cold not locate as skin with md5 ${md5}`);
    }
    req.notify({ type: "REVIEW_REQUESTED", md5 });
    res.send("The skin has been reported and will be reviewed shortly.");
  })
);

async function reportSkinUpload(result: AddResult, dest: TextChannel) {
  if (result.status === "ADDED") {
    // await new Promise((resolve) => setTimeout(resolve, 3000));
    if (result.skinType === "CLASSIC") {
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
    // Don't await, just kick off the task.
    processesUserUploads();
    res.json({ done: true });
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
