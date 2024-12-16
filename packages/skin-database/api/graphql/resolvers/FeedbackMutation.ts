import { Ctx } from "..";

/**
 * Send a message to the admin of the site. Currently this appears in Discord.
 * @gqlMutationField */
export async function send_feedback(
  req: Ctx,
  message: string,
  email?: string | null,
  url?: string | null
): Promise<boolean> {
  req.notify({
    type: "GOT_FEEDBACK",
    url,
    message,
    email,
  });
  return true;
}
