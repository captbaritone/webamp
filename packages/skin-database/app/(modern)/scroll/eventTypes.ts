// Event types logged by the new museum UI (the grid and the feed). Shared by
// the client (which batches and sends them, see eventLogger.ts), the
// /scroll/events endpoint (which validates and stores them) and analysis
// tasks. Nothing here imports server code, so client components can use it.

import type { MuseumSort } from "./museumList";

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
// - 4: the museum list (in the grid and the feed) has random skins in some
//   places (see museumList.ts), counted in its positions. Each skin shown is
//   logged with its source ("list" or "random"): ViewContext's `source`,
//   grid_impressions and grid_skin_click. Adds skin_view_end's readyMs,
//   skin_load_failure, grid_impressions and link_click.
// - 5: on touch screens, touches reach Webamp only while the visitor is
//   using it (webamp_use_start/webamp_use_end); otherwise they scroll the
//   feed. Before, each touch was guessed to be for one or the other, so
//   webamp_interact and webampInteractions on touch screens mean something
//   different from version 5 on.
// - 6: a page the browser prerendered (e.g. from a search result) sends
//   nothing until it's opened, so it no longer leaves a session nobody saw.
//   session_start says whether it was prerendered, whether the browser is
//   automated, and whether the page was visible. The server records each
//   session's user agent (the session table).
// - 7: adds menu_open. Before, opening the bottom bar's menu wasn't logged,
//   only following a link in it (link_click).
// - 8: no bottom menu bar, so no Grid and Feed buttons: the feed is reached
//   only from the grid (or a link), and nothing is reached "via" "menu". Its
//   menu became a "…" button in a bar floating at the bottom of every page,
//   now with Upload in it, so menu_open counts opening that. Off the grid,
//   that bar also has a Back button (to the page before, or "Browse skins"
//   into the grid if there wasn't one; logged "via" "back"), in place of the
//   feed's back arrow beside each skin's title. And no like button, so no
//   skin_like.
// - 9: the museum can be browsed newest first or in a random order, as well
//   as its own, so a list is its query and, for the museum, its `sort`
//   (ListContext, session_start, grid_skin_click). Positions in a list mean
//   something different in each order. Adds sort_open and grid_sort.
// - 10: searches understand the classic museum's has:/filter: syntax again
//   (e.g. has:ani; before, it was searched for as words), and the search box
//   has a menu of those filters. Adds search_filters_open and
//   search_filter_toggle.
export const EVENT_SCHEMA_VERSION = 10;

// The most skins in one grid_impressions event (more are split across
// several), keeping it within the endpoint's size limit.
export const MAX_GRID_IMPRESSIONS = 50;

// The grid and the feed.
export type MuseumView = "grid" | "feed";

// How the visitor got to a view (other than when the session started on it).
export type ViewVia =
  | "grid" // tapped a skin in the grid
  | "menu" // the bottom menu bar's Grid and Feed buttons (before version 8)
  | "back" // the Back button (before version 8, the feed's back arrow), or Escape in the feed
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

// How the visitor stopped using Webamp (see webamp_use_end): the Done
// button, tapping elsewhere, Escape, or moving on (another skin, or leaving
// the feed).
export type WebampExit = "done" | "outside" | "escape" | "moved_on";

// What a visitor did in Webamp (see webamp_interact).
export type WebampTarget =
  | "slider" // volume, balance, seek
  | "drag" // a window's draggable area (title bar, background)
  | "control"; // anything else: buttons, the playlist, the equalizer

// A list of skins: the museum (`query` null) in one of its orders, or a
// search (`sort` null: searches are best match first). Before version 9 the
// museum was only in its own order ("top"), and there's no `sort`.
type ListContext = {
  query: string | null;
  sort: MuseumSort | null;
};

// Why a skin is where it is in a list: it's in its place in the museum's
// order (or a search's results), or it's a random skin the server put in the
// museum list (see museumList.ts).
export type ListSource = "list" | "random";

// The same for a skin in the feed, which can also be the one the feed opened
// on, when that isn't in the list (e.g. a shared link, followed by the
// museum).
export type FeedSource = ListSource | "link";

