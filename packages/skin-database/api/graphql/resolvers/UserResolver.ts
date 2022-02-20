export default class UserResolver {
  username(_args, ctx) {
    // For now every user is the current user.
    return ctx.user?.username;
  }
}
