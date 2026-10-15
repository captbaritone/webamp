import { knex } from "../db";
import { randomUUID } from "crypto";

// A /scroll feed session: one visit to the feed. Pages mint the ID when they
// render, but nothing is written until the visitor's browser reports in (its
// first event batch, or a request for more skins). Server renders that never
// run JavaScript, like crawlers and link previews, leave no rows.
export default class SessionModel {
  static newId(): string {
    return randomUUID();
  }

  // Record the session if it isn't already. Safe to call repeatedly.
  static async ensure(sessionId: string): Promise<void> {
    await knex("session")
      .insert({ id: sessionId, start_time: Date.now() })
      .onConflict("id")
      .ignore();
  }

  // Record skins as shown to the session, so later pages exclude them.
  static async addSkins(sessionId: string, skinMd5s: string[]): Promise<void> {
    await SessionModel.ensure(sessionId);
    if (skinMd5s.length === 0) return;
    await knex("session_skin").insert(
      skinMd5s.map((skinMd5) => ({ session_id: sessionId, skin_md5: skinMd5 }))
    );
  }

  static async getIncludedSkinCount(sessionId: string): Promise<number> {
    const result = await knex("session_skin")
      .where({ session_id: sessionId })
      .count("* as count")
      .first();
    return result ? (result.count as number) : 0;
  }
}
