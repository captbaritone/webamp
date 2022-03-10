import UserContext from "../../../data/UserContext";

export default class UserResolver {
  username(_args, { ctx }) {
    return ctx.username;
  }
}
