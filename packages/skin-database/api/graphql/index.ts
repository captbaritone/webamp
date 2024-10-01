import { Router } from "express";
import { createHandler } from "graphql-http/lib/use/express";

// import DEFAULT_QUERY from "./defaultQuery";
import { getSchema } from "./schema";

/** @gqlContext */
export type Ctx = Express.Request;

const router = Router();

router.use(
  "/",
  createHandler<Ctx>({
    schema: getSchema(),
    context: (req) => {
      return req.raw;
    },
    /*
    graphiql: {
      defaultQuery: DEFAULT_QUERY,
    },*/
    //  graphqlHTTP({
    //     schema: getSchema(),
    //     graphiql: {
    //       defaultQuery: DEFAULT_QUERY,
    //     },
    //     customFormatErrorFn: (error) => {
    //       console.error(error);
    //       return {
    //         message: error.message,
    //         locations: error.locations,
    //         stack: error.stack ? error.stack.split("\n") : [],
    //         path: error.path,
    //       };
    //     },
    //     extensions,
    //   }) as RequestHandler
  })
);

export default router;
