import UserContext from "../data/UserContext";

export default abstract class Task {
  ctx: UserContext;
  constructor(ctx: UserContext) {
    this.ctx = ctx;
  }
  name: string;
  description: string;
  abstract run(): Promise<void>;
}
