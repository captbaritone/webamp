import * as Knex from "knex";

export async function up(knex: Knex): Promise<any> {
  await knex.schema.dropTable("nsfw_predictions");
}

export async function down(knex: Knex): Promise<any> {
  await knex.raw(
    `CREATE TABLE nsfw_predictions (id INTEGER PRIMARY KEY AUTOINCREMENT, porn REAL, neutral REAL, sexy REAL, hentai REAL, drawing REAL, skin_md5 TEXT NOT NULL);`
  );
  await knex.raw(
    `CREATE INDEX idx_nsfw_predictions_skin_md5 ON nsfw_predictions(skin_md5);`
  );
}
