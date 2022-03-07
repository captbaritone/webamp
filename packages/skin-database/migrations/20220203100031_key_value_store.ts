import * as Knex from "knex";

export async function up(knex: Knex): Promise<any> {
  await knex.raw(
    `CREATE TABLE "key_value" (
             "id"    INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE,
             "key" TEXT NOT NULL UNIQUE,
             value TEXT NOT_NULL
          );`
  );
}

export async function down(knex: Knex): Promise<any> {
  await knex.raw(`DROP TABLE "key_value"`);
}
