import { analyze, type StoredEvent } from "../../events/analyze";
import {
  addToGridTally,
  newGridTally,
  rankGridTally,
} from "../computeDownloadsOrder";

const A = "a".repeat(32);
const B = "b".repeat(32);
const C = "c".repeat(32);

function session(id: string, events: Array<Record<string, any>>) {
  const stored: StoredEvent[] = events.map((event, seq) => ({
    v: 9,
    seq,
    t: seq * 1000,
    receivedAt: seq * 1000,
    ...event,
  })) as StoredEvent[];
  return {
    id,
    userAgent: null,
    firstReceived: 0,
    lastReceived: 0,
    events: stored,
  };
}

// Saw A, B and C at the top of the grid in this order of the museum (or in
// the results for `query`, which aren't sorted), and downloaded `downloaded`
// (if any) from the feed.
function gridSession(
  id: string,
  downloaded: string | null,
  sort = "top",
  query: string | null = null
) {
  const listSort = query == null ? sort : null;
  const context = { query, sort: listSort, source: "list", depth: 0 };
  return session(id, [
    {
      type: "session_start",
      view: "grid",
      query,
      sort: listSort,
      skinMd5: null,
    },
    {
      type: "grid_impressions",
      query,
      sort: listSort,
      skins: [
        [A, 0, "list"],
        [B, 1, "list"],
        [C, 2, "list"],
      ],
    },
    ...(downloaded == null
      ? []
      : [
          {
            type: "skin_view_start",
            skinMd5: downloaded,
            via: "grid",
            listIndex: 0,
            ...context,
          },
          { type: "skin_download", skinMd5: downloaded },
          {
            type: "skin_view_end",
            skinMd5: downloaded,
            listIndex: 0,
            ...context,
            durationMs: 5000,
            activeMs: 5000,
            endedBy: "left_feed",
            webampInteractions: 0,
            readyMs: 300,
          },
        ]),
  ]);
}

function rank(sessions: ReturnType<typeof session>[]) {
  const tally = newGridTally();
  // In two batches, as the nightly job reads them.
  const half = Math.ceil(sessions.length / 2);
  addToGridTally(tally, analyze(sessions.slice(0, half)));
  addToGridTally(tally, analyze(sessions.slice(half)));
  return rankGridTally(tally);
}

test("ranks skins by downloads per grid view", () => {
  const ranked = rank([
    gridSession("s1", C),
    gridSession("s2", C),
    gridSession("s3", A),
    gridSession("s4", C),
    gridSession("s5", null),
    gridSession("s6", null),
    gridSession("s7", null),
    gridSession("s8", null),
  ]);
  expect(ranked.map((s) => [s.md5, s.gridViews, s.downloads])).toEqual([
    [C, 8, 3],
    [A, 8, 1],
    [B, 8, 0],
  ]);
});

test("counts grid views in every order, but not in searches", () => {
  const ranked = rank([
    gridSession("s1", A),
    gridSession("s2", null),
    gridSession("s3", B, "newest"),
    gridSession("s4", B, "random"),
    // People searching are after something in particular.
    gridSession("s5", C, "top", "zelda"),
    gridSession("s6", C, "top", "zelda"),
    gridSession("s7", C, "top", "zelda"),
  ]);
  expect(ranked.map((s) => [s.md5, s.gridViews, s.downloads])).toEqual([
    [B, 4, 2],
    [A, 4, 1],
    [C, 4, 0],
  ]);
});

test("keeps a skin with few views near the average", () => {
  // A's one download from 4 views is 3x the average here, but 4 views say
  // little: its score stays close to 1.
  const sessions = [gridSession("s0", A)];
  for (let i = 1; i < 4; i++) sessions.push(gridSession(`s${i}`, null));
  const ranked = rank(sessions);
  const a = ranked.find((s) => s.md5 === A)!;
  expect(a.score).toBeGreaterThan(1);
  expect(a.score).toBeLessThan(1.1);
});
