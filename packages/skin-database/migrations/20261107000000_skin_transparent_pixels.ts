import * as Knex from "knex";

// How much of a classic skin's main and equalizer windows its region.txt
// cuts away, in pixels (not always a whole number; see transparency.ts), for
// has:transparency in our own search. Too slow to work out per search: ~33k
// skins have a region.txt. Set when a skin's archive files are recorded
// (setHashesForSkin); null until then. Existing skins:
// `pnpm cli dev --compute-transparent-pixels`.
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`ALTER TABLE skins ADD COLUMN transparent_pixels REAL;`);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`ALTER TABLE skins DROP COLUMN transparent_pixels;`);
}
