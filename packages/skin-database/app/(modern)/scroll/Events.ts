import { knex } from "../../../db";
import SessionModel from "../../../data/SessionModel";
import type { LoggedEvent } from "./eventTypes";

// Server-only: stores a batch of the new museum UI's events (see events/route.ts).
// Client code sends events through eventLogger.ts instead of importing this.
export async function storeEvents(
  sessionId: string,
  events: LoggedEvent[],
  userAgent: string | null
): Promise<void> {
  const receivedAt = Date.now();

  // The first batch from a browser creates the session.
  await SessionModel.ensure(sessionId, userAgent);

  await knex("user_log_events").insert(
    events.map((event) => ({
      session_id: sessionId,
      // When the server received it. The client's time is in the event (`t`).
      timestamp: receivedAt,
      metadata: JSON.stringify(event),
    }))
  );
}
