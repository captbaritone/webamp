import * as Knex from "knex";

// The museum's "Downloads" order, rebuilt nightly (see
// tasks/computeDownloadsOrder.ts): every skin it lists, by position from 1, so
// a page of it is a range of positions rather than a sort.
export async function up(knex: Knex): Promise<void> {
  await knex.raw(
    `CREATE TABLE IF NOT EXISTS museum_downloads_order (
      position INTEGER PRIMARY KEY,
      skin_md5 TEXT NOT NULL,
      score REAL
    );`
  );
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`DROP TABLE museum_downloads_order;`);
}
