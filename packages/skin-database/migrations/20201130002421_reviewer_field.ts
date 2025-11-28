import * as Knex from "knex";

export async function up(knex: Knex): Promise<any> {
  await knex.schema.table("skin_reviews", (table) => {
    table.text("reviewer");
  });
}

export async function down(knex: Knex): Promise<any> {
  await knex.schema.table("skin_reviews", (table) => {
    table.dropColumn("reviewer");
  });
}
