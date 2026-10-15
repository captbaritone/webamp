import { knex } from "../../../db";
import SessionModel from "../../../data/SessionModel";
import type { LoggedEvent } from "./eventTypes";

// Server-only: stores a batch of /scroll feed events (see events/route.ts).
// Client code sends events through eventLogger.ts instead of importing this.
export async function storeEvents(
  sessionId: string,
  events: LoggedEvent[]
): Promise<void> {
  const receivedAt = Date.now();

  // The first batch from a browser creates the session (see SessionModel),
  // and session_start carries the skins the page was rendered with.
  const sessionStart = events.find((event) => event.type === "session_start");
  await SessionModel.addSkins(
    sessionId,
    sessionStart?.type === "session_start" ? sessionStart.skinMd5s : []
  );

  await knex("user_log_events").insert(
    events.map((event) => ({
      session_id: sessionId,
      // When the server received it. The client's time is in the event (`t`).
      timestamp: receivedAt,
      metadata: JSON.stringify(event),
    }))
  );
}
