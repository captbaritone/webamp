#!/usr/bin/env node
const path = require("path");
const fs = require("fs");
const argv = require("yargs").argv;
const fetchInternetArchiveMetadata = require("./tasks/fetchInternetArchiveMetadata");
const ensureInternetArchiveItemsIndexByMd5 = require("./tasks/ensureInternetArchiveItemsIndexByMd5");
const logger = require("./logger");
const DiscordWinstonTransport = require("./DiscordWinstonTransport");
const Skins = require("./data/skins");
const db = require("./db");
const Discord = require("discord.js");
const tweet = require("./tasks/tweet");
const { addSkinFromBuffer } = require("./addSkin");

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
