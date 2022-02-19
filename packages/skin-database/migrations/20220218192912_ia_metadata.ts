import * as Knex from "knex";


export async function up(knex: Knex): Promise<any> {
    await knex.raw(
        `ALTER TABLE ia_items ADD COLUMN metadata;`
      );
}


export async function down(knex: Knex): Promise<any> {
    throw new Error("I never implemented a down migration for adding metadata.");
}

