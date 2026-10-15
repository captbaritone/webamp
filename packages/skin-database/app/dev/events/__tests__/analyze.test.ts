import {
  analyze,
  botReasons,
  feedRetention,
  type StoredEvent,
} from "../analyze";

const A = "a".repeat(32);
const B = "b".repeat(32);

function session(id: string, events: Array<Record<string, any>>) {
  const stored: StoredEvent[] = events.map((event, seq) => ({
    v: 4,
    seq,
    t: seq * 1000,
    receivedAt: seq * 1000 + 50,
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

function view(
  skinMd5: string,
  depth: number,
  activeMs: number,
  endedBy: string
) {
  const context = { query: null, listIndex: depth, source: "list", depth };
  return [
    { type: "skin_view_start", skinMd5, via: "scroll", ...context },
    {
      type: "skin_view_end",
      skinMd5,
      ...context,
      durationMs: activeMs,
      activeMs,
      endedBy,
      webampInteractions: 0,
      readyMs: 300,
    },
  ];
}

test("follows a session from the grid through the feed", () => {
  const result = analyze([
    session("s1", [
      {
        type: "session_start",
        view: "grid",
        layout: "mobile",
        pointer: "coarse",
      },
      {
        type: "grid_impressions",
        query: null,
        skins: [
          [A, 0, "list"],
          [B, 1, "random"],
        ],
      },
      {
        type: "grid_skin_click",
        skinMd5: A,
        position: 0,
        source: "list",
        query: null,
      },
      { type: "view_switch", to: "feed", via: "grid" },
      ...view(A, 0, 100, "next_skin"),
      {
        type: "skin_view_start",
        skinMd5: B,
        depth: 1,
        source: "random",
        listIndex: 1,
        query: null,
        via: "scroll",
      },
      { type: "skin_download", skinMd5: B },
      {
        type: "skin_view_end",
        skinMd5: B,
        depth: 1,
        source: "random",
        listIndex: 1,
        query: null,
        durationMs: 8000,
        activeMs: 8000,
        endedBy: "session_end",
        webampInteractions: 1,
        readyMs: 400,
      },
      { type: "session_end", reason: "pagehide" },
    ]),
  ]);
  const [summary] = result.sessions;
  expect(summary.feedViews).toBe(1); // A was scrolled past
  expect(summary.endedIn).toBe("feed");
  expect(summary.maxGridPosition).toBe(1);
  expect(result.impressions.find((i) => i.skinMd5 === A)!.clicked).toBe(true);
  const b = result.views.find((v) => v.skinMd5 === B)!;
  expect(b).toMatchObject({
    source: "random",
    downloaded: true,
    exit: true,
    readyMs: 400,
  });
  expect(result.views.find((v) => v.skinMd5 === A)!.passThrough).toBe(true);
});

test("a session that goes back to the grid didn't end in the feed", () => {
  const result = analyze([
    session("s1", [
      { type: "session_start", view: "feed", layout: "desktop" },
      ...view(A, 0, 5000, "left_feed"),
      { type: "view_switch", to: "grid", via: "back" },
    ]),
  ]);
  expect(result.sessions[0].endedIn).toBe("grid");
  expect(result.views[0].exit).toBe(false);
});

test("notices lost events and sessions that never ended", () => {
  const stored = session("s1", [
    { type: "session_start", view: "feed" },
    ...view(A, 0, 5000, "next_skin"),
  ]);
  stored.events.splice(1, 1); // seq 1 never arrived
  const result = analyze([stored]);
  expect(result.sessions[0].lostEvents).toBe(1);
  expect(result.sessions[0].hasEnd).toBe(false);
});

test("retention counts how far each visit to the feed got", () => {
  const result = analyze([
    session("s1", [
      ...view(A, 0, 5000, "next_skin"),
      ...view(B, 1, 5000, "session_end"),
    ]),
    session("s2", [...view(A, 0, 5000, "session_end")]),
  ]);
  expect(feedRetention(result.views, 3)).toEqual([1, 0.5, 0]);
});

test("spots sessions that don't look like people", () => {
  const person = session("p", [
    { type: "session_start", view: "grid", automated: false, visible: true },
  ]);
  expect(botReasons(person)).toEqual([]);
  expect(
    botReasons({
      ...person,
      userAgent: "Mozilla/5.0 (compatible; Googlebot/2.1)",
    })
  ).toEqual(["bot user agent"]);
  expect(
    botReasons(
      session("a", [
        { type: "session_start", view: "grid", automated: true, visible: true },
      ])
    )
  ).toEqual(["automated browser"]);
  expect(
    botReasons(session("n", [{ type: "session_end", reason: "pagehide" }]))
  ).toEqual(["no start"]);
  const unseen = session("u", [
    { type: "session_start", view: "feed", visible: false },
  ]);
  expect(botReasons(unseen)).toEqual(["never seen"]);
  unseen.events.push({ type: "page_visible", seq: 1, t: 1, receivedAt: 1 });
  expect(botReasons(unseen)).toEqual([]);
});
