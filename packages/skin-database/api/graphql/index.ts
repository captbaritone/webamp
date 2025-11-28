import { Router } from "express";
import { createYoga, YogaInitialContext } from "graphql-yoga";

// import DEFAULT_QUERY from "./defaultQuery";
import { getSchema } from "./schema";
import UserContext from "../../data/UserContext.js";

/** @gqlContext */
export type Ctx = Express.Request;

/** @gqlContext */
export function getUserContext(ctx: Ctx): UserContext {
  return ctx.ctx;
}

// eslint-disable-next-line new-cap -- Express Router uses this pattern
const router = Router();

const yoga = createYoga({
  schema: getSchema(),
  context: (ctx: YogaInitialContext) => {
    // @ts-expect-error
    return ctx.req;
  },
});

// Bind GraphQL Yoga to the graphql endpoint to avoid rendering the playground on any path
router.use("", yoga);

export default router;
