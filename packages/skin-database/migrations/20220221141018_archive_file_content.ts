import * as Knex from "knex";

export async function up(knex: Knex): Promise<any> {
  await knex.raw(
    `ALTER TABLE archive_files ADD COLUMN uncompressed_size INTEGER;`
  );
  await knex.raw(`ALTER TABLE archive_files ADD COLUMN text_content TEXT;`);
}

export async function down(_knex: Knex): Promise<any> {
  throw new Error("Not implemented");
}
