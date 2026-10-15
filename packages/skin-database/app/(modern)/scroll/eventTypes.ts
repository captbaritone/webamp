// Event types logged by the new museum UI (the grid and the feed). Shared by
// the client (which batches and sends them, see eventLogger.ts), the
// /scroll/events endpoint (which validates and stores them) and analysis
// tasks. Nothing here imports server code, so client components can use it.

// Bump when what an event means or contains changes, so analysis never mixes
// data collected under different rules. Stored on every event as `v`.
//
// - 1 (no `v`): feed-only sessions. Lacks view context, counts time the page
//   was hidden as dwell, and loses the final view's end on exit.
// - 2: feed and grid visits are separate sessions (a feed session names the
//   grid session it came from). The feed was its own shuffled list: museum
//   favorites plus 20% random skins, never repeating within a session.
// - 3: a session is a visit to the museum in one tab (until it's closed or
//   reloaded), spanning the grid and the feed, which are two views of the
//   same list: the museum, or a search. See LegacyEvent for what changed.
export const EVENT_SCHEMA_VERSION = 3;

// The grid and the feed.
export type MuseumView = "grid" | "feed";

// How the visitor got to a view (other than when the session started on it).
export type ViewVia =
  | "grid" // tapped a skin in the grid
  | "menu" // the bottom menu bar
  | "back" // the feed's back arrow or Escape
  | "history"; // the browser's back/forward buttons, or anything else

// How a skin came into view in the feed. Its first skin came in however the
// feed was reached: "link" if the session started on it, otherwise its ViewVia.
export type NavMethod =
  | "link"
  | ViewVia
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

// A list of skins: the museum (`query` null) or a search.
type ListContext = {
  query: string | null;
};

// Identifies a view of one skin in the feed.
type ViewContext = ListContext & {
  skinMd5: string;
  // Its place in the list (0-based), or null for the skin a feed opened on
  // when it isn't in the list (e.g. a shared link, followed by the museum).
  // Skins earlier in a list get more attention regardless of quality, and the
  // museum is already sorted by popularity, so weigh views by this.
  listIndex: number | null;
  // How many skins the visitor had already viewed in this visit to the feed
  // (0 for the one it opened on). Scrolling back up counts too.
  depth: number;
};

export type UserEvent =
  | {
      type: "session_start";
      // The view the session started on, and what it showed.
      view: MuseumView;
      query: string | null;
      // For the feed: the skin it opened on.
      skinMd5: string | null;
      // Host of an external referrer (e.g. "twitter.com"), if any.
      referrerHost: string | null;
      layout: "mobile" | "desktop";
      pointer: "coarse" | "fine";
    }
  // Switched to the other view. For the feed, skinMd5 and listIndex are the
  // skin it opened on; for the grid, the skin it came back to (if any).
  | ({
      type: "view_switch";
      to: MuseumView;
      via: ViewVia;
      skinMd5: string | null;
      listIndex: number | null;
    } & ListContext)
  | { type: "session_end"; reason: "pagehide" }
  // The page was restored from the back/forward cache after a session_end.
  | { type: "session_resume" }
  | ({ type: "skin_view_start"; via: NavMethod } & ViewContext)
  | ({
      type: "skin_view_end";
      // Wall-clock time the skin was in view.
      durationMs: number;
      // Of that, time the page was actually visible (not backgrounded).
      activeMs: number;
      // What ended it: moving on to another skin in the feed, leaving the
      // feed (usually for the grid), or the session ending on it (closed,
      // backgrounded until the browser discarded it, or navigated away).
      endedBy: "next_skin" | "left_feed" | "session_end";
      // Completed presses on Webamp while this skin was in view.
      webampInteractions: number;
    } & ViewContext)
  // The first completed press on Webamp while a skin was in view. Presses
  // that turn into a scroll don't count.
  | { type: "webamp_interact"; skinMd5: string; target: WebampTarget }
  // The page was backgrounded or brought back, with the feed's skin in view
  // (if it's the feed). Mobile browsers often discard backgrounded pages
  // without a pagehide, so a session whose last event is page_hidden ended
  // there.
  | { type: "page_hidden"; skinMd5: string | null }
  | { type: "page_visible"; skinMd5: string | null }
  // Webamp's playback state changed (e.g. "PLAYING", "PAUSED", "STOPPED").
  // Music playing explains long dwell without implying interest in the skin.
  | { type: "audio_status"; status: string; skinMd5: string | null }
  // The feed couldn't load skins' readmes and like counts.
  | { type: "details_fetch_failure"; errorMessage: string }
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
  // The grid's "Tap a skin" hint was shown.
  | { type: "grid_hint_shown" }
  // A search's results arrived.
  | { type: "grid_search"; query: string; resultCount: number }
  // A skin in the grid was tapped. Position is its index in the list
  // (0-based); query is the search it was found with, if any.
  | {
      type: "grid_skin_click";
      skinMd5: string;
      position: number;
      query: string | null;
    };

/**
 * Events (and shapes of events) only in earlier versions' data. Version 3
 * replaced session_start's feed fields (entry, skinMd5s, fromSessionId) and
 * grid_open with session_start/view_switch; ViewContext's `position` (depth
 * into a feed session) and `source` with listIndex, query and depth;
 * skin_view_end's `exit` with endedBy; and the fetch events with
 * details_fetch_failure.
 */
export type LegacyEvent =
  | {
      type: "session_start";
      entry: "link" | "direct" | "grid" | "feed_tab";
      referrerHost: string | null;
      layout: "mobile" | "desktop";
      pointer: "coarse" | "fine";
      skinMd5s: string[];
      fromSessionId: string | null;
    }
  | {
      type: "session_end";
      // "before_unload" only appears in version 1 data.
      reason: "pagehide" | "unmount" | "before_unload";
    }
  | {
      type: "skin_view_start";
      skinMd5: string;
      position: number;
      source: "curated" | "random" | "link";
      via: string;
    }
  | {
      type: "skin_view_end";
      skinMd5: string;
      position: number;
      source: "curated" | "random" | "link";
      durationMs: number;
      activeMs: number;
      exit: boolean;
      webampInteractions: number;
    }
  | { type: "skins_fetch_start"; offset: number }
  | { type: "skins_fetch_success"; offset: number }
  | { type: "skins_fetch_failure"; offset: number; errorMessage: string }
  | {
      type: "grid_open";
      query: string | null;
      referrerHost: string | null;
      layout: "mobile" | "desktop";
      pointer: "coarse" | "fine";
    }
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

// Every type the endpoint accepts. Includes earlier versions' types, for tabs
// still open on an older build.
export const USER_EVENT_TYPES: ReadonlySet<string> = new Set<
  UserEvent["type"] | LegacyEvent["type"]
>([
  "session_start",
  "view_switch",
  "session_end",
  "session_resume",
  "skin_view_start",
  "skin_view_end",
  "page_hidden",
  "page_visible",
  "audio_status",
  "details_fetch_failure",
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
  "grid_hint_shown",
  "grid_search",
  "grid_skin_click",
  "skins_fetch_start",
  "skins_fetch_success",
  "skins_fetch_failure",
  "grid_open",
]);
