"use server";

import { knex } from "../../../db";

export async function logUserEvent(sessionId: string, event: UserEvent) {
  const timestamp = Date.now();

  await knex("user_log_events").insert({
    session_id: sessionId,
    timestamp: timestamp,
    metadata: JSON.stringify(event),
  });
}

type UserEvent =
  | {
      type: "session_start";
    }
  | {
      type: "session_end";
      reason: "unmount" | "before_unload";
    }
  | {
      type: "skin_view_start";
      skinMd5: string;
    }
  | {
      type: "skin_view_end";
      skinMd5: string;
      durationMs: number;
    }
  | {
      type: "skins_fetch_start";
      offset: number;
    }
  | {
      type: "skins_fetch_success";
      offset: number;
    }
  | {
      type: "skins_fetch_failure";
      offset: number;
      errorMessage: string;
    }
  | {
      type: "readme_expand";
      skinMd5: string;
    }
  | {
      type: "skin_download";
      skinMd5: string;
    }
  | {
      type: "share_open";
      skinMd5: string;
    }
  | {
      type: "share_success";
      skinMd5: string;
    }
  | {
      type: "share_failure";
      skinMd5: string;
      errorMessage: string;
    };
