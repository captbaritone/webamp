import * as Knex from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    CREATE TABLE user_log_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT NOT NULL,
      timestamp INTEGER NOT NULL,
      metadata TEXT NOT NULL
    );

    CREATE INDEX idx_session_id ON user_log_events(session_id);
    CREATE INDEX idx_timestamp ON user_log_events(timestamp);
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
    DROP TABLE IF EXISTS user_log_events;
  `);
}
