import * as Knex from "knex";

// We can't add a unique constraint after the fact, but we can add a unique index which should do the same thing.
// https://stackoverflow.com/a/35301957/1263117
export async function up(knex: Knex): Promise<any> {
  await knex.raw(
    "CREATE UNIQUE INDEX idx_tweets_unique_tweet_id ON tweets(tweet_id);"
  );
}

export async function down(knex: Knex): Promise<any> {
  await knex.raw("DROP INDEX idx_tweets_unique_tweet_id");
}
