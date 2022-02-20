import { Router } from "express";
import { graphqlHTTP } from "express-graphql";

import RootResolver from "./resolvers/RootResolver";
import schema from "./schema";
import DEFAULT_QUERY from "./defaultQuery";

const router = Router();

router.use(
  "/",
  graphqlHTTP({
    typeResolver(_type) {
      throw new Error("We probably need to implement typeResolver");
    },
    schema: schema,
    rootValue: new RootResolver(),
    graphiql: {
      defaultQuery: DEFAULT_QUERY,
    },
    customFormatErrorFn: (error) => ({
      message: error.message,
      locations: error.locations,
      stack: error.stack ? error.stack.split("\n") : [],
      path: error.path,
    }),
  })
);

export default router;
