const express = require("express");
const path = require("path");
const app = express();
const db = require("./db");
const skins = db.get("skins");
const iaItems = db.get("internetArchiveItems");
// const info = require("/Volumes/Mobile Backup/skins/cache/info.json");
const { getStatus } = require("./s3");
const port = 3000;

// TODO: Look into 766c4fad9088037ab4839b18292be8b1
// Has huge number of filenames in info.json

function getFilenames(skin) {
  return Array.from(new Set((skin.filePaths || []).map(p => path.basename(p))));
}

function getSkinRecord(skin) {
  const {
    md5,
    averageColor,
    emails,
    screenshotUrl,
    skinUrl,
    tweetUrl,
    twitterLikes,
  } = skin;
  return {
    skinUrl,
    screenshotUrl,
    md5,
    averageColor,
    fileNames: getFilenames(skin),
    emails,
    tweetUrl,
    twitterLikes,
  };
}

async function getProp(md5, prop) {
  const skin = await skins.findOne({ md5, type: "CLASSIC" });
  const value = skin && skin[prop];
  return value == null ? null : value;
}

app.set("json spaces", 2);

app.get("/", async (req, res) => {
  res.send("Hello World!");
});

app.get("/skins/", async (req, res) => {
  const skinRecords = await skins.find(
    { type: "CLASSIC" },
    {
      limit: 10,
      fields: {
        md5: 1,
        filenames: 1,
        averageColor: 1,
        emails: 1,
        filePaths: 1,
        screenshotUrl: 1,
        skinUrl: 1,
        tweetUrl: 1,
        twitterLikes: 1,
      },
    }
  );

  res.json(skinRecords.map(getSkinRecord));
});

app.get("/items/", async (req, res) => {
  const items = await iaItems.find(
    { metadata: { $ne: null } },
    {
      limit: 10,
      fields: {
        metadata: 1,
        identifier: 1,
      },
    }
  );

  const todo = await iaItems.count({ metadata: { $eq: null } });

  res.json({ items, todo });
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

app.get("/tweets/", async (req, res) => {
  const skinRecords = await skins.find(
    { type: "CLASSIC", tweetUrl: { $ne: null } },
    {
      limit: 10,
      fields: {
        md5: 1,
        filenames: 1,
        averageColor: 1,
        emails: 1,
        filePaths: 1,
        screenshotUrl: 1,
        skinUrl: 1,
        tweetUrl: 1,
        twitterLikes: 1,
        // md5: 1,
      },
    }
  );

  res.json(skinRecords.map(getSkinRecord));
});

app.get("/skins/:md5", async (req, res) => {
  const { md5 } = req.params;
  const skin = await skins.findOne({ md5, type: "CLASSIC" });
  if (skin == null) {
    res.status(404).json();
    return;
  }
  res.json({ ...getSkinRecord(skin), tweetStatus: await getStatus(md5) });
});

app.get("/skins/:md5/readme.txt", async (req, res) => {
  const { md5 } = req.params;
  const readmeText = await getProp(md5, "readmeText");
  if (readmeText == null) {
    // TODO: make this 404
    res.send("");
    return;
  }
  res.send(readmeText);
});

app.get("/skins/:md5/screenshot.png", async (req, res) => {
  const { md5 } = req.params;
  const screenshotUrl = await getProp(md5, "screenshotUrl");
  if (screenshotUrl == null) {
    res.status(404).send();
    return;
  }
  res.redirect(301, screenshotUrl);
});

app.get("/skins/:md5/download", async (req, res) => {
  const { md5 } = req.params;
  const skinUrl = await getProp(md5, "skinUrl");
  if (skinUrl == null) {
    res.status(404).send();
    return;
  }
  res.redirect(301, skinUrl);
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));

async function main() {
  return;
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
}

main();
