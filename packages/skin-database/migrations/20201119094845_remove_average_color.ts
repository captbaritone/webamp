import * as Knex from "knex";

export async function up(knex: Knex): Promise<any> {
  await knex.schema.table("skins", (table) => {
    table.dropColumn("average_color");
  });
}

export async function down(knex: Knex): Promise<any> {
  await knex.schema.table("skins", (table) => {
    table.string("average_color");
  });
}
