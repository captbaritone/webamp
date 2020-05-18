#!/usr/bin/env node
import path from "path";
import fs from "fs";
import { argv } from "yargs";
import fetchInternetArchiveMetadata from "./tasks/fetchInternetArchiveMetadata";
import ensureInternetArchiveItemsIndexByMd5 from "./tasks/ensureInternetArchiveItemsIndexByMd5";
import logger from "./logger";
import DiscordWinstonTransport from "./DiscordWinstonTransport";
import * as Skins from "./data/skins";
import db from "./db";
import Discord from "discord.js";
import { tweet } from "./tasks/tweet";
import { addSkinFromBuffer } from "./addSkin";

async function main() {
  const client = new Discord.Client();
  // The Winston transport logs in the client.
  await DiscordWinstonTransport.addToLogger(client, logger);

  try {
    switch (argv._[0]) {
      case "image-hash":
        const hashes = new Map();

        fs.readFileSync(path.join(__dirname, "./hash.txt"), "utf8")
          .split("\n")
          .forEach((line) => {
            const [md5, imgHash] = line.split(" ");
            hashes.set(md5, imgHash);
          });

        for (const [md5, imgHash] of hashes.entries()) {
          await Skins.setImageHash(md5, imgHash);
          process.stderr.write(".");
        }
        break;

      case "tweet":
        await tweet(client);
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
      case "reconcile": {
        await Skins.reconcile();
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
