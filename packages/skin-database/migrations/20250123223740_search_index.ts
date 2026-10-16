import * as Knex from "knex";

// This used to be one knex.raw() with the whole setup in it: this table,
// filling it, and triggers to keep it current. The sqlite3 driver runs only
// the first statement of a string, so creating the table is all it ever did.
// The rest is in 20261016000000_search_index_triggers.
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    CREATE VIRTUAL TABLE skin_search USING fts5(
      skin_md5,
      readme_text,
      file_names
    )`);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`DROP TABLE skin_search`);
}