// Identifies a view of one skin in the feed.
type ViewContext = ListContext & {
  skinMd5: string;
  source: FeedSource;
  // Its place in the list (0-based), or null for a "link" skin.
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
      sort: MuseumSort | null;
      // For the feed: the skin it opened on.
      skinMd5: string | null;
      // Host of an external referrer (e.g. "twitter.com"), if any.
      referrerHost: string | null;
      layout: "mobile" | "desktop";
      pointer: "coarse" | "fine";
      // navigator.webdriver: a browser driven by automation.
      automated: boolean;
      // The browser loaded the page before the visitor opened it.
      prerendered: boolean;
      // The page was visible when the session started.
      visible: boolean;
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
      // How long after it came into view Webamp was showing it (with the
      // skin loaded), or null if it never was while it was in view. A slow
      // skin gets scrolled past or left on for reasons that aren't its looks.
      readyMs: number | null;
    } & ViewContext)
  // Webamp couldn't show this skin (it shows its screenshot instead).
  | { type: "skin_load_failure"; skinMd5: string; errorMessage: string }
  // The first completed press on Webamp while a skin was in view. (On touch
  // screens, Webamp can only be pressed while it's being used.)
  | { type: "webamp_interact"; skinMd5: string; target: WebampTarget }
  // On a touch screen, tapped Webamp to use it (the feed stops scrolling
  // until they're done), and stopped, after this long.
  | { type: "webamp_use_start"; skinMd5: string }
  | {
      type: "webamp_use_end";
      skinMd5: string;
      durationMs: number;
      how: WebampExit;
    }
  // The page was backgrounded or brought back, with the feed's skin in view
  // (if it's the feed). Mobile browsers often discard backgrounded pages
  // without a pagehide, so a session whose last event is page_hidden ended
  // there.
  | { type: "page_hidden"; skinMd5: string | null }
  | { type: "page_visible"; skinMd5: string | null }
  // Webamp's playback state changed (e.g. "PLAYING", "PAUSED", "STOPPED").
  // Music playing explains long dwell without implying interest in the skin.
  | { type: "audio_status"; status: string; skinMd5: string | null }
  // The feed couldn't load skins' readmes (before version 8, and like counts).
  | { type: "details_fetch_failure"; errorMessage: string }
  | { type: "readme_expand"; skinMd5: string }
  | { type: "skin_download"; skinMd5: string }
  | { type: "skin_flag_nsfw"; skinMd5: string }
  // Chose to see NSFW skins (from the cover over one in the feed).
  | { type: "nsfw_reveal"; skinMd5: string }
  | { type: "share_open"; skinMd5: string }
  | { type: "share_success"; skinMd5: string }
  | { type: "share_failure"; skinMd5: string; errorMessage: string }
  | { type: "scroll_hint_shown" }
  // The grid's "Tap a skin" hint was shown.
  | { type: "grid_hint_shown" }
  // The "…" menu (About, Upload, Feedback, Donate, GitHub) was opened. Before
  // version 8, the bottom bar's menu, without Upload.
  | { type: "menu_open" }
  // Skins in the grid that were on screen for a moment (GRID_IMPRESSION_MS)
  // once scrolling stopped, as [md5, position, source]. Each skin is reported
  // once per session for each list. With grid_skin_click, how often a skin is
  // tapped when it's seen; the furthest position, how far the grid was
  // scrolled; and the last ones before the session ends, what it ended on.
  | ({
      type: "grid_impressions";
      skins: Array<[md5: string, position: number, source: ListSource]>;
    } & ListContext)
  // A link was followed somewhere other than the grid or the feed: the
  // About or Feedback page, Upload (the classic site), or another site. Says
  // where a session that ends next went. `href` is a path on this site, or a
  // full URL elsewhere.
  | { type: "link_click"; href: string; external: boolean; newTab: boolean }
  // A search's results arrived.
  | { type: "grid_search"; query: string; resultCount: number }
  // The sort button in the grid's search box opened the menu of the
  // museum's orders.
  | { type: "sort_open" }
  // One of them was chosen (even the one already chosen).
  | { type: "grid_sort"; sort: MuseumSort }
  // The filters button in the search box opened the menu of has: filters.
  | { type: "search_filters_open" }
  // One of them was turned on (`on`) or off, adding it to the search or
  // taking it out.
  | { type: "search_filter_toggle"; filter: string; on: boolean }
  // A skin in the grid was tapped. Position is its index in the list
  // (0-based); query is the search it was found with, if any.
  | ({
      type: "grid_skin_click";
      skinMd5: string;
      position: number;
      source: ListSource;
    } & ListContext);

/**
 * Events (and shapes of events) only in earlier versions' data. Version 4
 * added ViewContext's `source` (before it, a null listIndex meant "link") and
 * skin_view_end's readyMs. Version 3
 * replaced session_start's feed fields (entry, skinMd5s, fromSessionId) and
 * grid_open with session_start/view_switch; ViewContext's `position` (depth
 * into a feed session) and `source` with listIndex, query and depth;
 * skin_view_end's `exit` with endedBy; and the fetch events with
 * details_fetch_failure. Version 8 removed skin_like.
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
  | { type: "skin_view"; skinMd5: string }
  // The like button, before version 8. It wasn't saved anywhere.
  | { type: "skin_like"; skinMd5: string; liked: boolean };

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
  "skin_load_failure",
  "grid_impressions",
  "link_click",
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
  "webamp_use_start",
  "webamp_use_end",
  "grid_hint_shown",
  "menu_open",
  "grid_search",
  "sort_open",
  "grid_sort",
  "search_filters_open",
  "search_filter_toggle",
  "grid_skin_click",
  "skins_fetch_start",
  "skins_fetch_success",
  "skins_fetch_failure",
  "grid_open",
]);
