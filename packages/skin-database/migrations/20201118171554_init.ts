import * as Knex from "knex";

export async function up(knex: Knex): Promise<any> {
  await knex.raw(`CREATE TABLE "files" (
        "id"    INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE,
        "file_path"     TEXT NOT NULL,
        "source_attribution"    TEXT,
        "skin_md5"      TEXT NOT NULL
);`);
  await knex.raw(`CREATE TABLE "ia_items" (
        "id"    INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE,
        "skin_md5"      TEXT,
        "identifier"    TEXT NOT NULL
);`);
  await knex.raw(
    `CREATE TABLE "tweets" ( "id"    INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE, "url"   TEXT, "likes" INTEGER, "skin_md5"      TEXT NOT NULL , tweet_id text, retweets INTEGER);`
  );
  await knex.raw(
    `CREATE TABLE "skins" ( "id"    INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE, "md5"   TEXT NOT NULL UNIQUE, "skin_type"     INTEGER NOT NULL, "emails"        BLOB, "readme_text"   BLOB, "average_color" TEXT, content_hash TEXT);`
  );
  await knex.raw(
    `CREATE TABLE "skin_reviews" ("id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE, "skin_md5" TEXT NOT NULL, review TEXT NOT NULL);`
  );
  await knex.raw(
    `CREATE TABLE nsfw_predictions (id INTEGER PRIMARY KEY AUTOINCREMENT, porn REAL, neutral REAL, sexy REAL, hentai REAL, drawing REAL, skin_md5 TEXT NOT NULL);`
  );
  await knex.raw(`CREATE TABLE algolia_field_updates(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
update_timestamp INTEGER NOT NULL,
field TEXT NOT NULL,
    skin_md5 TEXT NOT NULL,
    FOREIGN KEY (skin_md5) REFERENCES skins (md5)
);`);
  await knex.raw(
    `CREATE INDEX idx_algolia_field_updates_skin_md5 ON algolia_field_updates(skin_md5);`
  );
  await knex.raw(`CREATE TABLE archive_files (
id INTEGER PRIMARY KEY,
   skin_md5 TEXT NOT NULL,
file_name TEXT NOT_NULL,
file_md5 TEXT NOT NULL,
FOREIGN KEY (skin_md5) REFERENCES skins (md5),
UNIQUE(skin_md5,file_name)
);`);
  await knex.raw(`CREATE UNIQUE INDEX idx_skins_md5 ON skins(md5);`);
  await knex.raw(
    `CREATE INDEX idx_nsfw_predictions_skin_md5 ON nsfw_predictions(skin_md5);`
  );
  await knex.raw(`CREATE INDEX idx_tweets_skin_md5 ON tweets(skin_md5);`);
  await knex.raw(`CREATE INDEX idx_files_new_skin_md5 ON files(skin_md5);`);
  await knex.raw(`CREATE INDEX idx_ia_items_skin_md5 ON ia_items(skin_md5);`);
  await knex.raw(
    `CREATE INDEX idx_skin_reviews_skin_md5 ON skin_reviews(skin_md5);`
  );
  await knex.raw(
    `CREATE TABLE "skin_uploads" ("id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE, "skin_md5" TEXT NOT NULL, status TEXT NOT NULL, filename TEXT);`
  );
  await knex.raw(
    `CREATE INDEX idx_skin_uploads_skin_md5 ON skin_uploads(skin_md5);`
  );
  await knex.raw(`CREATE TABLE screenshot_updates(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    update_timestamp INTEGER NOT NULL,
    skin_md5 TEXT NOT NULL,
    success INTEGER NOT NULL,
    error_message TEXT,
    FOREIGN KEY (skin_md5) REFERENCES skins (md5)
);`);
  await knex.raw(
    `CREATE INDEX idx_screenshot_updates_skin_md5 ON screenshot_updates(skin_md5);`
  );
}

export async function down(_knex: Knex): Promise<any> {
  throw new Error(
    "In this case 'down' would just delete all tables and indexes, so I won't bother."
  );
}
