"use server";

import { knex } from "../../../db";
import { markAsNSFW } from "../../../data/skins";
import UserContext from "../../../data/UserContext";

export async function logUserEvent(sessionId: string, event: UserEvent) {
  const timestamp = Date.now();

  await knex("user_log_events").insert({
    session_id: sessionId,
    timestamp: timestamp,
    metadata: JSON.stringify(event),
  });

  // If this is a NSFW report, call the existing infrastructure
  if (event.type === "skin_flag_nsfw") {
    // Create an anonymous user context for the report
    const ctx = new UserContext();
    await markAsNSFW(ctx, event.skinMd5);
  }
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
      type: "skin_like";
      skinMd5: string;
      liked: boolean;
    }
  | {
      type: "skin_flag_nsfw";
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
