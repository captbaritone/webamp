import { Int } from "grats";
import SkinModel from "../../../data/SkinModel";
import UserContext from "../../../data/UserContext";
import ClassicSkinResolver from "./ClassicSkinResolver";
import { ISkin } from "./CommonSkinResolver";
import ModernSkinResolver from "./ModernSkinResolver";
import * as Skins from "../../../data/skins";
import { knex } from "../../../db";
import { ftsColumnExpression, ftsMatchExpression } from "../../../ftsQuery";
import type * as Knex from "knex";
import parseQuery from "../../../legacy-client/src/queryParser";

export default class SkinResolver {
  constructor() {
    throw new Error("This is a stub.");
  }
  static async fromMd5(ctx: UserContext, md5: string): Promise<ISkin | null> {
    const skin = await SkinModel.fromMd5(ctx, md5);
    if (skin == null) {
      return null;
    }
    return this.fromModel(skin);
  }
  static fromModel(model: SkinModel): ISkin {
    if (model.getSkinType() === "MODERN") {
      return new ModernSkinResolver(model);
    } else {
      return new ClassicSkinResolver(model);
    }
  }
}

// How to order a skin_search MATCH's results. FTS5's rank (BM25) scores a
// match lower the longer the whole row is, readme included, so a long readme
// can bury a skin whose file name is just what was searched for: "Atlas" put
// Skinner_Atlas.wsz, with a 49 KB readme, 136th of 165. So skins with every
// word of the search in their file names come first, then by rank.
function searchOrder(match: string): [string, string[]] {
  return [
    `skin_search.skin_md5 IN (
      SELECT skin_md5 FROM skin_search WHERE skin_search MATCH ?
    ) DESC, rank`,
    [ftsColumnExpression("file_names", match)],
  ];
}

/**
 * The has:/filter: terms of a search (see legacy-client/src/queryParser.js),
 * by name: whether a skin must have (true) or mustn't have (false) each thing
 * asked about. `has:ani -has:playlist` is `{ ani: true, playlist: false }`.
 */
type SearchFilters = {
  /** Includes the playlist window (PLEDIT.bmp). `has:playlist` */
  playlist?: boolean;
  /** Includes the equalizer window (EQMAIN.bmp). `has:equalizer` */
  equalizer?: boolean;
  /** Includes the minibrowser (MB.bmp). `has:browser` */
  browser?: boolean;
  /**
   * Includes the media library, which is drawn with the general purpose
   * windows' sprites (GEN.bmp and GENEX.bmp), so the same as `general`.
   * `has:media`
   */
  media?: boolean;
  /**
   * Includes the general purpose windows (GEN.bmp and GENEX.bmp).
   * `has:general`
   */
  general?: boolean;
  /** Includes the video window (VIDEO.bmp). `has:video` */
  video?: boolean;
  /** Includes the MikroAMP plugin (MIKRO.bmp). `has:mikro` */
  mikro?: boolean;
  /** Includes the Vidamp plugin (VIDAMP.bmp). `has:vidamp` */
  vidamp?: boolean;
  /** Includes the AVS (visualization) window (AVS.bmp). `has:avs` */
  avs?: boolean;
  /** Includes custom cursors (.cur files). `has:cur` */
  cur?: boolean;
  /** Includes animated cursors (.ani files). `has:ani` */
  ani?: boolean;
  /**
   * Its region.txt cuts at least 4,000 pixels from the main and equalizer
   * windows: a noticeably shaped skin. `has:transparency`
   */
  transparency?: boolean;
  /** Was posted by the museum's bot and liked at least once. `has:likes` */
  likes?: boolean;
  /** Is flagged NSFW. `filter:nsfw` */
  nsfw?: boolean;
};

// The thresholds for has:transparency and has:likes, as the search box's
// parser has them for Algolia (legacy-client/src/queryParser.js).
const TRANSPARENT_PIXELS_THRESHOLD = 4000;
const LIKES_THRESHOLD = 1;

