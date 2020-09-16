#!/usr/bin/env node
import path from "path";
import fs from "fs";
import { db, knex } from "./db";
import { argv } from "yargs";
import logger from "./logger";
import DiscordWinstonTransport from "./DiscordWinstonTransport";
import * as Skins from "./data/skins";
import Discord from "discord.js";
import { tweet } from "./tasks/tweet";
import { addSkinFromBuffer } from "./addSkin";
import { PROJECT_ROOT } from "./config";

async function main() {
  const client = new Discord.Client();
  // The Winston transport logs in the client.
  await DiscordWinstonTransport.addToLogger(client, logger);

  try {
    switch (argv._[0]) {
      case "tweet":
        await tweet(client, null);
        break;
      case "metadata": {
        const hash = argv._[1];
        console.log(Skins.getInternetArchiveUrl(hash));
        break;
      }
      case "skin": {
        const hash = argv._[1];
        logger.info({ hash });
        console.log(await Skins.getSkinByMd5_DEPRECATED(hash));
        break;
      }

      case "stats": {
        console.log(await Skins.getStats());
        break;
      }
      case "add": {
        const filePath = argv._[1];
        const buffer = fs.readFileSync(filePath);
        console.log(await addSkinFromBuffer(buffer, filePath, "cli-user"));
        break;
      }
      case "index": {
        console.log(await Skins.updateSearchIndex(argv._[1]));
        break;
      }
      case "tweet-data": {
        // From running `tweet.py sort`
        const file = fs.readFileSync(
          path.join(PROJECT_ROOT, "../tweetBot/likes.txt"),
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
    knex.destroy();
    db.close();
    logger.close();
    client.destroy();
  }
}

main();
