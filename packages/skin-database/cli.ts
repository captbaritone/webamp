#!/usr/bin/env node
import fs from "fs";
import { knex } from "./db";
import { argv } from "yargs";
import logger from "./logger";
import DiscordWinstonTransport from "./DiscordWinstonTransport";
import * as Skins from "./data/skins";
import Discord, { RichEmbed, TextChannel } from "discord.js";
import { tweet } from "./tasks/tweet";
import { addSkinFromBuffer } from "./addSkin";
import * as SkinHash from "./skinHash";
import * as Analyser from "./analyser";
import { searchIndex } from "./algolia";
import { scrapeLikeData } from "./tasks/scrapeLikes";
import { screenshot } from "./tasks/screenshotSkin";
import Shooter from "./shooter";
import UserContext from "./data/UserContext";
import { integrityCheck } from "./tasks/integrityCheck";
import { ensureWebampLinks, syncWithArchive } from "./tasks/syncWithArchive";
import { syncFromArchive } from "./tasks/syncFromArchive";

async function main() {
  const client = new Discord.Client();
  // The Winston transport logs in the client.
  await DiscordWinstonTransport.addToLogger(client, logger);

  try {
    switch (argv._[0]) {
      case "ensure-webamp-links":
        await ensureWebampLinks();
        break;
      case "sync-from-ia":
        await syncFromArchive();
        break;
      case "sync-ia":
        await syncWithArchive();
        break;
      case "integity-check":
        await integrityCheck();
        break;
      case "screenshot": {
        const md5 = argv._[1] || (await Skins.getSkinToShoot());
        if (md5 == null) {
          return;
        }
        await Shooter.withShooter(async (shooter: Shooter) => {
          await screenshot(md5, shooter);
        });
        console.log("Screenshot update complete.");
        break;
      }

      case "reject": {
        const md5 = argv._[1];
        if (md5 == null) {
          return;
        }
        await Skins.reject(new UserContext("CLI"), md5);
        break;
      }
      case "screenshots": {
        let count = 1000;
        await Shooter.withShooter(async (shooter: Shooter) => {
          while (count--) {
            const md5 = await Skins.getSkinToShoot();
            if (md5 == null) {
              break;
            }
            await screenshot(md5, shooter);
          }
        });
        break;
      }
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
        // eslint-disable-next-line no-inner-declarations
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
    logger.close();
    client.destroy();
  }
}

main();
