import * as Knex from "knex";

export async function up(knex: Knex): Promise<any> {
  await knex.raw(
    `CREATE TABLE "bluesky_posts" (
         "id"    INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE,
         "skin_md5" TEXT NOT NULL,
         post_id text NOT NULL UNIQUE,
         url text NOT NULL UNIQUE
      );`
  );
}

export async function down(knex: Knex): Promise<any> {
  await knex.raw(`DROP TABLE "bluesky_posts"`);
}
