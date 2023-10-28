import RootResolver from "./RootResolver";

/** @gqlType User */
export default class UserResolver {
  /** @gqlField */
  username(_args: never, { ctx }): string {
    return ctx.username;
  }
}

/**
 * The currently authenticated user, if any.
 * @gqlField
 */
export function me(_: RootResolver): UserResolver | null {
  return new UserResolver();
}
