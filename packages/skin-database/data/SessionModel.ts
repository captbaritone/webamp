import { knex } from "../db";

// A session of the new museum UI: a visit in one tab (see eventLogger.ts). The
// browser mints the ID, and the session is recorded with its first batch of
// events, so crawlers and link previews leave no rows. (The session_skin
// table, which recorded the skins each session's feed had been shown, is no
// longer written.)
export default class SessionModel {
  // Record the session if it isn't already, with the user agent of the
  // browser that sent its first batch. Safe to call repeatedly.
  static async ensure(
    sessionId: string,
    userAgent: string | null
  ): Promise<void> {
    await knex("session")
      .insert({ id: sessionId, start_time: Date.now(), user_agent: userAgent })
      .onConflict("id")
      .ignore();
  }
}
