import * as knex from "knex";

export async function up(knex: knex): Promise<any> {
  await knex.raw(`ALTER TABLE ia_items ADD COLUMN metadata_timestamp;`);
}

export async function down(knex: knex): Promise<any> {
  throw new Error(
    "I never implemented a down migration for adding metadata_timestamp."
  );
}