// LIKE patterns for a skin's sprite sheet, such as EQMAIN.bmp, at the top of
// its archive or in a folder, as SkinModel's has*() methods find them (LIKE is
// case insensitive, as they are).
function spriteSheet(base: string): string[] {
  return ["bmp", "png"].flatMap((ext) =>
    ["", "%/", "%\\"].map((dir) => `${dir}${base}.${ext}`)
  );
}

// The filters decided by a skin's archive files: each needs a file matching
// one of each group's patterns.
const ARCHIVE_FILE_FILTERS: Partial<Record<keyof SearchFilters, string[][]>> = {
  playlist: [spriteSheet("PLEDIT")],
  equalizer: [spriteSheet("EQMAIN")],
  browser: [spriteSheet("MB")],
  media: [spriteSheet("GEN"), spriteSheet("GENEX")],
  general: [spriteSheet("GEN"), spriteSheet("GENEX")],
  video: [spriteSheet("VIDEO")],
  mikro: [spriteSheet("MIKRO")],
  vidamp: [spriteSheet("VIDAMP")],
  avs: [spriteSheet("AVS")],
  cur: [["%.cur"]],
  ani: [["%.ani"]],
};

function hasArchiveFile(patterns: string[]): Knex.QueryBuilder {
  return knex("archive_files")
    .select(knex.raw("1"))
    .whereRaw("archive_files.skin_md5 = skins.md5")
    .where((builder) => {
      for (const pattern of patterns) {
        builder.orWhere("archive_files.file_name", "like", pattern);
      }
    });
}

/** Limit a query of `skins` to those the filters ask for. */
function applySearchFilters(
  query: Knex.QueryBuilder,
  filters: SearchFilters
): void {
  for (const [name, groups] of Object.entries(ARCHIVE_FILE_FILTERS) as Array<
    [keyof SearchFilters, string[][]]
  >) {
    const value = filters[name];
    if (value == null) continue;
    query.where((builder) => {
      for (const patterns of groups) {
        if (value) {
          builder.whereExists(hasArchiveFile(patterns));
        } else {
          builder.orWhereNotExists(hasArchiveFile(patterns));
        }
      }
    });
  }
  if (filters.transparency != null) {
    query.whereRaw(
      `COALESCE(skins.transparent_pixels, 0) ${
        filters.transparency ? ">=" : "<"
      } ?`,
      [TRANSPARENT_PIXELS_THRESHOLD]
    );
  }
  if (filters.likes != null) {
    query[filters.likes ? "whereExists" : "whereNotExists"](
      knex("tweets")
        .select(knex.raw("1"))
        .whereRaw("tweets.skin_md5 = skins.md5")
        .where("tweets.likes", ">=", LIKES_THRESHOLD)
    );
  }
  if (filters.nsfw != null) {
    query[filters.nsfw ? "whereIn" : "whereNotIn"](
      "skins.md5",
      knex("skin_reviews").select("skin_md5").where("review", "NSFW")
    );
  }
}

function hasSearchFilters(filters: SearchFilters): boolean {
  return Object.values(filters).some((value) => value != null);
}

/**
 * Get a skin by its MD5 hash
 * @gqlQueryField
 */
export async function fetch_skin_by_md5(
  md5: string,
  ctx: UserContext
): Promise<ISkin | null> {
  const skin = await SkinModel.fromMd5(ctx, md5);
  if (skin == null) {
    return null;
  }
  return SkinResolver.fromModel(skin);
}

/**
 * Search the database using SQLite's FTS (full text search) index.
 *
 * Useful for locating a particular skin.
 * @gqlQueryField
 */
export async function search_skins(
  query: string,
  first: Int = 10,
  offset: Int = 0,
  ctx: UserContext
): Promise<Array<ISkin | null>> {
  if (first > 1000) {
    throw new Error("Can only query 1000 records via search.");
  }

  const match = ftsMatchExpression(query);
  if (match == null) {
    return [];
  }

  const skins = await knex("skin_search")
    .select("skin_md5")
    .leftJoin("skins", "skin_search.skin_md5", "skins.md5")
    .where("skins.skin_type", "in", [1, 2])
    .orderByRaw(...searchOrder(match))
    .limit(first)
    .offset(offset)
    .whereRaw("skin_search MATCH ?", match);

  return Promise.all(
    skins.map(async (hit) => {
      const model = await SkinModel.fromMd5Assert(ctx, hit.skin_md5);
      return SkinResolver.fromModel(model);
    })
  );
}

