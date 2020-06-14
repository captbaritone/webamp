const path = require("path");
const { db, knex } = require("../db");

const skins = db.get("skins");
const iaItems = db.get("internetArchiveItems");

const SKIN_TYPE = {
  CLASSIC: 1,
  MODERN: 2,
  PACK: 3,
  INVALID: 4,
};

async function migrateIA() {
  const items = await iaItems.find();
  for (const item of items) {
    if (item.metadata == null) {
      console.log(`No metadata found for ${item.identifier}`);
      continue;
    }
    const {
      identifier,
      metadata: { files },
    } = item;

    const originalFiles = files.filter((file) => {
      return (
        file.source === "original" &&
        (file.name.endsWith(".wsz") || file.name.endsWith(".zip"))
      );
    });
    if (originalFiles.length !== 1) {
      console.log(`Found ${originalFiles.length} for ${identifier}`);
      continue;
    }

    const record = {
      skin_md5: originalFiles[0].md5,
      identifier,
    };

    await knex("ia_items").insert(record, []);
  }
}

async function migrate(record) {
  const {
    type,
    md5,
    averageColor,
    emails,
    readmeText,
    tweetUrl,
    twitterLikes,
    filePaths: _filePaths,
    filenames,
    uploader,
    nsfw,
    rejected,
    approved,
    tweeted,
    tweetId,
    nsfwPredictions,
    // Unused
    _id,
    screenshotUrl,
    skinUrl,
    imageHash,
    ...rest
  } = record;
  const found = await knex("skins").where({ md5 }).first();
  if (found != null) {
    console.log(`Found ${md5}`);
    return;
  }
  if (Object.keys(rest).length > 0) {
    throw new Error(`Unknown keys: ${Object.keys(rest)}`);
  }

  const filePaths = _filePaths.filter(Boolean);

  if (filePaths.length > 100) {
    console.error(`Too many file paths for ${md5}`);
    return;
  }

  const filePathFileNames = new Set(
    filePaths.map((filepath) => path.basename(filepath))
  );

  if (filenames != null) {
    filenames.forEach((filename) => {
      if (!filePathFileNames.has(filename)) {
        throw new Error(
          `File name ${filename} not found in ${filePathFileNames}`
        );
      }
    });
  }

  const skin_type = SKIN_TYPE[type];
  if (skin_type == null) {
    throw new Error(`Unknown skin type "${type}"`);
  }

  const skin = {
    md5,
    skin_type,
    average_color: averageColor,
    emails: emails == null ? null : emails.join(" "),
    readme_text: readmeText,
  };

  await knex("skins").insert(skin, []);

  if (nsfwPredictions != null) {
    await knex("nsfw_predictions").insert(
      { ...nsfwPredictions, skin_md5: md5 },
      []
    );
  }

  if (approved) {
    await knex("skin_reviews").insert({ review: "APPROVED", skin_md5: md5 });
  }
  if (rejected) {
    await knex("skin_reviews").insert({ review: "REJECTED", skin_md5: md5 });
  }
  if (nsfw) {
    await knex("skin_reviews").insert({ review: "NSFW", skin_md5: md5 });
  }

  if (tweetUrl || tweeted) {
    const tweet = {
      skin_md5: md5,
      url: tweetUrl,
      likes: Number(twitterLikes),
      tweet_id: tweetId,
    };
    await knex("tweets").insert(tweet, []);
  }

  if (filePaths && filePaths.length) {
    await knex("files").insert(
      filePaths.map((filePath) => ({
        skin_md5: md5,
        file_path: filePath,
        source_attribution: uploader,
      })),
      []
    );
  }
}

async function clean() {
  await knex("skins").delete();
  await knex("files").delete();
  await knex("tweets").delete();
  await knex("ia_items").delete();
  await knex("skin_reviews").delete();
}

async function main() {
  await clean();
  await migrateIA();
  const records = await skins.find();
  for (record of records) {
    await migrate(record);
  }
}

main().finally(async () => {
  knex.destroy();
  await db.close();
});
