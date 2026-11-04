// Turns the new museum UI's event log (see app/(modern)/scroll/eventTypes.ts)
// into views, grid impressions and per-session summaries, for the nightly
// Downloads order (tasks/computeDownloadsOrder.ts) and for looking into the
// data. Pure: loadEvents.ts reads the events.
//
// Works across versions 3 and 4 (earlier ones were a different design):
// fields only in version 4 (a view's source, readyMs, grid impressions...)
// are simply missing from version 3 sessions.

// Events as stored, from any version: read loosely.
export type StoredEvent = {
  type: string;
  v?: number;
  seq: number;
  t: number;
  // When the server got it (ms), added by the loader.
  receivedAt: number;
  [field: string]: any;
};

export type StoredSession = {
  id: string;
  // The browser's, from version 6 on.
  userAgent: string | null;
  // Server receive times (ms) of its first and last batches.
  firstReceived: number;
  lastReceived: number;
  events: StoredEvent[];
};

// Views shorter than this that moved on to the next skin were scrolled
// through, not looked at.
export const PASS_THROUGH_MS = 300;

// A search this soon after the last, extending or trimming it, is the same
// search still being typed.
const SEARCH_TYPING_MS = 5000;

export type View = {
  sessionId: string;
  skinMd5: string;
  source: string;
  listIndex: number | null;
  query: string | null;
  // The museum's order (null for a search). Before version 9, "top".
  sort: string | null;
  depth: number;
  // Into this visit to the feed (0 for the skin it opened on).
  visitDepth: number;
  activeMs: number | null;
  durationMs: number | null;
  endedBy: string | null;
  readyMs: number | null;
  webampInteractions: number;
  // On a touch screen, time spent using Webamp (version 5), or null if they
  // never tapped to use it.
  webampUseMs: number | null;
  passThrough: boolean;
  // The session ended on it (it was the last thing seen, with nothing after).
  exit: boolean;
  failed: boolean;
  // Done while it was in view.
  liked: boolean;
  downloaded: boolean;
  // How long after it came into view it was first downloaded (client clock).
  downloadAfterMs: number | null;
  // When it came into view (client clock).
  startedAt: number;
  shared: boolean;
  readmeExpanded: boolean;
  nsfwRevealed: boolean;
  shareOpened: boolean;
  layout: string | null;
};

export type SessionSummary = {
  id: string;
  version: number;
  startView: string | null;
  layout: string | null;
  pointer: string | null;
  referrerHost: string | null;
  durationMs: number;
  feedViews: number;
  distinctSkins: number;
  openedFeed: boolean;
  gridImpressions: number;
  maxGridPosition: number | null;
  gridClicks: number;
  // skin_download events (clicks on Download).
  downloads: number;
  searches: number;
  playedAudio: boolean;
  // Where it ended: on a skin in the feed, in the grid, after following a
  // link elsewhere, or with nothing but its start.
  endedIn: "feed" | "grid" | "link" | "bounce" | "other";
  lostEvents: number;
  // How we know it ended: it sent session_end; the page was hidden and never
  // came back (the browser discarded it in the background, which sends
  // nothing, but everything up to the hide was sent with it); or neither, so
  // it was cut off (the browser quit or crashed, the app was killed) and may
  // be missing its last events.
  end: "session_end" | "hidden" | "cut_off";
};

export type Impression = {
  sessionId: string;
  skinMd5: string;
  position: number;
  source: string;
  query: string | null;
  // The museum's order (null for a search). Before version 9, "top".
  sort: string | null;
  clicked: boolean;
};

export type Analysis = {
  sessions: SessionSummary[];
  views: View[];
  impressions: Impression[];
  searches: Array<{ query: string; resultCount: number }>;
  linkClicks: Array<{ href: string; external: boolean; newTab: boolean }>;
  viewSwitches: Array<{ to: string; via: string }>;
  webampTargets: Map<string, number>;
  loadFailures: Array<{ skinMd5: string; errorMessage: string }>;
  eventCounts: Map<string, number>;
  unendedViews: number;
  // Server receive time minus the client's clock, per event (ms).
  clockSkews: number[];
  firstReceived: number | null;
  lastReceived: number | null;
};

const ACTION_FIELDS: Record<string, keyof View> = {
  share_success: "shared",
  share_open: "shareOpened",
  readme_expand: "readmeExpanded",
  nsfw_reveal: "nsfwRevealed",
};

// The order of the list an event is about: for the museum, its `sort` (from
// version 9; before, there was only its own order), and null for a search.
function listSort(event: StoredEvent): string | null {
  if (event.query != null) return null;
  return event.sort ?? "top";
}

