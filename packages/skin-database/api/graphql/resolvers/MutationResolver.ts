import { GqlCtx } from "../GqlCtx";

export function requireAuthed(handler) {
  return (args, req) => {
    if (!req.ctx.authed()) {
      throw new Error("You must be logged in to read this field.");
    } else {
      return handler(args, req);
    }
  };
}

/** @gqlType Mutation */
export type MutationResolver = unknown;

/**
 * Send a message to the admin of the site. Currently this appears in Discord.
 * @gqlField */
export async function send_feedback(
  _: MutationResolver,
  { message, email, url }: { message: string; email?: string; url?: string },
  req: GqlCtx
): Promise<boolean> {
  req.notify({
    type: "GOT_FEEDBACK",
    url,
    message,
    email,
  });
  return true;
}
