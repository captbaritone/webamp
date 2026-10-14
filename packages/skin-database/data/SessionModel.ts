import { knex } from "../db";
import { randomUUID } from "crypto";

export default class SessionModel {
  static async create(): Promise<string> {
    const sessionId = randomUUID();
    const startTime = Date.now();
    await knex("session").insert({
      id: sessionId,
      start_time: startTime,
    });
    return sessionId;
  }

  static async addSkin(sessionId: string, skinMd5: string): Promise<void> {
    await knex("session_skin").insert({
      session_id: sessionId,
      skin_md5: skinMd5,
    });
  }

  static async addSkins(sessionId: string, skinMd5s: string[]): Promise<void> {
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
