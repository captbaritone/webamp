import * as Knex from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    CREATE TABLE session (
      id TEXT PRIMARY KEY,
      start_time INTEGER NOT NULL
    );
  `);

  await knex.raw(`
    CREATE TABLE session_skin (
      session_id TEXT NOT NULL,
      skin_md5 TEXT NOT NULL,
      FOREIGN KEY (session_id) REFERENCES session(id)
    );
  `);

  await knex.raw(`
    CREATE INDEX idx_session_skin_session_id ON session_skin(session_id);
  `);

  await knex.raw(`
    CREATE INDEX idx_session_skin_skin_md5 ON session_skin(skin_md5);
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
    DROP TABLE IF EXISTS session_skin;
  `);

  await knex.raw(`
    DROP TABLE IF EXISTS session;
  `);
}
