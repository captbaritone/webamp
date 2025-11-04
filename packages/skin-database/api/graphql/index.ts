import UserContext from "../../data/UserContext.js";

/** @gqlContext */
export type Ctx = Express.Request;

/** @gqlContext */
export function getUserContext(ctx: Ctx): UserContext {
  return ctx.ctx;
}

