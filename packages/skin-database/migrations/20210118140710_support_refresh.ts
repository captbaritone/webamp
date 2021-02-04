import * as Knex from "knex";

export async function up(knex: Knex): Promise<any> {
  await knex.schema.createTable("refreshes", function (table) {
    table.increments();
    table.string("skin_md5").notNullable();
    table.string("error");
    table.timestamp("timestamp").defaultTo(knex.fn.now());
    table.foreign("skin_md5").references("skins.skin_md5");
    table.index("skin_md5", "idx_refreshes_skin_md5");
  });
}

export async function down(knex: Knex): Promise<any> {
  await knex.schema.dropTable("refreshes");
}
