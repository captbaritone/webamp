#!/usr/bin/env node
import path from "path";
import fs from "fs";
import { argv } from "yargs";
import fetchInternetArchiveMetadata from "./tasks/fetchInternetArchiveMetadata";
import ensureInternetArchiveItemsIndexByMd5 from "./tasks/ensureInternetArchiveItemsIndexByMd5";
import migrate from "./tasks/migrate";
import logger from "./logger";
import DiscordWinstonTransport from "./DiscordWinstonTransport";
import * as Skins from "./data/skins";
import db from "./db";
import Discord from "discord.js";
import { tweet } from "./tasks/tweet";
import { addSkinFromBuffer } from "./addSkin";
import fetch from "node-fetch";
import { analyseBuffer, NsfwPrediction } from "./nsfwImage";

async function main() {
  const client = new Discord.Client();
  // The Winston transport logs in the client.
  await DiscordWinstonTransport.addToLogger(client, logger);

  try {
    switch (argv._[0]) {
      case "tweet":
        await tweet(client, null);
        break;
      case "fetch-metadata":
        console.log("Going to download metadata from the Internet Archive");
        await fetchInternetArchiveMetadata();
        break;

      case "ensure-md5s":
        await ensureInternetArchiveItemsIndexByMd5();
        break;
      case "metadata": {
        const hash = argv._[1];
        console.log(await Skins.getInternetArchiveUrl(hash));
        break;
      }
      case "skin": {
        const hash = argv._[1];
        logger.info({ hash });
        console.log(await Skins.getSkinByMd5(hash));
        break;
      }
      case "add": {
        const filePath = argv._[1];
        const buffer = fs.readFileSync(filePath);
        console.log(await addSkinFromBuffer(buffer, filePath, "cli-user"));
        break;
      }
      case "nsfw": {
        console.log(await Skins.getSkinToReviewForNsfw());
        break;
      }
      case "confirm-nsfw-predictions": {
        const md5s = await Skins.getMissingNsfwPredictions();
        console.log(`Found ${md5s.length} to predict`);

        for (const md5 of md5s) {
          try {
            await Skins.computeAndSetNsfwPredictions(md5);
          } catch (e) {
            console.error(e);
          }
        }
        console.log("Done.");
        break;
      }
      case "migrate": {
        await migrate();
      }
      case "tweet-data": {
        // From running `tweet.py sort`
        const file = fs.readFileSync(
          path.join(__dirname, "../../tweetBot/likes.txt"),
          { encoding: "utf8" }
        );

        const lines = file.split("\n");
        for (const line of lines) {
          if (line == null || line === "") {
            return;
          }
          const [md5, likes, tweetId] = line.split(" ");
          console.log({ md5, likes, tweetId });
          await Skins.setTweetInfo(md5, Number(likes), tweetId);
        }

        console.log("done");
        break;
      }

      default:
        console.log(`Unknown command ${argv._[0]}`);
    }
  } finally {
    logger.close();
    client.destroy();
    await db.close();
  }
}

main();
