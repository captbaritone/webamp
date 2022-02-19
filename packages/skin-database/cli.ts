#!/usr/bin/env node
import fs from "fs";
import { knex } from "./db";
import logger from "./logger";
import * as Skins from "./data/skins";
import Discord from "discord.js";
import { tweet } from "./tasks/tweet";
import { insta } from "./tasks/insta";
import md5Buffer from "md5";
import { addSkinFromBuffer } from "./addSkin";
import { scrapeLikeData } from "./tasks/scrapeLikes";
import { followerCount, popularTweets } from "./tasks/tweetMilestones";
import UserContext from "./data/UserContext";
import {
  integrityCheck,
  checkInternetArchiveMetadata,
} from "./tasks/integrityCheck";
import {
  ensureWebampLinks,
  findItemsMissingImages,
  syncWithArchive,
  uploadScreenshotIfSafe,
} from "./tasks/syncToArchive";
import { fillMissingMetadata, syncFromArchive } from "./tasks/syncFromArchive";
import { refreshSkins } from "./tasks/refresh";
import {
  reprocessFailedUploads,
  processUserUploads,
} from "./api/processUserUploads";
import DiscordEventHandler from "./api/DiscordEventHandler";
import SkinModel from "./data/SkinModel";
import _temp from "temp";
import Shooter from "./shooter";
import { program } from "commander";

async function withHandler(
  cb: (handler: DiscordEventHandler) => Promise<void>
) {
  const handler = new DiscordEventHandler();
  try {
    await cb(handler);
  } finally {
    await handler.dispose();
  }
}

async function withDiscordClient(
  cb: (handler: Discord.Client) => Promise<void>
) {
  const client = new Discord.Client();
  try {
    await cb(client);
  } finally {
    client.destroy();
  }
}

const temp = _temp.track();

/**
 * CLI starts here.
 */
program
  .name("skins-database")
  .description("CLI for interacting with the skins database");

/**
 * Social Media Commands
 */

program
  .command("share")
  .description(
    "Share a skin on Twitter and Instagram. If no md5 is " +
      "given, random approved skins are shared."
  )
  .argument("[md5]", "md5 of the skin to share")
  .option("-t, --twitter", "Share on Twitter")
  .option("-i, --instagram", "Share on Instagram")
  .action(async (md5, { twitter, instagram }) => {
    if (!twitter && !instagram) {
      throw new Error("Expected at least one of --twitter or --instagram");
    }
    await withDiscordClient(async (client) => {
      if (twitter) {
        await tweet(client, md5);
      }
      if (instagram) {
        await insta(client, md5);
      }
    });
  });

/**
 * Operate on individual skins.
 */
program
  .command("skin")
  .description("Operate on a skngle skin from the database.")
  .argument("<md5>", "md5 of the skin to operate on")
  .option(
    "--delete",
    "Delete a skin from the database, including its S3 files " +
      "CloudFlare cache and seach index entries."
  )
  .option("--index", "Update the seach index for a skin.")
  .option(
    "--refresh",
    "Retake the screenshot of a skin and update the database."
  )
  .option("--reject", 'Give a skin a "rejected" review.')
  .action(async (md5, { delete: del, index, refresh, reject }) => {
    const ctx = new UserContext("CLI");
    if (del) {
      await Skins.deleteSkin(md5);
    }
    if (index) {
      console.log(await Skins.updateSearchIndex(md5));
    }
    if (refresh) {
      const skin = await SkinModel.fromMd5Assert(ctx, md5);
      await refreshSkins([skin]);
    }
    if (reject) {
      await Skins.reject(ctx, md5);
    }
  });

program
  .command("file")
  .description("Operate on a skin file.")
  .argument("<file-path>", "Path to the skin to add to the database.")
  .option("--add", "Add this skin to the database.")
  .option(
    "--screenshot",
    "Take (or retake) a screenshot of the given skin file."
  )
  .action(async (filePath, { add, screenshot }) => {
    if (add) {
      const buffer = fs.readFileSync(filePath);
      console.log(await addSkinFromBuffer(buffer, filePath, "cli-user"));
    }
    if (screenshot) {
      const buffer = fs.readFileSync(filePath);
      const md5 = md5Buffer(buffer);
      const tempPath = temp.path({ suffix: ".png" });
      await Shooter.withShooter(
        async (shooter: Shooter) => {
          await shooter.takeScreenshot(buffer, tempPath, { md5 });
        },
        (message: string) => console.log(message)
      );
      console.log("Screenshot complete", tempPath);
    }
  });

