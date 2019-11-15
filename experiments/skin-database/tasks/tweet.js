const path = require("path");
const logger = require("../logger");
const Skins = require("../data/skins");
const { TWEET_BOT_CHANNEL_ID } = require("../config");

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

async function tweet(discordClient) {
  const tweetBotChannel = discordClient.channels.get(TWEET_BOT_CHANNEL_ID);
  if (tweetBotChannel == null) {
    throw new Error("Could not connect to the #tweet-bot channel");
  }
  const tweetableSkin = await Skins.getSkinToTweet();
  if (tweetableSkin == null) {
    await tweetBotChannel.send(
      "Oops! I ran out of skins to tweet. Could someone please `!review` some more?"
    );
    logger.info("Could not find a skin to tweet");
    return;
  }

  const { md5, filename } = tweetableSkin;
  const output = await spawnPromise(
    path.resolve(__dirname, "../../tweetBot/tweet.py"),
    [
      "tweet",
      md5,
      filename,
      // "--dry",
    ]
  );
  await Skins.markAsTweeted(md5);
  await tweetBotChannel.send(output.trim());
  const remainingSkinCount = await Skins.getTweetableSkinCount();
  if (remainingSkinCount < 10) {
    await tweetBotChannel.send(
      `Only ${remainingSkinCount} approved skins left. Could someone please \`!review\` some more?`
    );
  }
  logger.info("Tweeted a skin", {
    md5,
    filename,
    url: output.trim(),
  });
}

module.exports = tweet;
