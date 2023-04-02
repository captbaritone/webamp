/** @gqlType User */
export default class UserResolver {
  /** @gqlField */
  username(_args: never, { ctx }): string {
    return ctx.username;
  }
}
