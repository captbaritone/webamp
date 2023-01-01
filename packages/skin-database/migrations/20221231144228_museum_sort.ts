import * as Knex from "knex";

export async function up(knex: Knex): Promise<any> {
  await knex.raw(
    `CREATE TABLE IF NOT EXISTS museum_sort_order (skin_md5 TEXT references skins(md5));`
  );
}

export async function down(knex: Knex): Promise<any> {
  await knex.raw(`DROP TABLE museum_sort_order;`);
}
