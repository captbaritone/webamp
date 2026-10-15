"use client";

import {
  EVENT_SCHEMA_VERSION,
  type LoggedEvent,
  type MuseumView,
  type UserEvent,
  type ViewVia,
} from "./eventTypes";
import { DESKTOP_MEDIA_QUERY } from "./breakpoints";

const ENDPOINT = "/scroll/events";
// Send a batch once this many events are queued, or this long after the first
// one, whichever comes first. Also sent immediately when the page is hidden.
const MAX_BATCH = 20;
const FLUSH_DELAY_MS = 5000;

export type EventLogger = {
  log(event: UserEvent): void;
  // Send whatever is queued. `unloading` uses sendBeacon, which survives the
  // page being hidden or closed.
  flush(options?: { unloading?: boolean }): void;
};

/**
 * Queues a session's events and sends them to /scroll/events in batches, each
 * stamped with the schema version, a per-session sequence number and the
 * client's clock.
 */
function createEventLogger(sessionId: string): EventLogger {
  let queue: LoggedEvent[] = [];
  let seq = 0;
  let timer: ReturnType<typeof setTimeout> | null = null;

  function flush({ unloading = false } = {}) {
    if (timer != null) {
      clearTimeout(timer);
      timer = null;
    }
    if (queue.length === 0) return;
    const body = JSON.stringify({ sessionId, events: queue });
    queue = [];
    if (
      unloading &&
      navigator.sendBeacon?.(
        ENDPOINT,
        new Blob([body], { type: "application/json" })
      )
    ) {
      return;
    }
    fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => {
      // Analytics only; don't surface failures.
    });
  }

  function log(event: UserEvent) {
    queue.push({
      ...event,
      v: EVENT_SCHEMA_VERSION,
      seq: seq++,
      t: Date.now(),
    });
    if (queue.length >= MAX_BATCH) {
      flush();
    } else if (timer == null) {
      timer = setTimeout(flush, FLUSH_DELAY_MS);
    }
  }

  return { log, flush };
}

// The visit's session: everything from opening the museum in a tab until
// it's closed or reloaded, across the grid and the feed.
type Session = {
  logger: EventLogger;
  started: boolean;
  ended: boolean;
  // The skin in view in the feed, while it's showing.
  feedSkinMd5: string | null;
};

let session: Session | null = null;
const endListeners = new Set<() => void>();
const resumeListeners = new Set<() => void>();

function getSession(): Session {
  if (session == null) {
    const created: Session = {
      logger: createEventLogger(crypto.randomUUID()),
      started: false,
      ended: false,
      feedSkinMd5: null,
    };
    session = created;
    watchPageLifecycle(created);
    watchLinkClicks(created);
  }
  return session;
}

// Log the page being hidden and shown, and send what we have whenever it's
// hidden: mobile browsers often discard backgrounded pages without warning.
// The session ends on pagehide, and resumes if the page comes back from the
// back/forward cache.
function watchPageLifecycle(s: Session): void {
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      s.logger.log({ type: "page_hidden", skinMd5: s.feedSkinMd5 });
      s.logger.flush({ unloading: true });
    } else {
      s.logger.log({ type: "page_visible", skinMd5: s.feedSkinMd5 });
    }
  });
  addEventListener("pagehide", () => {
    if (s.ended) return;
    s.ended = true;
    endListeners.forEach((listener) => listener());
    s.logger.log({ type: "session_end", reason: "pagehide" });
    s.logger.flush({ unloading: true });
  });
  addEventListener("pageshow", (e) => {
    if (!e.persisted || !s.ended) return;
    s.ended = false;
    s.logger.log({ type: "session_resume" });
    resumeListeners.forEach((listener) => listener());
  });
}

// Links followed out of the grid and the feed (to About, Upload, another
// site...), so a session that ends next says where it went. Links between
// the grid and the feed are logged as view_switch instead.
const MAX_HREF_LENGTH = 300;

function watchLinkClicks(s: Session): void {
  function onClick(e: MouseEvent) {
    // The main button, or the middle one (auxclick).
    if (e.button !== 0 && e.button !== 1) return;
    const link = (e.target as Element | null)?.closest?.("a[href]");
    if (!(link instanceof HTMLAnchorElement)) return;
    let url: URL;
    try {
      url = new URL(link.href);
    } catch {
      return;
    }
    const external = url.origin !== location.origin;
    if (
      !external &&
      (url.pathname === "/" ||
        url.pathname === "/feed" ||
        url.pathname.startsWith("/skin/"))
    ) {
      return;
    }
    s.logger.log({
      type: "link_click",
      href: (external
        ? `${url.origin}${url.pathname}`
        : `${url.pathname}${url.search}`
      ).slice(0, MAX_HREF_LENGTH),
      external,
      newTab:
        link.target === "_blank" ||
        e.button === 1 ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey,
    });
  }
  document.addEventListener("click", onClick, { capture: true });
  document.addEventListener("auxclick", onClick, { capture: true });
}

// The session's logger. The session starts with its first event.
const sessionLogger: EventLogger = {
  log(event) {
    getSession().logger.log(event);
  },
  flush(options) {
    getSession().logger.flush(options);
  },
};

export function useEventLogger(): EventLogger {
  return sessionLogger;
}

// How the next view is being reached, set by in-app links just before they
// navigate. Read when the view opens; if nothing set it, it was the browser's
// history (or something we don't know about).
let nextViewVia: ViewVia | null = null;

export function setNextViewVia(via: ViewVia): void {
  nextViewVia = via;
}

/**
 * Log arriving at a view: the session's start, if this is its first view,
 * otherwise a switch to it. Returns how the view was reached ("link" for the
 * session's first). Call once per visit to the view.
 */
export function enterView(
  view: MuseumView,
  context: {
    query: string | null;
    skinMd5: string | null;
    listIndex: number | null;
  }
): "link" | ViewVia {
  const s = getSession();
  const via = nextViewVia ?? "history";
  nextViewVia = null;
  if (!s.started) {
    s.started = true;
    s.logger.log({
      type: "session_start",
      view,
      query: context.query,
      skinMd5: context.skinMd5,
      ...getVisitContext(),
    });
    // Send right away: this is what records the session.
    s.logger.flush();
    return "link";
  }
  s.logger.log({ type: "view_switch", to: view, via, ...context });
  return via;
}

/** The feed's skin in view (null when leaving the feed), for page_hidden/visible. */
export function setFeedSkin(md5: string | null): void {
  getSession().feedSkinMd5 = md5;
}

/** Called when the session ends (before session_end is logged). */
export function onSessionEnd(listener: () => void): () => void {
  endListeners.add(listener);
  return () => {
    endListeners.delete(listener);
  };
}

/** Called when an ended session resumes (after session_resume is logged). */
export function onSessionResume(listener: () => void): () => void {
  resumeListeners.add(listener);
  return () => {
    resumeListeners.delete(listener);
  };
}

// Context logged when a session starts.
function getVisitContext(): {
  referrerHost: string | null;
  layout: "mobile" | "desktop";
  pointer: "coarse" | "fine";
} {
  let referrerHost: string | null = null;
  try {
    const referrer = document.referrer ? new URL(document.referrer) : null;
    if (referrer != null && referrer.host !== location.host) {
      referrerHost = referrer.host;
    }
  } catch {
    // Not a URL we can parse; leave it out.
  }
  return {
    referrerHost,
    layout: matchMedia(DESKTOP_MEDIA_QUERY).matches ? "desktop" : "mobile",
    pointer: matchMedia("(pointer: coarse)").matches ? "coarse" : "fine",
  };
}
