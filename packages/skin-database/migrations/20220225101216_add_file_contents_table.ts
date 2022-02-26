import * as Knex from "knex";

export async function up(knex: Knex): Promise<any> {
  await knex.raw(
    `CREATE TABLE "file_info" (
        "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE,
        "file_md5" TEXT NOT NULL UNIQUE,
        text_content TEXT,
        size_in_bytes INTEGER
    );`
  );
}

export async function down(knex: Knex): Promise<any> {
  await knex.raw(`DROP TABLE "file_info"`);
}
