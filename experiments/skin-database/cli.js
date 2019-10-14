#!/usr/bin/env node
const argv = require("yargs").argv;
const fetchInternetArchiveMetadata = require("./tasks/fetchInternetArchiveMetadata");
const ensureInternetArchiveItemsIndexByMd5 = require("./tasks/ensureInternetArchiveItemsIndexByMd5");
const path = require("path");
const logger = require("./logger");
const DiscordWinstonTransport = require("./DiscordWinstonTransport");
const Skins = require("./data/skins");
const db = require("./db");
const Discord = require("discord.js");
const config = require("./config");

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
  const client = new Discord.Client();
  // The Winston transport logs in the client.
  await DiscordWinstonTransport.addToLogger(client, logger);
  const webhook = await client.fetchWebhook(
    config.discordWebhookId,
    config.discordWebhookToken
  );
  switch (argv._[0]) {
    case "tweet":
      const tweetableSkin = await Skins.getSkinToTweet();
      if (tweetableSkin == null) {
        webhook.send(
          "Oops! I ran out of skins to tweet. Could someone please `!review` some more?"
        );
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
          // "--dry",
        ]
      );
      webhook.send(output.trim());
      await Skins.markAsTweeted(md5);
      const remainingSkinCount = await Skins.getTweetableSkinCount();
      if (remainingSkinCount < 10) {
        webhook.send(
          `Only ${remainingSkinCount} approved skins left. Could someone please \`!review\` some more?`
        );
      }
      logger.info("Tweeted a skin", {
        md5,
        filename,
        url: output.trim(),
      });
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
    default:
      console.log(`Unknown command ${argv._[0]}`);
  }
  logger.close();
  client.destroy();
  await db.close();
}

main();
