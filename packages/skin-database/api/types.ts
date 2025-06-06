import UserContext from "../data/UserContext";

export type ApiAction =
  | { type: "REVIEW_REQUESTED"; md5: string }
  | { type: "REJECTED_SKIN"; md5: string }
  | { type: "APPROVED_SKIN"; md5: string }
  | { type: "MARKED_SKIN_NSFW"; md5: string }
  | { type: "SKIN_UPLOADED"; md5: string }
  | { type: "ERROR_PROCESSING_UPLOAD"; id: string; message: string }
  | { type: "CLASSIC_SKIN_UPLOADED"; md5: string }
  | { type: "MODERN_SKIN_UPLOADED"; md5: string }
  | { type: "SKIN_UPLOAD_ERROR"; uploadId: string; message: string }
  | {
      type: "GOT_FEEDBACK";
      message: string;
      email?: string | null;
      url?: string | null;
    }
  | {
      type: "SYNCED_TO_ARCHIVE";
      successes: number;
      errors: number;
      skips: number;
    }
  | { type: "STARTED_SYNC_TO_ARCHIVE"; count: number }
  | {
      type: "POPULAR_TWEET";
      bracket: number;
      url: string;
      likes: number;
      date: Date;
    }
  | { type: "TWEET_BOT_MILESTONE"; bracket: number; count: number };

export type EventHandler = (event: ApiAction) => void;
export type Logger = {
  log(message: string, context: any): void;
  logError(message: string, context: any): void;
};

// Add UserContext to req objects globally
declare global {
  namespace Express {
    interface Request {
      ctx: UserContext;
      notify(action: ApiAction): void;
      log(message: string): void;
      logError(message: string): void;
      session: {
        username: string | undefined;
      };
    }
  }
}
