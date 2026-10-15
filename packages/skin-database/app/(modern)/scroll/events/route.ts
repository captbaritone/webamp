import { storeEvents } from "../Events";
import {
  MAX_GRID_IMPRESSIONS,
  USER_EVENT_TYPES,
  type LoggedEvent,
} from "../eventTypes";

// Receives batches of the new museum UI's events from eventLogger.ts, as either a
// fetch or a `navigator.sendBeacon` (the only reliable way to send while the
// page is unloading).
//
// Body: { sessionId: string, events: LoggedEvent[] }
//
// Anyone can post here, so it only accepts well-formed batches of known event
// types, within size limits.

const MAX_BODY_BYTES = 64 * 1024; // sendBeacon's limit
const MAX_EVENTS = 200;
const MAX_EVENT_BYTES = 4 * 1024;
const MAX_SESSION_SKINS = 100;

const SESSION_ID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const MD5 = /^[0-9a-f]{32}$/;

export async function POST(request: Request) {
  const text = await request.text();
  if (text.length > MAX_BODY_BYTES) {
    return new Response(null, { status: 413 });
  }
  let body: any;
  try {
    body = JSON.parse(text);
  } catch {
    return new Response(null, { status: 400 });
  }

  const sessionId = body?.sessionId;
  const events = body?.events;
  if (
    typeof sessionId !== "string" ||
    !SESSION_ID.test(sessionId) ||
    !Array.isArray(events) ||
    events.length === 0 ||
    events.length > MAX_EVENTS ||
    !events.every(isValidEvent)
  ) {
    return new Response(null, { status: 400 });
  }

  await storeEvents(sessionId, events);
  return new Response(null, { status: 204 });
}

function isValidEvent(event: unknown): event is LoggedEvent {
  if (typeof event !== "object" || event == null) return false;
  const e = event as Record<string, unknown>;
  if (
    typeof e.type !== "string" ||
    !USER_EVENT_TYPES.has(e.type) ||
    typeof e.v !== "number" ||
    typeof e.seq !== "number" ||
    typeof e.t !== "number" ||
    JSON.stringify(e).length > MAX_EVENT_BYTES
  ) {
    return false;
  }
  if ("skinMd5" in e && e.skinMd5 != null && !isMd5(e.skinMd5)) return false;
  if (e.type === "grid_impressions") {
    return (
      Array.isArray(e.skins) &&
      e.skins.length <= MAX_GRID_IMPRESSIONS &&
      e.skins.every(
        (entry) =>
          Array.isArray(entry) &&
          entry.length === 3 &&
          isMd5(entry[0]) &&
          Number.isInteger(entry[1]) &&
          entry[1] >= 0 &&
          (entry[2] === "list" || entry[2] === "random")
      )
    );
  }
  // Version 2's session_start (from tabs still open on an older build).
  if (e.type === "session_start" && "skinMd5s" in e) {
    return (
      (e.fromSessionId == null ||
        (typeof e.fromSessionId === "string" &&
          SESSION_ID.test(e.fromSessionId))) &&
      Array.isArray(e.skinMd5s) &&
      e.skinMd5s.length <= MAX_SESSION_SKINS &&
      e.skinMd5s.every(isMd5)
    );
  }
  return true;
}

function isMd5(value: unknown): boolean {
  return typeof value === "string" && MD5.test(value);
}
