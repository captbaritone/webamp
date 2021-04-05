import { Router } from "express";
import asyncHandler from "express-async-handler";
import SkinModel from "../data/SkinModel";
import * as Skins from "../data/skins";
import {
  DISCORD_CLIENT_ID,
  DISCORD_REDIRECT_URL,
  LOGIN_REDIRECT_URL,
} from "../config";
import S3 from "../s3";
import LRU from "lru-cache";
import { MuseumPage } from "../data/skins";
import { processUserUploads } from "./processUserUploads";
import { auth } from "./auth";
import * as Parallel from "async-parallel";

const router = Router();

const options = {
  max: 100,
  maxAge: 1000 * 60 * 60,
};
let skinCount: number | null = null;
const cache = new LRU<string, MuseumPage>(options);

router.get(
  "/auth/",
  asyncHandler(async (req, res) => {
    res.redirect(
      302,
      `https://discord.com/api/oauth2/authorize?client_id=${encodeURIComponent(
        DISCORD_CLIENT_ID
      )}&redirect_uri=${encodeURIComponent(
        DISCORD_REDIRECT_URL
      )}&response_type=code&scope=identify%20guilds`
    );
  })
);

router.get(
  "/authed/",
  asyncHandler(async (req, res) => {
    res.json({ username: req.ctx.username });
  })
);

router.get(
  "/auth/discord",
  asyncHandler(async (req, res) => {
    const code = req.query.code as string | undefined;

    if (code == null) {
      res.status(400).send({ message: "Expected to get a code" });
      return;
    }
    const username = await auth(code);
    if (username == null) {
      res.status(400).send({ message: "Invalid code" });
      return;
    }
    req.session.username = username;

    // TODO: What about dev?
    res.redirect(302, LOGIN_REDIRECT_URL);
  })
);

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
    await Parallel.each(
      Object.entries(payload),
      async ([md5, filename]) => {
        if (!(await SkinModel.exists(req.ctx, md5))) {
          const id = await Skins.recordUserUploadRequest(md5, filename);
          const url = S3.getSkinUploadUrl(md5, id);
          missing[md5] = { id, url };
        }
      },
      5
    );
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

router.get(
  "/skins/:md5/debug",
  asyncHandler(async (req, res) => {
    const { md5 } = req.params;
    const skin = await SkinModel.fromMd5(req.ctx, md5);
    if (skin == null) {
      req.log(`Details for hash "${md5}" NOT FOUND`);
      res.status(404).json();
      return;
    }
    res.json(await skin.debug());
  })
);

function requireAuthed(req, res, next) {
  if (!req.ctx.authed()) {
    res.status(403);
    res.send({ message: "You must be logged in" });
  } else {
    next();
  }
}

router.get(
  "/to_review",
  requireAuthed,
  asyncHandler(async (req, res) => {
    const { filename, md5 } = await Skins.getSkinToReview();
    res.json({ filename, md5 });
  })
);

router.post(
  "/skins/:md5/reject",
  requireAuthed,
  asyncHandler(async (req, res) => {
    const { md5 } = req.params;
    req.log(`Rejecting skin with hash "${md5}"`);
    const skin = await SkinModel.fromMd5(req.ctx, md5);
    if (skin == null) {
      res.status(404).send("Skin not found");
      return;
    }
    await Skins.reject(req.ctx, md5);
    req.notify({ type: "REJECTED_SKIN", md5 });
    res.send({ message: "The skin has been rejected." });
  })
);

router.post(
  "/skins/:md5/approve",
  requireAuthed,
  asyncHandler(async (req, res) => {
    const { md5 } = req.params;
    req.log(`Approving skin with hash "${md5}"`);
    const skin = await SkinModel.fromMd5(req.ctx, md5);
    if (skin == null) {
      res.status(404).send("Skin not found");
      return;
    }
    await Skins.approve(req.ctx, md5);
    req.notify({ type: "APPROVED_SKIN", md5 });
    res.send({ message: "The skin has been approved." });
  })
);

// Unlike /report, this marks the skin NSFW right away without sending to
// Discord. Because of this, it requires auth.
router.post(
  "/skins/:md5/nsfw",
  requireAuthed,
  asyncHandler(async (req, res) => {
    const { md5 } = req.params;
    req.log(`Approving skin with hash "${md5}"`);
    const skin = await SkinModel.fromMd5(req.ctx, md5);
    if (skin == null) {
      res.status(404).send("Skin not found");
      return;
    }
    await Skins.markAsNSFW(req.ctx, md5);
    req.notify({ type: "MARKED_SKIN_NSFW", md5 });
    res.send({ message: "The skin has been marked as NSFW." });
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
    processUserUploads(req.notify);
    res.json({ done: true });
  })
);

router.get(
  "/approved",
  asyncHandler(async (req, res) => {
    const approved = await Skins.getAllApproved();
    res.json(approved);
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
