#!/usr/bin/env node
import fs from "fs";
import { knex } from "./db";
import { argv } from "yargs";
import logger from "./logger";
import DiscordWinstonTransport from "./DiscordWinstonTransport";
import * as Skins from "./data/skins";
import Discord from "discord.js";
import { tweet } from "./tasks/tweet";
import { addSkinFromBuffer } from "./addSkin";
import { searchIndex } from "./algolia";
import { scrapeLikeData } from "./tasks/scrapeLikes";
import UserContext from "./data/UserContext";
import { integrityCheck } from "./tasks/integrityCheck";
import { ensureWebampLinks, syncWithArchive } from "./tasks/syncWithArchive";
import { syncFromArchive } from "./tasks/syncFromArchive";
import { getSkinsToRefresh, refreshSkins } from "./tasks/refresh";
import { processUserUploads } from "./api/processUserUploads";
import DiscordEventHandler from "./api/DiscordEventHandler";
import SkinModel from "./data/SkinModel";
import { chunk } from "./utils";
import rl from "readline";

async function main() {
  const client = new Discord.Client();
  // The Winston transport logs in the client.
  await DiscordWinstonTransport.addToLogger(client, logger);
  const ctx = new UserContext("CLI");
  const handler = new DiscordEventHandler();

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
      case "reject": {
        const md5 = argv._[1];
        if (md5 == null) {
          return;
        }
        await Skins.reject(new UserContext("CLI"), md5);
        break;
      }
      case "refresh": {
        const md5 = argv._[1];
        if (md5 != null) {
          const skin = await SkinModel.fromMd5(ctx, md5);
          if (skin == null) {
            throw new Error(`Could not find skin ${md5}`);
          }
          refreshSkins([skin]);
        } else {
          const toRefresh = await getSkinsToRefresh(ctx, 100);

          const chunks = chunk(toRefresh, toRefresh.length / 3);

          await Promise.all(chunks.map(refreshSkins));
        }
        break;
      }
      case "nested": {
        const nested = await knex("archive_files")
          .select("archive_files.skin_md5", "file_name")
          .leftJoin("skins", "skins.md5", "=", "file_md5")
          .where(function () {
            //this.where("file_name", "like", "%.wsz");
            this.orWhere("file_name", "like", "%.zip");
          })
          .where("skins.md5", "IS", null);

        for (const row of nested) {
          const url = `https://zip-worker.jordan1320.workers.dev/zip/${
            row.skin_md5
          }/${encodeURI(row.file_name)}`;
          console.log(url);
        }
        /*
        const query = `SELECT skin_md5, error
        FROM refreshes
        WHERE
            error LIKE "Not a skin%";`;
        const rows = await knex.raw(query);
        for (const row of rows) {
          const files = await knex("archive_files")
            .where("skin_md5", row.skin_md5)
            .select();
          console.log("Download:", Skins.getSkinUrl(row.skin_md5));
          // const url = `;
          console.table(
            files.map((f) => ({
              file_name: f.file_name,
              url: `https://zip-worker.jordan1320.workers.dev/zip/${
                row.skin_md5
              }/${encodeURI(f.file_name)}`,
            })),
            ["file_name", "url"]
          );
          const answer = await ask("skip (s), delete (d)");
          switch (answer) {
            case "s":
              break;
            case "d":
              await Skins.deleteSkin(row.skin_md5);
          }
        }
        */
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
      case "process": {
        const handler = new DiscordEventHandler();
        await processUserUploads((event) => handler.handle(event));
        handler.dispose();
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
    await handler.dispose();
  }
}

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

main();
