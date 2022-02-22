import * as Knex from "knex";

export async function up(knex: Knex): Promise<any> {
  await knex.raw(`ALTER TABLE archive_files ADD COLUMN is_directory INTEGER;`);
}

export async function down(_knex: Knex): Promise<any> {
  throw new Error("Not implemented");
}
