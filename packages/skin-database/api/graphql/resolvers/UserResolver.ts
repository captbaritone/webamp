import { Ctx } from "..";
import { Query } from "./QueryResolver";

/** @gqlType User */
export default class UserResolver {
  /** @gqlField */
  username(_args: unknown, { ctx }: Ctx): string | null {
    return ctx.username;
  }
}

/**
 * The currently authenticated user, if any.
 * @gqlField
 */
export function me(_: Query): UserResolver | null {
  return new UserResolver();
}
