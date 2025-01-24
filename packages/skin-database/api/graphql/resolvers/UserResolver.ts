import UserContext from "../../../data/UserContext.js";

/** @gqlType User */
export default class UserResolver {
  /** @gqlField */
  username(ctx: UserContext): string | null {
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