export function analyze(stored: StoredSession[]): Analysis {
  const analysis: Analysis = {
    sessions: [],
    views: [],
    impressions: [],
    searches: [],
    linkClicks: [],
    viewSwitches: [],
    webampTargets: new Map(),
    loadFailures: [],
    eventCounts: new Map(),
    unendedViews: 0,
    clockSkews: [],
    firstReceived: null,
    lastReceived: null,
  };
  for (const session of stored) {
    analyzeSession(session, analysis);
    analysis.firstReceived = Math.min(
      analysis.firstReceived ?? Infinity,
      session.firstReceived
    );
    analysis.lastReceived = Math.max(
      analysis.lastReceived ?? -Infinity,
      session.lastReceived
    );
  }
  return analysis;
}

function analyzeSession(session: StoredSession, analysis: Analysis): void {
  const events = [...session.events].sort((a, b) => a.seq - b.seq);
  const start = events.find((e) => e.type === "session_start");
  const layout = start?.layout ?? null;
  const views: View[] = [];
  const open = new Map<number, View>();
  // The view in view now (the last started and not yet ended).
  let current: View | null = null;
  let lastSearch: { query: string; t: number } | null = null;
  // The view whose Webamp is being used (touch screens).
  let usingWebamp: View | null = null;
  let visitDepth = 0;
  const impressions = new Map<string, Impression>();
  let lastKind: "feed" | "grid" | "link" | null = null;
  let gridClicks = 0;
  let downloads = 0;
  let searches = 0;
  let playedAudio = false;
  let hasEnd = false;

  for (const event of events) {
    analysis.eventCounts.set(
      event.type,
      (analysis.eventCounts.get(event.type) ?? 0) + 1
    );
    switch (event.type) {
      case "session_start":
        lastKind = event.view === "feed" ? "feed" : "grid";
        break;
      case "view_switch":
        analysis.viewSwitches.push({ to: event.to, via: event.via });
        lastKind = event.to === "feed" ? "feed" : "grid";
        if (event.to === "feed") visitDepth = 0;
        current = null;
        break;
      case "skin_view_start": {
        const view: View = {
          sessionId: session.id,
          skinMd5: event.skinMd5,
          // Before version 4, skins not in the list were the linked one.
          source: event.source ?? (event.listIndex == null ? "link" : "list"),
          listIndex: event.listIndex ?? null,
          query: event.query ?? null,
          sort: listSort(event),
          depth: event.depth,
          visitDepth: visitDepth++,
          activeMs: null,
          durationMs: null,
          endedBy: null,
          readyMs: null,
          webampInteractions: 0,
          webampUseMs: null,
          passThrough: false,
          exit: false,
          failed: false,
          liked: false,
          downloaded: false,
          downloadAfterMs: null,
          startedAt: event.t,
          shared: false,
          readmeExpanded: false,
          nsfwRevealed: false,
          shareOpened: false,
          layout,
        };
        open.set(event.depth, view);
        views.push(view);
        current = view;
        lastKind = "feed";
        break;
      }
      case "skin_view_end": {
        const view = open.get(event.depth);
        if (view == null) break;
        open.delete(event.depth);
        view.activeMs = event.activeMs;
        view.durationMs = event.durationMs;
        view.endedBy = event.endedBy ?? null;
        view.readyMs = event.readyMs ?? null;
        view.webampInteractions = event.webampInteractions ?? 0;
        view.passThrough =
          event.endedBy === "next_skin" && event.durationMs < PASS_THROUGH_MS;
        break;
      }
      case "skin_load_failure":
        analysis.loadFailures.push({
          skinMd5: event.skinMd5,
          errorMessage: event.errorMessage,
        });
        for (const view of open.values()) {
          if (view.skinMd5 === event.skinMd5) view.failed = true;
        }
        break;
      case "webamp_use_start":
        if (current != null && current.skinMd5 === event.skinMd5) {
          current.webampUseMs ??= 0;
          usingWebamp = current;
        }
        break;
      case "webamp_use_end":
        if (usingWebamp != null) usingWebamp.webampUseMs! += event.durationMs;
        usingWebamp = null;
        break;
      case "skin_like":
        if (current != null && current.skinMd5 === event.skinMd5) {
          current.liked = event.liked;
        }
        break;
      case "webamp_interact":
        analysis.webampTargets.set(
          event.target,
          (analysis.webampTargets.get(event.target) ?? 0) + 1
        );
        break;
      case "audio_status":
        if (event.status === "PLAYING") playedAudio = true;
        break;
      case "grid_impressions":
        for (const [skinMd5, position, source] of event.skins ?? []) {
          const key = `${event.query}\n${listSort(event)}\n${skinMd5}`;
          if (impressions.has(key)) continue;
          impressions.set(key, {
            sessionId: session.id,
            skinMd5,
            position,
            source: source ?? "list",
            query: event.query ?? null,
            sort: listSort(event),
            clicked: false,
          });
        }
        break;
      case "grid_skin_click": {
        gridClicks++;
        const impression = impressions.get(
          `${event.query}\n${listSort(event)}\n${event.skinMd5}`
        );
        if (impression != null) impression.clicked = true;
        break;
      }
      case "grid_search":
        // Searches run as you type, so "ev", "evange", "evangelion" are one
        // search: each replaces the one before it if it came within
        // SEARCH_TYPING_MS and either extends or trims it.
        if (
          lastSearch != null &&
          event.t - lastSearch.t < SEARCH_TYPING_MS &&
          (event.query.startsWith(lastSearch.query) ||
            lastSearch.query.startsWith(event.query))
        ) {
          analysis.searches[analysis.searches.length - 1] = {
            query: event.query,
            resultCount: event.resultCount,
          };
        } else {
          searches++;
          analysis.searches.push({
            query: event.query,
            resultCount: event.resultCount,
          });
        }
        lastSearch = { query: event.query, t: event.t };
        break;
      case "link_click":
        // The Download button's blob: link, logged as a link before it was
        // filtered out (its href came out as the blob's inner URL).
        if (!event.external && !String(event.href).startsWith("/")) break;
        analysis.linkClicks.push({
          href: event.href,
          external: event.external,
          newTab: event.newTab,
        });
        if (!event.newTab) lastKind = "link";
        break;
      case "session_end":
        hasEnd = true;
        break;
      case "session_resume":
        hasEnd = false;
        break;
      case "skin_download":
        downloads++;
        if (current != null && current.skinMd5 === event.skinMd5) {
          current.downloaded = true;
          current.downloadAfterMs ??= event.t - current.startedAt;
        }
        break;
      default: {
        const field = ACTION_FIELDS[event.type];
        if (
          field != null &&
          current != null &&
          current.skinMd5 === event.skinMd5
        ) {
          (current as any)[field] = true;
        }
      }
    }
    analysis.clockSkews.push(event.receivedAt - event.t);
  }
  analysis.unendedViews += open.size;

  // The session ended on the last skin it showed, if that's where it was.
  const looked = views.filter((view) => !view.passThrough);
  if (lastKind === "feed" && looked.length > 0) looked.at(-1)!.exit = true;

  const seqs = events.map((e) => e.seq);
  const lostEvents =
    seqs.length === 0 ? 0 : Math.max(...seqs) + 1 - new Set(seqs).size;
  const interacted = events.some(
    (e) =>
      e.type !== "session_start" &&
      e.type !== "session_end" &&
      e.type !== "page_hidden" &&
      e.type !== "page_visible" &&
      e.type !== "grid_impressions" &&
      e.type !== "grid_hint_shown" &&
      e.type !== "scroll_hint_shown"
  );
  const gridImpressions = [...impressions.values()];
  analysis.sessions.push({
    id: session.id,
    version: Math.max(...events.map((e) => e.v ?? 1)),
    startView: start?.view ?? null,
    layout,
    pointer: start?.pointer ?? null,
    referrerHost: start?.referrerHost ?? null,
    durationMs: events.length === 0 ? 0 : events.at(-1)!.t - events[0].t,
    feedViews: looked.length,
    distinctSkins: new Set(looked.map((view) => view.skinMd5)).size,
    openedFeed: views.length > 0,
    gridImpressions: gridImpressions.length,
    maxGridPosition:
      gridImpressions.length === 0
        ? null
        : Math.max(...gridImpressions.map((i) => i.position)),
    gridClicks,
    downloads,
    searches,
    playedAudio,
    endedIn: !interacted ? "bounce" : lastKind ?? "other",
    lostEvents,
    end: hasEnd
      ? "session_end"
      : events.at(-1)?.type === "page_hidden"
      ? "hidden"
      : "cut_off",
  });
  analysis.views.push(...views);
  analysis.impressions.push(...gridImpressions);
}

