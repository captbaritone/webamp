export default class UserResolver {
  username(_args, { ctx }) {
    return ctx.username;
  }
}
