import * as Knex from "knex";

export async function up(knex: Knex): Promise<any> {
  // Use parameterized schema builders instead of raw SQL to prevent injection
  await knex.schema.createTable("files", (table) => {
    table.increments("id").primary();
    table.text("file_path").notNullable();
    table.text("source_attribution");
    table.text("skin_md5").notNullable();
  });

  await knex.schema.createTable("ia_items", (table) => {
    table.increments("id").primary();
    table.text("skin_md5");
    table.text("identifier").notNullable();
  });

  await knex.schema.createTable("tweets", (table) => {
    table.increments("id").primary();
    table.text("url");
    table.integer("likes");
    table.text("skin_md5").notNullable();
    table.text("tweet_id");
    table.integer("retweets");
  });

  await knex.schema.createTable("skins", (table) => {
    table.increments("id").primary();
    table.text("md5").notNullable().unique();
    table.integer("skin_type").notNullable();
    table.binary("emails");
    table.binary("readme_text");
    table.text("average_color");
    table.text("content_hash");
  });

  await knex.schema.createTable("skin_reviews", (table) => {
    table.increments("id").primary();
    table.text("skin_md5").notNullable();
    table.text("review").notNullable();
  });

  await knex.schema.createTable("nsfw_predictions", (table) => {
    table.increments("id").primary();
    table.decimal("porn");
    table.decimal("neutral");
    table.decimal("sexy");
    table.decimal("hentai");
    table.decimal("drawing");
    table.text("skin_md5").notNullable();
  });

  await knex.schema.createTable("algolia_field_updates", (table) => {
    table.increments("id").primary();
    table.integer("update_timestamp").notNullable();
    table.text("field").notNullable();
    table.text("skin_md5").notNullable();
    table.foreign("skin_md5").references("skins.md5");
  });

  await knex.schema.table("algolia_field_updates", (table) => {
    table.index("skin_md5", "idx_algolia_field_updates_skin_md5");
  });

  await knex.schema.createTable("archive_files", (table) => {
    table.increments("id").primary();
    table.text("skin_md5").notNullable();
    table.text("file_name").notNullable();
    table.text("file_md5").notNullable();
    table.foreign("skin_md5").references("skins.md5");
    table.unique(["skin_md5", "file_name"]);
  });

  // Create indices
  await knex.schema.table("skins", (table) => {
    table.index("md5", "idx_skins_md5");
  });

  await knex.schema.table("nsfw_predictions", (table) => {
    table.index("skin_md5", "idx_nsfw_predictions_skin_md5");
  });

  await knex.schema.table("tweets", (table) => {
    table.index("skin_md5", "idx_tweets_skin_md5");
  });

  await knex.schema.table("files", (table) => {
    table.index("skin_md5", "idx_files_new_skin_md5");
  });

  await knex.schema.table("ia_items", (table) => {
    table.index("skin_md5", "idx_ia_items_skin_md5");
  });

  await knex.schema.table("skin_reviews", (table) => {
    table.index("skin_md5", "idx_skin_reviews_skin_md5");
  });

  await knex.schema.createTable("skin_uploads", (table) => {
    table.increments("id").primary();
    table.text("skin_md5").notNullable();
    table.text("status").notNullable();
    table.text("filename");
  });

  await knex.schema.table("skin_uploads", (table) => {
    table.index("skin_md5", "idx_skin_uploads_skin_md5");
  });

  await knex.schema.createTable("screenshot_updates", (table) => {
    table.increments("id").primary();
    table.integer("update_timestamp").notNullable();
    table.text("skin_md5").notNullable();
    table.integer("success").notNullable();
    table.text("error_message");
    table.foreign("skin_md5").references("skins.md5");
  });

  await knex.schema.table("screenshot_updates", (table) => {
    table.index("skin_md5", "idx_screenshot_updates_skin_md5");
  });
}

export async function down(_knex: Knex): Promise<any> {
  throw new Error(
    "In this case 'down' would just delete all tables and indexes, so I won't bother."
  );
}
