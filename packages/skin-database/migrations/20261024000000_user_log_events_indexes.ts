import * as Knex from "knex";

// The indexes 20251106000000_user_log_events meant to create. It ran them in
// the same knex.raw as the CREATE TABLE, and SQLite only runs the first
// statement, so they never existed. The event dashboard and /sorts read the
// log a batch of sessions at a time, which needs the session index.
export async function up(knex: Knex): Promise<void> {
  await knex.raw(
    `CREATE INDEX IF NOT EXISTS idx_session_id ON user_log_events(session_id);`
  );
  await knex.raw(
    `CREATE INDEX IF NOT EXISTS idx_timestamp ON user_log_events(timestamp);`
  );
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`DROP INDEX IF EXISTS idx_timestamp;`);
  await knex.raw(`DROP INDEX IF EXISTS idx_session_id;`);
}
