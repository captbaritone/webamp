import { analyze, type StoredEvent } from "../../app/dev/events/analyze";
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

// Saw A, B and C at the top of the grid in this order of the museum, and
// downloaded `downloaded` (if any) from the feed.
function gridSession(id: string, downloaded: string | null, sort = "top") {
  const context = { query: null, sort, source: "list", depth: 0 };
  return session(id, [
    { type: "session_start", view: "grid", query: null, sort, skinMd5: null },
    {
      type: "grid_impressions",
      query: null,
      sort,
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

test("ranks skins by downloads per grid view, against their positions", () => {
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
  expect(ranked.map((s) => s.md5)).toEqual([C, A, B]);
  expect(ranked[0].gridViews).toBe(8);
});

test("ignores grid views in the museum's other orders", () => {
  const ranked = rank([
    gridSession("s1", A),
    gridSession("s2", null),
    // Positions in the newest-first order say nothing about rank.
    gridSession("s3", B, "newest"),
    gridSession("s4", B, "newest"),
  ]);
  expect(ranked.map((s) => [s.md5, s.gridViews])).toEqual([
    [A, 2],
    [B, 2],
    [C, 2],
  ]);
});
