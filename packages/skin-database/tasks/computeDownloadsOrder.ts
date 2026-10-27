import { knex } from "../db";
import { analyze, botReasons, type Analysis } from "../app/dev/events/analyze";
import { forEachSessionBatch } from "../app/dev/events/loadEvents";

// The museum's "Downloads" order: skins by how often seeing them in the
// museum grid led to a download, against how often it would for an average
// skin at the same positions (skins near the top get downloaded more whatever
// they look like), from people's sessions in the whole event log. Rebuilt
// nightly, after the museum's own order (see computeMuseumOrder), into
// museum_downloads_order.

// Skins with fewer views in the grid (in the museum's own order) than this
// don't have a score worth ranking by. They follow the scored skins, in the
// museum's own order.
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
    (skin) => skin.gridViews >= MIN_GRID_VIEWS
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

// How much a skin's own record counts against what's expected of it: with
// little data a skin stays near the average rather than topping the list on
// one lucky download.
const PSEUDO_EXPECTED = 2;
// Smoothing for each grid position's rate, in grid views at the overall
// rate. Downloads from the grid are rare enough that deep positions often
// have none.
const PRIOR_IMPRESSIONS = 100;

/**
 * Views of skins in the museum grid, in the museum's own order, and how many
 * led to a download in the same session: by position (bucketed), and by
 * skin. Added to a batch of sessions at a time, so the whole log needn't be
 * in memory at once (all of it takes over 4GB).
 */
export type GridTally = {
  buckets: Map<number, { n: number; hits: number }>;
  skins: Map<
    string,
    { n: number; hits: number; byBucket: Map<number, number> }
  >;
};

export function newGridTally(): GridTally {
  return { buckets: new Map(), skins: new Map() };
}

export function addToGridTally(tally: GridTally, analysis: Analysis): void {
  const downloaded = new Set(
    analysis.views
      .filter((v) => v.downloaded)
      .map((v) => `${v.sessionId}\n${v.skinMd5}`)
  );
  for (const i of analysis.impressions) {
    // Positions in the museum's own order only: in the others (newest
    // first, random, this one) a position says nothing about a skin's rank.
    if (i.query != null || i.sort !== "top") continue;
    const hit = downloaded.has(`${i.sessionId}\n${i.skinMd5}`);
    const bucket = positionBucket(i.position);
    const b = tally.buckets.get(bucket) ?? { n: 0, hits: 0 };
    b.n++;
    if (hit) b.hits++;
    tally.buckets.set(bucket, b);
    let s = tally.skins.get(i.skinMd5);
    if (s == null) {
      s = { n: 0, hits: 0, byBucket: new Map() };
      tally.skins.set(i.skinMd5, s);
    }
    s.n++;
    if (hit) s.hits++;
    s.byBucket.set(bucket, (s.byBucket.get(bucket) ?? 0) + 1);
  }
}

/**
 * Each skin's downloads against the downloads an average skin would get at
 * the positions it was seen in, best first (ties to the skin with more grid
 * views).
 */
export function rankGridTally(
  tally: GridTally
): Array<{ md5: string; score: number; gridViews: number }> {
  let n = 0;
  let hits = 0;
  for (const b of tally.buckets.values()) {
    n += b.n;
    hits += b.hits;
  }
  if (n === 0) return [];
  const overall = hits / n;
  const expectedAt = new Map(
    [...tally.buckets].map(([bucket, b]) => [
      bucket,
      (b.hits + PRIOR_IMPRESSIONS * overall) / (b.n + PRIOR_IMPRESSIONS),
    ])
  );
  return [...tally.skins]
    .map(([md5, s]) => {
      let expected = 0;
      for (const [bucket, count] of s.byBucket) {
        expected += count * expectedAt.get(bucket)!;
      }
      return {
        md5,
        score: (s.hits + PSEUDO_EXPECTED) / (expected + PSEUDO_EXPECTED),
        gridViews: s.n,
      };
    })
    .sort((a, b) => b.score - a.score || b.gridViews - a.gridViews);
}

// Each of the first 20 positions on its own, then wider and wider ranges:
// 20–23, 24–28, ... (four per doubling).
function positionBucket(position: number): number {
  if (position < 20) return position;
  return 20 + Math.floor(Math.log2(position / 20) * 4);
}
