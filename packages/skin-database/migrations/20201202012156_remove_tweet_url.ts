import * as Knex from "knex";

export async function up(knex: Knex): Promise<any> {
  await knex.schema.table("tweets", function (table) {
    table.dropColumn("url");
  });
}

export async function down(knex: Knex): Promise<any> {
  await knex.schema.table("tweets", function (table) {
    table.text("url");
  });
}
