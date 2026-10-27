import type { Analysis } from "../dev/events/analyze";

// Orders the museum could be sorted in, inferred from the event log, to try
// out at /dev/sorts. Each ranks the skins it has any data for, best first.
// Built from people's sessions only (see botReasons).

export type EventSort =
  | "direct"
  | "grid_clicks"
  | "grid_downloads"
  | "feed_downloads";

export type RankedSkin = {
  md5: string;
  score: number;
  // What the score is made of, for display.
  detail: string;
};

// How much a skin's own record counts against what's expected of it. With
// little data a skin stays near the average rather than topping the list on
// one lucky click.
const PSEUDO_EXPECTED = 2;
// Downloads per feed view: views' worth of the overall rate each skin starts
// with.
const PRIOR_VIEWS = 20;
// Smoothing for each grid position's rate, in impressions at the overall
// rate. Downloads from the grid are rare enough that deep positions often
// have none.
const PRIOR_IMPRESSIONS = 100;

export function rankSkins(analysis: Analysis): Record<EventSort, RankedSkin[]> {
  return {
    direct: rankDirectLoads(analysis),
    grid_clicks: rankByGridRate(analysis, "clicks", (i) => i.clicked),
    grid_downloads: rankByGridRate(analysis, "downloads", (i, downloaded) =>
      downloaded.has(key(i.sessionId, i.skinMd5))
    ),
    feed_downloads: rankFeedDownloads(analysis),
  };
}

function key(sessionId: string, md5: string): string {
  return `${sessionId}\n${md5}`;
}

/**
 * Sessions that started on the skin's permalink: a shared link, a search
 * result, a bookmark. (Also a reload of a feed page, and /feed, which opens
 * the museum's top skin.)
 */
function rankDirectLoads(analysis: Analysis): RankedSkin[] {
  const startedOnFeed = new Set(
    analysis.sessions.filter((s) => s.startView === "feed").map((s) => s.id)
  );
  const referrers = new Map(
    analysis.sessions.map((s) => [s.id, s.referrerHost ?? "none"])
  );
  const bySkin = new Map<string, Map<string, string>>();
  for (const view of analysis.views) {
    if (view.source !== "link" || !startedOnFeed.has(view.sessionId)) continue;
    let sessions = bySkin.get(view.skinMd5);
    if (sessions == null) {
      sessions = new Map();
      bySkin.set(view.skinMd5, sessions);
    }
    sessions.set(view.sessionId, referrers.get(view.sessionId) ?? "none");
  }
  return sorted(
    [...bySkin].map(([md5, sessions]) => {
      const hosts = new Map<string, number>();
      for (const host of sessions.values()) {
        hosts.set(host, (hosts.get(host) ?? 0) + 1);
      }
      const top = [...hosts]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([host, n]) => `${host} ${n}`)
        .join(", ");
      return {
        md5,
        score: sessions.size,
        detail: `${plural(sessions.size, "load")} · ${top}`,
      };
    })
  );
}

/**
 * How often seeing the skin in the museum grid led to `outcome`, against how
 * often it would for an average skin at the same positions: skins near the
 * top get tapped more whatever they look like.
 */
function rankByGridRate(
  analysis: Analysis,
  noun: string,
  outcome: (
    impression: Analysis["impressions"][number],
    downloaded: Set<string>
  ) => boolean
): RankedSkin[] {
  const downloaded = new Set(
    analysis.views
      .filter((v) => v.downloaded)
      .map((v) => key(v.sessionId, v.skinMd5))
  );
  const impressions = analysis.impressions
    // Positions in the museum's own order only: in the others (newest
    // first, random) a position says nothing about a skin's rank.
    .filter((i) => i.query == null && i.sort === "top")
    .map((i) => ({ ...i, hit: outcome(i, downloaded) }));
  if (impressions.length === 0) return [];

  const overall = impressions.filter((i) => i.hit).length / impressions.length;
  const buckets = new Map<number, { n: number; hits: number }>();
  for (const i of impressions) {
    const bucket = positionBucket(i.position);
    const b = buckets.get(bucket) ?? { n: 0, hits: 0 };
    b.n++;
    if (i.hit) b.hits++;
    buckets.set(bucket, b);
  }
  const expectedAt = new Map(
    [...buckets].map(([bucket, b]) => [
      bucket,
      (b.hits + PRIOR_IMPRESSIONS * overall) / (b.n + PRIOR_IMPRESSIONS),
    ])
  );

  const bySkin = new Map<
    string,
    { n: number; hits: number; expected: number }
  >();
  for (const i of impressions) {
    const s = bySkin.get(i.skinMd5) ?? { n: 0, hits: 0, expected: 0 };
    s.n++;
    if (i.hit) s.hits++;
    s.expected += expectedAt.get(positionBucket(i.position))!;
    bySkin.set(i.skinMd5, s);
  }
  return sorted(
    [...bySkin].map(([md5, s]) => ({
      md5,
      score: (s.hits + PSEUDO_EXPECTED) / (s.expected + PSEUDO_EXPECTED),
      detail: `${plural(s.hits, noun.replace(/s$/, ""))} / ${plural(
        s.n,
        "grid view"
      )} (expected ${s.expected.toFixed(1)})`,
    })),
    (md5) => bySkin.get(md5)!.n
  );
}

// Each of the first 20 positions on its own, then wider and wider ranges:
// 20–23, 24–28, ... (four per doubling).
function positionBucket(position: number): number {
  if (position < 20) return position;
  return 20 + Math.floor(Math.log2(position / 20) * 4);
}

/** Downloads per look at the skin in the feed (not scrolled past). */
function rankFeedDownloads(analysis: Analysis): RankedSkin[] {
  const looked = new Map<string, { md5: string; downloaded: boolean }>();
  for (const v of analysis.views) {
    if (v.passThrough || v.failed) continue;
    const k = key(v.sessionId, v.skinMd5);
    const seen = looked.get(k);
    if (seen == null)
      looked.set(k, { md5: v.skinMd5, downloaded: v.downloaded });
    else seen.downloaded ||= v.downloaded;
  }
  if (looked.size === 0) return [];
  const all = [...looked.values()];
  const overall = all.filter((l) => l.downloaded).length / all.length;
  const bySkin = new Map<string, { n: number; downloads: number }>();
  for (const l of all) {
    const s = bySkin.get(l.md5) ?? { n: 0, downloads: 0 };
    s.n++;
    if (l.downloaded) s.downloads++;
    bySkin.set(l.md5, s);
  }
  return sorted(
    [...bySkin].map(([md5, s]) => ({
      md5,
      score: (s.downloads + PRIOR_VIEWS * overall) / (s.n + PRIOR_VIEWS),
      detail: `${plural(s.downloads, "download")} / ${plural(
        s.n,
        "feed view"
      )}`,
    })),
    (md5) => bySkin.get(md5)!.n
  );
}

// Best score first; ties go to the skin with more data.
function sorted(
  skins: RankedSkin[],
  observations: (md5: string) => number = () => 0
): RankedSkin[] {
  return skins.sort(
    (a, b) => b.score - a.score || observations(b.md5) - observations(a.md5)
  );
}

function plural(n: number, noun: string): string {
  return `${n} ${noun}${n === 1 ? "" : "s"}`;
}