/**
 * Internet Archive Commands
 */
program
  .command("ia")
  .description("Interact with the Internet Archive API.")
  .option(
    "--fetch-metadata <count>",
    "Fetch missing metadata for <count> items from the Internet " +
      "Archive. Currently it only fetches missing metadata. In the " +
      "future it could refresh stale metadata."
  )
  .option(
    "--fetch-items",
    "Seach the Internet Archive for items that we don't know about" +
      "and add them to our database."
  )
  .option(
    "--webamp-links",
    "Seach the Internet Archive for items missing a Webamp link" +
      "and add them."
  )
  .option(
    "--upload-new",
    "Find newly uploaded skins, and publish them to the Internet Archive."
  )
  .action(async ({ metadata, webampLinks, fetchItems, upload }) => {
    if (metadata) {
      await fillMissingMetadata(Number(metadata || 1000));
    }
    if (webampLinks) {
      await ensureWebampLinks();
    }
    if (fetchItems) {
      await syncFromArchive();
    }
    if (upload) {
      await withHandler(async (handler) => {
        await syncWithArchive(handler);
      });
    }
  });

/**
 * Investigation and recovery commands
 */

program
  .command("stats")
  .description(
    "Report information about skins in the database. " +
      "Identical to `!stats` in Discord."
  )
  .action(async () => {
    console.table([await Skins.getStats()]);
  });

program
  .command("process-uploads")
  .description("Process any unprocessed user uploads.")
  .option("--errored", "Reprocess errored uploads.")
  .action(async ({ errored }) => {
    await withHandler(async (handler) => {
      if (!errored) {
        await processUserUploads((event) => handler.handle(event));
      } else {
        await reprocessFailedUploads(handler);
      }
    });
  });

program
  .command("integrity-check")
  .description("Perfrom a non-exhaustive list of database consistency checks")
  .option(
    "--ia",
    "Check the Internet Archive for items that are missing files."
  )
  .action(async ({ ia }) => {
    if (ia) {
      await checkInternetArchiveMetadata();
    } else {
      await integrityCheck();
    }
  });

/**
 * Scrape Twitter Commands
 */

program
  .command("scrape-twitter")
  .description("Scrape Twitter in various ways.")
  .option(
    "--likes",
    "Scrape @winampskins tweets for like and retweet counts, " +
      "and update the database."
  )
  .option(
    "--milestones",
    "Check the most recent @winampskins tweets to see if they have " +
      "passed a milestone. If so, notify the Discord channel."
  )
  .option(
    "--followers",
    "Check if @winampskins has passed a follower count milestone. " +
      "If so, notify the Discord channel."
  )
  .action(async ({ likes, milestones, followers }) => {
    if (likes) {
      await scrapeLikeData();
    }
    if (milestones) {
      await withHandler(async (handler) => {
        await popularTweets(handler);
      });
    }
    if (followers) {
      await withHandler(async (handler) => {
        await followerCount(handler);
      });
    }
  });

/**
 * Commands thare are still in development
 */

program
  .command("dev")
  .description("Grab bag of commands that don't have a place to live yet")
  .option(
    "--upload-ia-screenshot <md5>",
    "Upload a screenshot of a skin to the skin's Internet Archive itme. " +
      "[[Warning!]] This might result in multiple screenshots on the item."
  )
  .option(
    "--upload-missing-screenshots",
    "Find all IA items that are missing screenshots, and upload the missing ones."
  )
  .action(async ({ uploadIaScreenshot, uploadMissingScreenshots }) => {
    if (uploadIaScreenshot) {
      const md5 = uploadIaScreenshot;
      if (!(await uploadScreenshotIfSafe(md5))) {
        console.log("Did not upload screenshot");
      }
    }
    if (uploadMissingScreenshots) {
      const md5s = await findItemsMissingImages();
      for (const md5 of md5s) {
        if (await uploadScreenshotIfSafe(md5)) {
          console.log("Upladed screenshot for ", md5);
        } else {
          console.log("Did not upload screenshot for ", md5);
        }
      }
    }
  });

async function main() {
  try {
    await program.parseAsync(process.argv);
  } finally {
    knex.destroy();
    logger.close();
  }
}

/*
import rl from "readline";

function ask(question): Promise<string> {
  return new Promise((resolve) => {
    const r = rl.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    r.question(question + "\n", function (answer) {
      r.close();
      resolve(answer);
    });
  });
}
*/

main();
