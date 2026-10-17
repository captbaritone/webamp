import { analyze, type StoredEvent } from "../../dev/events/analyze";
import { rankSkins } from "../rankings";

const A = "a".repeat(32);
const B = "b".repeat(32);
const C = "c".repeat(32);

function session(id: string, events: Array<Record<string, any>>) {
  const stored: StoredEvent[] = events.map((event, seq) => ({
    v: 7,
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

function feedView(skinMd5: string, source: string, depth: number) {
  const context = { query: null, listIndex: null, source, depth };
  return [
    { type: "skin_view_start", skinMd5, via: "link", ...context },
    {
      type: "skin_view_end",
      skinMd5,
      ...context,
      durationMs: 5000,
      activeMs: 5000,
      endedBy: "next_skin",
      webampInteractions: 0,
      readyMs: 300,
    },
  ];
}

function gridSession(id: string, clicked: string | null) {
  return session(id, [
    { type: "session_start", view: "grid", query: null, skinMd5: null },
    {
      type: "grid_impressions",
      query: null,
      skins: [
        [A, 0, "list"],
        [B, 1, "list"],
        [C, 2, "list"],
      ],
    },
    ...(clicked == null
      ? []
      : [
          {
            type: "grid_skin_click",
            skinMd5: clicked,
            position: 0,
            source: "list",
            query: null,
          },
        ]),
  ]);
}

test("counts sessions that started on a skin's permalink", () => {
  const { direct } = rankSkins(
    analyze([
      session("s1", [
        {
          type: "session_start",
          view: "feed",
          query: null,
          skinMd5: B,
          referrerHost: "google.com",
        },
        ...feedView(B, "link", 0),
        // Scrolled on to A, which wasn't a direct load.
        ...feedView(A, "list", 1),
      ]),
      session("s2", [
        {
          type: "session_start",
          view: "feed",
          query: null,
          skinMd5: B,
          referrerHost: null,
        },
        ...feedView(B, "link", 0),
      ]),
      session("s3", [
        {
          type: "session_start",
          view: "feed",
          query: null,
          skinMd5: A,
          referrerHost: null,
        },
        ...feedView(A, "link", 0),
      ]),
    ])
  );
  expect(direct.map((s) => [s.md5, s.score])).toEqual([
    [B, 2],
    [A, 1],
  ]);
  expect(direct[0].detail).toBe("2 loads · google.com 1, none 1");
});

test("ranks skins by how often they're tapped when seen in the grid", () => {
  const { grid_clicks } = rankSkins(
    analyze([
      gridSession("s1", C),
      gridSession("s2", C),
      gridSession("s3", A),
      gridSession("s4", C),
      gridSession("s5", null),
      gridSession("s6", null),
      gridSession("s7", null),
      gridSession("s8", null),
    ])
  );
  expect(grid_clicks.map((s) => s.md5)).toEqual([C, A, B]);
  expect(grid_clicks[0].detail).toMatch(/^3 clicks \/ 8 grid views/);
});

test("ranks downloads per feed view, smoothed toward the overall rate", () => {
  const download = (skinMd5: string) => ({ type: "skin_download", skinMd5 });
  const looks = (id: string, skinMd5: string, downloaded: boolean) => {
    const [start, end] = feedView(skinMd5, "list", 0);
    return session(id, [
      { type: "session_start", view: "feed", query: null, skinMd5 },
      start,
      ...(downloaded ? [download(skinMd5)] : []),
      end,
    ]);
  };
  const { feed_downloads } = rankSkins(
    analyze([
      looks("s1", A, true),
      looks("s2", A, false),
      looks("s3", B, true),
      looks("s4", B, true),
      looks("s5", B, true),
      looks("s6", C, false),
    ])
  );
  expect(feed_downloads.map((s) => s.md5)).toEqual([B, A, C]);
  expect(feed_downloads[0].detail).toBe("3 downloads / 3 feed views");
});
