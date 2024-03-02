import { Ctx } from "..";
import { Mutation } from "./MutationResolver";

/**
 * Send a message to the admin of the site. Currently this appears in Discord.
 * @gqlField */
export async function send_feedback(
  _: Mutation,
  {
    message,
    email,
    url,
  }: { message: string; email?: string | null; url?: string | null },
  req: Ctx
): Promise<boolean> {
  req.notify({
    type: "GOT_FEEDBACK",
    url,
    message,
    email,
  });
  return true;
}
