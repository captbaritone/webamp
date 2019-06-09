const express = require("express");
const app = express();
const db = require("./db");
const iaItems = db.get("internetArchiveItems");
// const info = require("/Volumes/Mobile Backup/skins/cache/info.json");
const Skins = require("./data/skins");
const port = 3001;

// TODO: Look into 766c4fad9088037ab4839b18292be8b1
// Has huge number of filenames in info.json

app.set("json spaces", 2);

app.get("/", async (req, res) => {
  res.send("Hello World!");
});

app.get("/items/:identifier", async (req, res) => {
  const { identifier } = req.params;
  const item = await iaItems.findOne({ identifier });
  if (item == null) {
    res.status(404).json();
    return;
  }
  res.json(item);
});

app.get("/skins/:md5", async (req, res) => {
  const { md5 } = req.params;
  const skin = await Skins.getSkinByMd5(md5);
  if (skin == null) {
    res.status(404).json();
    return;
  }
  res.json(skin);
});

app.get("/skins/:md5/readme.txt", async (req, res) => {
  const { md5 } = req.params;
  const readmeText = await Skins.getReadme(md5);
  if (readmeText == null) {
    // TODO: make this 404
    res.send("");
    return;
  }
  res.send(readmeText);
});

app.get("/skins/:md5/screenshot.png", async (req, res) => {
  const { md5 } = req.params;
  const screenshotUrl = await Skins.getScreenshotUrl(md5);
  if (screenshotUrl == null) {
    res.status(404).send();
    return;
  }
  res.redirect(301, screenshotUrl);
});

app.get("/skins/:md5/download", async (req, res) => {
  const { md5 } = req.params;
  const skinUrl = await Skins.getSkinUrl(md5);
  if (skinUrl == null) {
    res.status(404).send();
    return;
  }
  res.redirect(301, skinUrl);
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));

async function main() {
  return;
  /*
  const found = 0;
  const bulkUpdates = Object.values(info)
    .map((skin, i, collection) => {
      const { md5, twitterLikes, tweetUrl } = skin;
      if (twitterLikes == null && tweetUrl == null) {
        return;
      }
      return {
        updateOne: {
          filter: { md5 },
          update: {
            $set: {
              tweetUrl,
              twitterLikes,
            },
          },
          upsert: true,
        },
      };
    })
    .filter(Boolean);
  await skins.bulkWrite(bulkUpdates);
  console.log("done");
  */
}

main();
