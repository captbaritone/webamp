import * as Knex from "knex";

export async function up(knex: Knex): Promise<any> {
  await knex.schema.table("skin_reviews", function (table) {
    table.text("reviewer");
  });
}

export async function down(knex: Knex): Promise<any> {
  await knex.schema.table("skin_reviews", function (table) {
    table.dropColumn("reviewer");
  });
}
