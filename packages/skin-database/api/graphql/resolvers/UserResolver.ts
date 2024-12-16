import { Ctx } from "..";

/** @gqlType User */
export default class UserResolver {
  /** @gqlField */
  username({ ctx }: Ctx): string | null {
    return ctx.username;
  }
}

/**
 * The currently authenticated user, if any.
 * @gqlQueryField
 */
export function me(): UserResolver | null {
  return new UserResolver();
}
