import * as Knex from "knex";

export async function up(knex: Knex): Promise<any> {
  await knex.raw(
    `CREATE TABLE "mastodon_posts" (
         "id"    INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE,
         "skin_md5" TEXT NOT NULL,
         post_id text TEXT NOT_NULL UNIQUE,
         url text TEXT NOT_NULL UNIQUE
      );`
  );
}

export async function down(knex: Knex): Promise<any> {
  await knex.raw(`DROP TABLE "mastodon_posts"`);
}
