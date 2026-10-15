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

let pulledKnex: ReturnType<typeof Knex> | null = null;

function database(source: EventSource): ReturnType<typeof Knex> {
  if (source === "local") return appKnex;
  pulledKnex ??= Knex({
    client: "sqlite3",
    connection: { filename: pulledPath() },
    useNullAsDefault: true,
  });
  return pulledKnex;
}

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
  const rows: Array<{
    session_id: string;
    timestamp: number;
    metadata: string;
  }> = await query;
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