/**
 * Search the database using SQLite's FTS (full text search) index.
 *
 * Useful for locating a particular skin.
 *
 * The query can narrow the search with the museum search box's terms, each
 * negated with a leading `-`: `has:playlist`, `has:equalizer`, `has:browser`,
 * `has:media`, `has:general`, `has:video` (skinned windows), `has:mikro`,
 * `has:vidamp`, `has:avs` (plugins), `has:cur`, `has:ani` (cursors),
 * `has:transparency` (a shaped skin), `has:likes` and `filter:nsfw`. So
 * `zelda has:ani -filter:nsfw`. With terms, a query with no words lists every
 * matching skin, most liked first. Comparisons (`has:transparency>100`) and
 * unknown terms are ignored.
 *
 * `nsfw` is the same as `filter:nsfw` (true) or `-filter:nsfw` (false).
 * @gqlQueryField
 */
export async function search_classic_skins(
  query: string,
  first: Int = 10,
  offset: Int = 0,
  nsfw: boolean | null = null,
  ctx: UserContext
): Promise<Array<ClassicSkinResolver | null>> {
  if (first > 1000) {
    throw new Error("Can only query 1000 records via search.");
  }

  // const skins = await knex("skin_search")
  //   .select("skin_search.skin_md5")
  //   .leftJoin("skins", "skin_search.skin_md5", "skins.md5")
  //   .leftJoin("skin_reviews", "skins.md5", "skin_reviews.skin_md5")
  //   .where("skins.skin_type", "=", 1)
  //   .orderByRaw("CASE WHEN skin_reviews.review = 'NSFW' THEN 1 ELSE 0 END")
  //   .limit(first)
  //   .offset(offset)
  //   .whereRaw("skin_search MATCH ?", query);

  const [text, , filters] = parseQuery(query);
  // The query and the argument can both say nsfw. If they disagree, nothing
  // matches.
  const allFilters: SearchFilters = { ...filters };
  if (nsfw != null) {
    if (allFilters.nsfw != null && allFilters.nsfw !== nsfw) return [];
    allFilters.nsfw = nsfw;
  }
  const match = ftsMatchExpression(text);

  let skins: Array<{ skin_md5: string }>;
  if (match != null) {
    const search = knex("skin_search")
      .select("skin_md5")
      .leftJoin("skins", "skin_search.skin_md5", "skins.md5")
      .where("skins.skin_type", "=", 1)
      .orderByRaw(...searchOrder(match))
      .limit(first)
      .offset(offset)
      .whereRaw("skin_search MATCH ?", match);
    applySearchFilters(search, allFilters);
    skins = await search;
  } else if (hasSearchFilters(allFilters)) {
    // Nothing to match, just the filters.
    const search = knex("skins")
      .select("skins.md5 as skin_md5")
      .leftJoin("tweets", "tweets.skin_md5", "skins.md5")
      .where("skins.skin_type", "=", 1)
      .groupBy("skins.md5")
      .orderByRaw("MAX(COALESCE(tweets.likes, 0)) DESC")
      .limit(first)
      .offset(offset);
    applySearchFilters(search, allFilters);
    skins = await search;
  } else {
    return [];
  }

  return Promise.all(
    skins.map(async (hit) => {
      const model = await SkinModel.fromMd5Assert(ctx, hit.skin_md5);
      return new ClassicSkinResolver(model);
    })
  );
}
/**
 * A random skin that needs to be reviewed
 * @gqlQueryField */
export async function skin_to_review(ctx: UserContext): Promise<ISkin | null> {
  if (!ctx.authed()) {
    return null;
  }
  const { md5 } = await Skins.getSkinToReview();
  const model = await SkinModel.fromMd5Assert(ctx, md5);
  return SkinResolver.fromModel(model);
}
