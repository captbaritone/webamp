#!/usr/bin/env node
const argv = require("yargs").argv;
const findTweetableSkin = require("./tasks/findTweetableSkins");
const fetchInternetArchiveMetadata = require("./tasks/fetchInternetArchiveMetadata");
const ensureInternetArchiveItemsIndexByMd5 = require("./tasks/ensureInternetArchiveItemsIndexByMd5");
const path = require("path");
const logger = require("./logger");
const Skins = require("./data/skins");
const db = require("./db");
const S3 = require("./s3");

const { spawn } = require("child_process");

function spawnPromise(command, args) {
  return new Promise((resolve, reject) => {
    const ls = spawn(command, args);
    let stdout = "";
    let stderr = "";

    ls.stdout.on("data", data => {
      stdout += data;
    });

    ls.stderr.on("data", data => {
      stderr += data;
      console.log(`stderr: ${data}`);
    });

    ls.on("close", code => {
      console.log(`child process exited with code ${code}`);
      if (code === 0) {
        resolve(stdout);
      } else {
        reject({ stdout, stderr });
      }
    });
  });
}

async function main() {
  switch (argv._[0]) {
    case "tweet":
      const tweetableSkin = await findTweetableSkin();
      if(tweetableSkin == null) {
        logger.info("Could not find a skin to tweet");
        break;
      }
      const { md5, filename } = tweetableSkin;
      const output = await spawnPromise(
        path.resolve(__dirname, "../tweetBot/tweet.py"),
        [
          "tweet",
          md5,
          filename,
          //, "--dry"
        ]
      );
      S3.markAsTweeted(md5);
      logger.info("Tweeted a skin", { md5, filename, output });
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
      console.log(await Skins.getSkinByMd5(hash));
      break;
    }
    default:
      console.log(`Unknown command ${argv._[0]}`);
  }
  await db.close();
}

main();
