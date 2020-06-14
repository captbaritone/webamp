const { searchIndex } = require("../algolia");
const path = require("path");
const db = require("../db");

function tuncate(str, len) {
  const overflow = str.length - len;
  if (overflow < 0) {
    return str;
  }

  const half = Math.floor((len - 1) / 2);

  const start = str.slice(0, half);
  const end = str.slice(-half);
  return `${start} ########### ${end}`;
}

function buildSkinIndex(skin) {
  const { filePaths, nsfw } = skin;
  if (!filePaths || filePaths.length === 0) {
    console.warn("no file name for ", md5);
    return;
  }
  const fileName = path.basename(filePaths[0]);
  const readmeText = skin.readmeText ? tuncate(skin.readmeText, 4800) : null;
  return {
    objectID: skin.md5,
    nsfw,
    //md5,
    //fileName,
    // emails: skin.emails || null,
    // readmeText
    // color: skin.averageColor
    // twitterLikes: Number(skin.twitterLikes || 0)
  };
}

async function go({ dry = true }) {
  const skins = await db.get("skins").find(
    { type: "CLASSIC" },
    {
      fields: {
        md5: 1,
        averageColor: 1,
        nsfw: 1,
        twitterLikes: 1,
        readmeText: 1,
        filePaths: 1,
      },
    }
  );

  const indexes = skins.map(buildSkinIndex).filter(Boolean);
  // .filter((index) => index.nsfw);

  db.close();

  if (dry) {
    console.log("Index turned off. Turn it on if you really mean it");
    return;
  }
  console.log("Writing index");
  const results = await new Promise((resolve, reject) => {
    searchIndex.partialUpdateObjects(indexes, function (err, content) {
      if (err != null) reject(err);
      resolve(content);
    });
  });
  console.log("done!", results);
}

go({ dry: true }); // .then(content => console.log("Updated index for:", content.length));
