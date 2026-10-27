import fs from "fs";
import path from "path";
import Knex from "knex";
import { knex as appKnex } from "../../../db";
import type { StoredEvent, StoredSession } from "./analyze";

// Where the dashboard reads events from: the dev server's own database, or a
// copy of production's event log made by scripts/pull-events.sh.
export const PULLED_EVENTS_FILE = "events.sqlite3";

export type EventSource = "pulled" | "local";

function pulledPath(): string {
  return path.join(process.cwd(), PULLED_EVENTS_FILE);
}

/** When the production copy was pulled, if there is one. */
export function pulledAt(): Date | null {
  try {
    return fs.statSync(pulledPath()).mtime;
  } catch {
    return null;
  }
}

// Reopened whenever the file changes: scripts/pull-events.sh replaces it, and
// a connection to the old file would go on reading the previous copy.
let pulled: { knex: ReturnType<typeof Knex>; mtimeMs: number } | null = null;

function database(source: EventSource): ReturnType<typeof Knex> {
  if (source === "local") return appKnex;
  const mtimeMs = pulledAt()?.getTime() ?? 0;
  if (pulled == null || pulled.mtimeMs !== mtimeMs) {
    pulled?.knex.destroy();
    pulled = {
      knex: Knex({
        client: "sqlite3",
        connection: { filename: pulledPath() },
        useNullAsDefault: true,
      }),
      mtimeMs,
    };
  }
  return pulled.knex;
}

type EventRow = { session_id: string; timestamp: number; metadata: string };

/** Each session's events, from `minVersion` on, received since `since`. */
export async function loadSessions(
  source: EventSource,
  { minVersion, since }: { minVersion: number; since: number | null }
): Promise<StoredSession[]> {
  let query = database(source)("user_log_events")
    .select("session_id", "timestamp", "metadata")
    .orderBy("id", "asc");
  if (since != null) {
    // Whole sessions: any that had events since then.
    query = query.whereIn(
      "session_id",
      database(source)("user_log_events")
        .distinct("session_id")
        .where("timestamp", ">=", since)
    );
  }
  const rows: EventRow[] = await query;
  const userAgents = await loadUserAgents(database(source));
  return toSessions(rows, userAgents, minVersion);
}

/**
 * Every session's events, from `minVersion` on, `batchSize` sessions at a
 * time, for work over the whole log that needn't hold it all in memory.
 * Reading a batch uses the index on user_log_events.session_id.
 */
export async function forEachSessionBatch(
  source: EventSource,
  { minVersion, batchSize }: { minVersion: number; batchSize: number },
  callback: (sessions: StoredSession[]) => void | Promise<void>
): Promise<void> {
  const db = database(source);
  const ids: string[] = (
    await db("user_log_events").distinct("session_id")
  ).map((row: { session_id: string }) => row.session_id);
  const userAgents = await loadUserAgents(db);
  for (let i = 0; i < ids.length; i += batchSize) {
    const rows: EventRow[] = await db("user_log_events")
      .select("session_id", "timestamp", "metadata")
      .whereIn("session_id", ids.slice(i, i + batchSize))
      .orderBy("id", "asc");
    await callback(toSessions(rows, userAgents, minVersion));
  }
}

// Groups rows (in the order they arrived) into sessions.
function toSessions(
  rows: EventRow[],
  userAgents: Map<string, string>,
  minVersion: number
): StoredSession[] {
  const sessions = new Map<string, StoredSession>();
  for (const row of rows) {
    let event: StoredEvent;
    try {
      event = { ...JSON.parse(row.metadata), receivedAt: row.timestamp };
    } catch {
      continue;
    }
    let session = sessions.get(row.session_id);
    if (session == null) {
      session = {
        id: row.session_id,
        userAgent: userAgents.get(row.session_id) ?? null,
        firstReceived: row.timestamp,
        lastReceived: row.timestamp,
        events: [],
      };
      sessions.set(row.session_id, session);
    }
    session.lastReceived = Math.max(session.lastReceived, row.timestamp);
    session.events.push(event);
  }
  // Sessions with any events from that version on (an open tab can carry
  // a session across a deploy).
  return [...sessions.values()].filter((session) =>
    session.events.some((event) => (event.v ?? 1) >= minVersion)
  );
}

// Sessions' user agents (recorded from version 6), if this copy has them.
async function loadUserAgents(
  db: ReturnType<typeof Knex>
): Promise<Map<string, string>> {
  try {
    const rows: Array<{ id: string; user_agent: string }> = await db("session")
      .select("id", "user_agent")
      .whereNotNull("user_agent");
    return new Map(rows.map((row) => [row.id, row.user_agent]));
  } catch {
    // An older copy, without the session table or its user_agent column.
    return new Map();
  }
}
