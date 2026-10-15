import * as Knex from "knex";

// The browser's user agent for each session of the new museum UI, from its
// first batch of events, so bots and crawlers can be told apart from people.
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`ALTER TABLE session ADD COLUMN user_agent TEXT;`);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`ALTER TABLE session DROP COLUMN user_agent;`);
}
