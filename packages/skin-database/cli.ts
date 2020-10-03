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
import * as SkinHash from "./skinHash";
import * as Analyser from "./analyser";
import { searchIndex } from "./algolia";
import { scrapeLikeData } from "./tasks/scrapeLikes";
// import { checkAir } from "./air";
// import twilio from "twilio";

async function main() {
  const client = new Discord.Client();
  // The Winston transport logs in the client.
  await DiscordWinstonTransport.addToLogger(client, logger);

  try {
    switch (argv._[0]) {
      /*
      case "air":
        const message = await checkAir();
        if (message == null) {
          return;
        }

        const accountSid = "AC6074f98f735253cb970083417419bb33";
        const authToken = "f16cefe5550ef4a9a149b62fa770aefd";
        const client = require("twilio")(accountSid, authToken);

        const result = await client.messages.create({
          body: message,
          from: "+12056066323",
          to: "+17079710972",
        });

        const result2 = await client.messages.create({
          body: message,
          from: "+12056066323",
          to: "+8059014147",
        });
        console.log(result2);

        break;
        */
      case "readme": {
        const rows = await knex.raw(
          'SELECT md5 FROM files LEFT JOIN skins on skins.md5 = files.skin_md5 WHERE source_attribution = "Web API" AND readme_text IS NULL;'
        );

        const hashes = rows.map(({ md5 }) => md5);
        for (const hash of hashes) {
          console.log(`Setting readme for ${hash}`);
          await Analyser.setReadmeForSkin(hash);
        }
        break;
      }
      case "content-hash": {
        const rows = await knex("skins")
          .leftJoin("archive_files", "archive_files.skin_md5", "=", "skins.md5")
          .whereNot("skin_md5", null)
          .where("content_hash", null)
          // This is just because our URL schema sucks
          .where("skin_type", Skins.SKIN_TYPE.CLASSIC)
          .groupBy("md5")
          .select("md5");

        console.log(`Found ${rows.length} rows`);

        for (const { md5 } of rows) {
          const hash = await Skins.setContentHash(md5);
          console.log(hash);
        }
        break;
      }
      case "hash": {
        const rows = await knex("skins")
          .leftJoin("archive_files", "archive_files.skin_md5", "=", "skins.md5")
          .where("skin_md5", null)
          // This is just because our URL schema sucks
          .where("skin_type", Skins.SKIN_TYPE.CLASSIC)
          .select("md5");

        for (const { md5 } of rows) {
          console.log(md5);
          try {
            await SkinHash.setHashesForSkin(md5);
            await Skins.setContentHash(md5);
          } catch (e) {
            console.error(e);
          }
        }
        break;
      }
      case "tweet": {
        console.log("tweet");
        await tweet(client, null);
        break;
      }
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
      case "delete": {
        const md5 = argv._[1];
        await Skins.deleteSkin(md5);
        break;
      }
      case "index": {
        console.log(await Skins.updateSearchIndex(argv._[1]));
        break;
      }
      case "add-missing-indexes": {
        async function indexPage(pageNumber: number): Promise<void> {
          const page = await Skins.getMuseumPage({
            offset: pageNumber * 500,
            first: 500,
          });
          const toCheck = page.map(({ md5 }) => md5);
          const found = await searchIndex.getObjects(toCheck, {
            attributesToRetrieve: ["objectId"],
          });
          // console.log({ toCheck, found });
          const missing = toCheck.filter((_md5, i) => {
            return found.results[i] == null;
          });

          console.log(
            `Found ${missing.length} missing skins on page ${pageNumber}`
          );
          console.log(await Skins.updateSearchIndexs(missing));
        }

        for (let i = 0; i < 140; i++) {
          await indexPage(i);
        }
        break;
      }
      case "tweet-data": {
        await scrapeLikeData();
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
