"use client";

import { createContext, useContext } from "react";
import {
  EVENT_SCHEMA_VERSION,
  type FeedEntry,
  type LoggedEvent,
  type UserEvent,
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
 * Queues the feed's events and sends them to /scroll/events in batches, each
 * stamped with the schema version, a per-session sequence number and the
 * client's clock.
 */
export function createEventLogger(sessionId: string): EventLogger {
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

const noopLogger: EventLogger = { log() {}, flush() {} };

export const EventLoggerContext = createContext<EventLogger>(noopLogger);

export function useEventLogger(): EventLogger {
  return useContext(EventLoggerContext);
}

// How the next feed visit was reached, set by in-app links to the feed just
// before they navigate. The feed reads it once when it mounts; if nothing set
// it, the visitor landed on the feed directly.
type PendingFeedEntry = { entry: FeedEntry; fromSessionId: string | null };
let pendingFeedEntry: PendingFeedEntry | null = null;

export function setFeedEntry(
  entry: FeedEntry,
  fromSessionId: string | null = null
): void {
  pendingFeedEntry = { entry, fromSessionId };
}

export function takeFeedEntry(): PendingFeedEntry | null {
  const pending = pendingFeedEntry;
  pendingFeedEntry = null;
  return pending;
}

// Context logged when a feed or grid visit starts.
export function getVisitContext(): {
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

// Sends queued events whenever the page is hidden (mobile browsers often
// discard backgrounded pages without warning) and when the caller unmounts.
// Returns a cleanup function.
export function flushWhenHidden(logger: EventLogger): () => void {
  function onVisibilityChange() {
    if (document.visibilityState === "hidden") {
      logger.flush({ unloading: true });
    }
  }
  document.addEventListener("visibilitychange", onVisibilityChange);
  return () => {
    document.removeEventListener("visibilitychange", onVisibilityChange);
    logger.flush({ unloading: true });
  };
}
