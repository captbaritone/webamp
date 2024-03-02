import { Ctx } from "..";

/** @gqlType User */
export default class UserResolver {
  /** @gqlField */
  username(_args: unknown, { ctx }: Ctx): string | null {
    return ctx.username;
  }
}
