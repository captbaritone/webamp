// Turns the new museum UI's event log (see app/(modern)/scroll/eventTypes.ts)
// into the numbers the dev dashboard shows. Pure: the page loads the events.
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
  hasEnd: boolean;
};

export type Impression = {
  sessionId: string;
  skinMd5: string;
  position: number;
  source: string;
  query: string | null;
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
          const key = `${event.query}\n${skinMd5}`;
          if (impressions.has(key)) continue;
          impressions.set(key, {
            sessionId: session.id,
            skinMd5,
            position,
            source: source ?? "list",
            query: event.query ?? null,
            clicked: false,
          });
        }
        break;
      case "grid_skin_click": {
        gridClicks++;
        const impression = impressions.get(`${event.query}\n${event.skinMd5}`);
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
    hasEnd,
  });
  analysis.views.push(...views);
  analysis.impressions.push(...gridImpressions);
}

// Helpers for the page

export type Bin = { label: string; count: number };

/** Count values into bins by their upper bounds (the last bin is open). */
export function histogram(
  values: number[],
  bounds: number[],
  format: (n: number) => string
): Bin[] {
  const bins: Bin[] = [];
  let lower = -Infinity;
  for (const upper of bounds) {
    bins.push({
      label:
        lower === -Infinity
          ? `< ${format(upper)}`
          : `${format(lower)}–${format(upper)}`,
      count: values.filter((v) => v >= lower && v < upper).length,
    });
    lower = upper;
  }
  bins.push({
    label: `≥ ${format(lower)}`,
    count: values.filter((v) => v >= lower).length,
  });
  return bins;
}

/** Count values into bins of whole numbers: each of `singles`, then ranges. */
export function countHistogram(values: number[], bounds: number[]): Bin[] {
  return bounds.map((lower, i) => {
    const upper = bounds[i + 1];
    let label = `${lower}+`;
    if (upper != null) {
      label = upper - lower === 1 ? String(lower) : `${lower}–${upper - 1}`;
    }
    return {
      label,
      count: values.filter((v) => v >= lower && (upper == null || v < upper))
        .length,
    };
  });
}

export function quantile(values: number[], q: number): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const index = (sorted.length - 1) * q;
  const low = Math.floor(index);
  const high = Math.ceil(index);
  return sorted[low] + (sorted[high] - sorted[low]) * (index - low);
}

export function rate<T>(items: T[], test: (item: T) => boolean): number | null {
  if (items.length === 0) return null;
  return items.filter(test).length / items.length;
}

export function countBy<T>(
  items: T[],
  key: (item: T) => string
): Array<[string, number]> {
  const counts = new Map<string, number>();
  for (const item of items) {
    const k = key(item);
    counts.set(k, (counts.get(k) ?? 0) + 1);
  }
  return [...counts].sort((a, b) => b[1] - a[1]);
}

export function groupBy<T>(
  items: T[],
  key: (item: T) => string
): Map<string, T[]> {
  const groups = new Map<string, T[]>();
  for (const item of items) {
    const k = key(item);
    let group = groups.get(k);
    if (group == null) {
      group = [];
      groups.set(k, group);
    }
    group.push(item);
  }
  return groups;
}

/** The bucket (largest bound at or below) a value falls in, as a label. */
export function bucketLabel(bounds: number[], value: number): string {
  let index = 0;
  for (let i = 0; i < bounds.length; i++) if (value >= bounds[i]) index = i;
  const lower = bounds[index];
  const upper = bounds[index + 1];
  if (upper == null) return `${lower}+`;
  return upper - lower === 1 ? String(lower) : `${lower}–${upper - 1}`;
}

/**
 * Of feed visits, the share that reached each depth (1 = saw a first skin,
 * 2 = went on to a second...), counting skins looked at, not scrolled past.
 */
export function feedRetention(views: View[], maxDepth: number): number[] {
  const visits = new Map<string, number>();
  // A visit is a session's run of views between switches to the feed; its
  // visitDepth restarts at 0.
  let visitIndex = 0;
  let previous: View | null = null;
  for (const view of views) {
    if (
      previous == null ||
      view.sessionId !== previous.sessionId ||
      view.visitDepth <= previous.visitDepth
    ) {
      visitIndex++;
    }
    previous = view;
    if (view.passThrough) continue;
    const key = String(visitIndex);
    visits.set(key, (visits.get(key) ?? 0) + 1);
  }
  const lengths = [...visits.values()];
  const result: number[] = [];
  for (let depth = 1; depth <= maxDepth; depth++) {
    result.push(
      lengths.length === 0
        ? 0
        : lengths.filter((n) => n >= depth).length / lengths.length
    );
  }
  return result;
}

/** Items grouped by bucket (see bucketLabel), in the buckets' order. */
export function bucketGroups<T>(
  items: T[],
  bounds: number[],
  value: (item: T) => number
): Array<[string, T[]]> {
  const groups = groupBy(items, (item) => bucketLabel(bounds, value(item)));
  const order = bounds.map((bound) => bucketLabel(bounds, bound));
  return [...groups].sort((a, b) => order.indexOf(a[0]) - order.indexOf(b[0]));
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
