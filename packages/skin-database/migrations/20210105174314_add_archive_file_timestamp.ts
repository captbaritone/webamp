import * as Knex from "knex";

export async function up(knex: Knex): Promise<any> {
  await knex.schema.table("archive_files", function (table) {
    table.timestamp("file_date");
  });
}

export async function down(knex: Knex): Promise<any> {
  await knex.schema.table("archive_files", function (table) {
    table.dropColumn("file_date");
  });
}
