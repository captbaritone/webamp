import { knex } from "../db";
import { analyze, botReasons, type Analysis } from "../events/analyze";
import { forEachSessionBatch } from "../events/loadEvents";

// The museum's "Downloads" order: skins by how often seeing them in the
// museum grid led to a download, from people's sessions in the whole event
// log. Rebuilt nightly, after the museum's own order (see
// computeMuseumOrder), into museum_downloads_order.
//
// Where in the grid a skin was seen isn't corrected for. Random skins, which
// appear at many positions, get about as many downloads per view at any of
// them (0.29% at position 14, 0.19% at 10,000; Nov 2026). Correcting by
// position compared each of the museum's first skins, which always appear at
// the same place, with itself.

// Skins with fewer grid views than this, or no downloads, don't have a score
// worth ranking by. They follow the scored skins, in the museum's own order.
export const MIN_GRID_VIEWS = 20;

// Sessions read from the log at a time.
const BATCH_SIZE = 500;

/**
 * Rebuilds museum_downloads_order: scored skins best first, then every other
 * skin in the museum's own order, leaving out NSFW skins (like the Newest and
 * Random orders). In one transaction, so if it fails the previous order
 * stays.
 */
export async function computeDownloadsOrder(): Promise<{
  scored: number;
  total: number;
}> {
  const tally = newGridTally();
  await forEachSessionBatch(
    "local",
    { minVersion: 3, batchSize: BATCH_SIZE },
    (sessions) => {
      const people = sessions.filter((s) => botReasons(s).length === 0);
      addToGridTally(tally, analyze(people));
    }
  );
  const ranked = rankGridTally(tally).filter(
    (skin) => skin.gridViews >= MIN_GRID_VIEWS && skin.downloads > 0
  );

  // The skins the museum lists, other than NSFW ones. Read before the
  // transaction: in WAL mode, a transaction that reads and then writes fails
  // at once if another write lands in between, however long it would wait.
  const listed = new Set<string>(
    (
      await knex.raw(`
SELECT skins.md5
FROM museum_sort_order
INNER JOIN skins ON skins.md5 = museum_sort_order.skin_md5
WHERE skins.md5 NOT IN (SELECT skin_md5 FROM skin_reviews WHERE review = 'NSFW')`)
    ).map((row: { md5: string }) => row.md5)
  );
  const scored = ranked
    .filter((skin) => listed.has(skin.md5))
    .map((skin) => ({ skin_md5: skin.md5, score: skin.score }));

  // Wait longer than the site's connections would for a turn to write.
  await knex.raw("PRAGMA busy_timeout = 30000");
  return knex.transaction(async (trx) => {
    // Its first statement writes, so it takes the write lock (waiting for
    // one if need be) before anything else.
    await trx("museum_downloads_order").del();
    // Positions count from 1 in the order rows go in (an emptied table's
    // rowids start again from 1).
    await knex
      .batchInsert("museum_downloads_order", scored, 500)
      .transacting(trx);
    await trx.raw(`
INSERT INTO museum_downloads_order (skin_md5)
SELECT museum_sort_order.skin_md5
FROM museum_sort_order
INNER JOIN skins ON skins.md5 = museum_sort_order.skin_md5
WHERE skins.md5 NOT IN (SELECT skin_md5 FROM skin_reviews WHERE review = 'NSFW')
  AND skins.md5 NOT IN (SELECT skin_md5 FROM museum_downloads_order)
ORDER BY museum_sort_order.rowid`);
    const [{ total }] = await trx("museum_downloads_order").count({
      total: "*",
    });
    return { scored: scored.length, total: Number(total) };
  });
}

// Scoring

// How many downloads' worth of average a skin's score starts from, so that
// with little data it stays near the average rather than topping the list on
// a lucky download or two. At ~0.36% downloads per view, a skin's own record
// outweighs it after ~2,800 grid views.
const PSEUDO_EXPECTED = 10;

/**
 * Views of skins in the museum grid, in any of its orders but not in
 * searches (people searching are after something in particular), and how
 * many led to a download in the same session, by skin. Added to a batch of
 * sessions at a time, so the whole log needn't be in memory at once (all of
 * it takes over 4GB).
 */
export type GridTally = Map<string, { n: number; hits: number }>;

export function newGridTally(): GridTally {
  return new Map();
}

export function addToGridTally(tally: GridTally, analysis: Analysis): void {
  const downloaded = new Set(
    analysis.views
      .filter((v) => v.downloaded)
      .map((v) => `${v.sessionId}\n${v.skinMd5}`)
  );
  for (const i of analysis.impressions) {
    if (i.query != null || i.sort == null) continue;
    let s = tally.get(i.skinMd5);
    if (s == null) {
      s = { n: 0, hits: 0 };
      tally.set(i.skinMd5, s);
    }
    s.n++;
    if (downloaded.has(`${i.sessionId}\n${i.skinMd5}`)) s.hits++;
  }
}

/**
 * Each skin's downloads against the downloads an average skin would get from
 * as many grid views, best first (ties to the skin with more grid views).
 */
export function rankGridTally(
  tally: GridTally
): Array<{ md5: string; score: number; gridViews: number; downloads: number }> {
  let n = 0;
  let hits = 0;
  for (const s of tally.values()) {
    n += s.n;
    hits += s.hits;
  }
  if (n === 0) return [];
  const overall = hits / n;
  return [...tally]
    .map(([md5, s]) => ({
      md5,
      score: (s.hits + PSEUDO_EXPECTED) / (s.n * overall + PSEUDO_EXPECTED),
      gridViews: s.n,
      downloads: s.hits,
    }))
    .sort((a, b) => b.score - a.score || b.gridViews - a.gridViews);
}
