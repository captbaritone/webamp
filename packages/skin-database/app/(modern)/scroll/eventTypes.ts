// Event types logged by the /scroll feed. Shared by the client (which batches
// and sends them, see eventLogger.ts), the /scroll/events endpoint (which
// validates and stores them) and analysis tasks. Nothing here imports server
// code, so client components can use it.

// Bump when what an event means or contains changes, so analysis never mixes
// data collected under different rules. Stored on every event as `v`. Events
// from before versioning (no `v`) are version 1: they lack view context, count
// time the page was hidden as dwell, and lose the final view's end on exit.
export const EVENT_SCHEMA_VERSION = 2;

// Where a skin in the feed came from.
export type SkinSource =
  | "curated" // museum_sort_order
  | "random" // the random "fresh" share of each page
  | "link"; // the skin the visitor landed on (e.g. a shared link)

// How the visitor got to the feed.
export type FeedEntry =
  | "link" // landed directly on /scroll/skin/:md5, e.g. a shared link
  | "direct" // landed directly on /scroll/skin
  | "grid" // tapped a skin in the /scroll grid
  | "feed_tab"; // the bottom menu bar's feed button

// How a skin came into view.
export type NavMethod =
  | "initial" // the first skin of the session
  | "scroll" // swipe, wheel or trackpad
  | "key" // J/K, arrows or space
  | "button" // the desktop previous/next buttons
  | "hint" // tapped the "Swipe up" hint pill
  | "resume"; // the session resumed from the back/forward cache

// What a visitor did in Webamp (see webamp_interact).
export type WebampTarget =
  | "slider" // volume, balance, seek
  | "drag" // a window's draggable area (title bar, background)
  | "control"; // anything else: buttons, the playlist, the equalizer

// Identifies a view of one skin: which skin, where it was in the feed
// (0-based) and where it came from. Position matters because skins shown
// earlier get more attention regardless of quality.
type ViewContext = {
  skinMd5: string;
  position: number;
  source: SkinSource;
};

export type UserEvent =
  | {
      type: "session_start";
      entry: FeedEntry;
      // Host of an external referrer (e.g. "twitter.com"), if any.
      referrerHost: string | null;
      layout: "mobile" | "desktop";
      pointer: "coarse" | "fine";
      // The skins the page was rendered with. Recorded as seen by the session
      // so later pages exclude them (sessions aren't written until a browser
      // reports in, which keeps bots out of the session tables).
      skinMd5s: string[];
      // The grid session the visitor came from, if they tapped a grid skin.
      fromSessionId: string | null;
    }
  | {
      type: "session_end";
      // "before_unload" only appears in version 1 data.
      reason: "pagehide" | "unmount" | "before_unload";
    }
  // The page was restored from the back/forward cache after a session_end.
  | { type: "session_resume" }
  | ({ type: "skin_view_start"; via: NavMethod } & ViewContext)
  | ({
      type: "skin_view_end";
      // Wall-clock time the skin was in view.
      durationMs: number;
      // Of that, time the page was actually visible (not backgrounded).
      activeMs: number;
      // True if the session ended on this skin (closed, backgrounded until
      // the browser discarded it, or navigated away from the feed).
      exit: boolean;
      // Completed presses on Webamp while this skin was in view.
      webampInteractions: number;
    } & ViewContext)
  // The first completed press on Webamp while a skin was in view. Presses
  // that turn into a scroll don't count.
  | { type: "webamp_interact"; skinMd5: string; target: WebampTarget }
  // The page was backgrounded or brought back. Mobile browsers often discard
  // backgrounded pages without a pagehide, so a session whose last event is
  // page_hidden ended there.
  | { type: "page_hidden"; skinMd5: string | null }
  | { type: "page_visible"; skinMd5: string | null }
  // Webamp's playback state changed (e.g. "PLAYING", "PAUSED", "STOPPED").
  // Music playing explains long dwell without implying interest in the skin.
  | { type: "audio_status"; status: string; skinMd5: string | null }
  | { type: "skins_fetch_start"; offset: number }
  | { type: "skins_fetch_success"; offset: number }
  | { type: "skins_fetch_failure"; offset: number; errorMessage: string }
  | { type: "readme_expand"; skinMd5: string }
  | { type: "skin_download"; skinMd5: string }
  | { type: "skin_like"; skinMd5: string; liked: boolean }
  | { type: "skin_flag_nsfw"; skinMd5: string }
  // Chose to see NSFW skins (from the cover over one in the feed).
  | { type: "nsfw_reveal"; skinMd5: string }
  | { type: "share_open"; skinMd5: string }
  | { type: "share_success"; skinMd5: string }
  | { type: "share_failure"; skinMd5: string; errorMessage: string }
  | { type: "scroll_hint_shown" }
  // The /scroll grid. Grid visits are their own sessions (no session_start);
  // a feed session reached from the grid names it in fromSessionId.
  | {
      type: "grid_open";
      query: string | null;
      referrerHost: string | null;
      layout: "mobile" | "desktop";
      pointer: "coarse" | "fine";
    }
  // The grid's "Tap a skin" hint was shown.
  | { type: "grid_hint_shown" }
  // A search's results arrived.
  | { type: "grid_search"; query: string; resultCount: number }
  // A skin in the grid was tapped. Position is its index in the grid (0-based);
  // query is the search it was found with, if any.
  | {
      type: "grid_skin_click";
      skinMd5: string;
      position: number;
      query: string | null;
    }
  /** @deprecated Only in early version 1 data. */
  | { type: "skin_view"; skinMd5: string };

// What's sent and stored for each event.
export type LoggedEvent = UserEvent & {
  v: number;
  // Order within the session, from 0. Gaps mean lost events.
  seq: number;
  // Client clock (ms since epoch) when it happened. Use for ordering and
  // timing within a session; the server's receive time is stored separately.
  t: number;
};

// Every type the endpoint accepts.
export const USER_EVENT_TYPES: ReadonlySet<string> = new Set<UserEvent["type"]>(
  [
    "session_start",
    "session_end",
    "session_resume",
    "skin_view_start",
    "skin_view_end",
    "page_hidden",
    "page_visible",
    "audio_status",
    "skins_fetch_start",
    "skins_fetch_success",
    "skins_fetch_failure",
    "readme_expand",
    "skin_download",
    "skin_like",
    "skin_flag_nsfw",
    "nsfw_reveal",
    "share_open",
    "share_success",
    "share_failure",
    "scroll_hint_shown",
    "webamp_interact",
    "grid_open",
    "grid_hint_shown",
    "grid_search",
    "grid_skin_click",
  ]
);