// Suspected bots

// Crawlers, link previews, headless and scripted browsers, HTTP libraries.
const BOT_USER_AGENT =
  /bot|crawl|spider|slurp|archiver|preview|facebookexternalhit|embedly|headless|lighthouse|phantom|puppeteer|playwright|selenium|python|curl|wget|httpclient|okhttp|go-http|java\//i;

export const BOT_REASONS = {
  "no start":
    "Its first events never arrived (only the ones sent as the page closed did), as when a page is loaded by something that isn't a person's browser.",
  "bot user agent":
    "Its user agent is a crawler, link preview, headless browser or HTTP library (version 6 on).",
  "automated browser":
    "The browser said it was driven by automation (navigator.webdriver; version 6 on).",
  "never seen":
    "The page was never visible: loaded in the background and closed (version 6 on).",
} as const;

export type BotReason = keyof typeof BOT_REASONS;

/** Why a session looks like it wasn't a person, if it does. */
export function botReasons(session: StoredSession): BotReason[] {
  const reasons: BotReason[] = [];
  const start = session.events.find((e) => e.type === "session_start");
  if (start == null) reasons.push("no start");
  if (session.userAgent != null && BOT_USER_AGENT.test(session.userAgent)) {
    reasons.push("bot user agent");
  }
  if (start?.automated === true) reasons.push("automated browser");
  if (
    start?.visible === false &&
    !session.events.some((e) => e.type === "page_visible")
  ) {
    reasons.push("never seen");
  }
  return reasons;
}
