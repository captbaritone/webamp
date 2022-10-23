import { Router } from "express";
import { graphqlHTTP } from "express-graphql";

import RootResolver from "./resolvers/RootResolver";
import DEFAULT_QUERY from "./defaultQuery";
import { buildSchema } from "graphql";
import fs from "fs";
import path from "path";

const schemaPath = path.join(__dirname, "./schema.graphql");
const schema = buildSchema(fs.readFileSync(schemaPath, "utf8"));

const router = Router();

function getQueryNameFromDocument(document) {
  const operationDefinition = document.definitions.find(
    (def) => def.kind === "OperationDefinition"
  );
  if (!operationDefinition) {
    return null;
  }
  return operationDefinition.name?.value;
}

const extensions = ({
  variables,
  operationName,
  context: req,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  document,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  result,
}) => {
  const runTime = Date.now() - req.startTime;
  const vars = JSON.stringify(variables);
  const queryName = operationName ?? getQueryNameFromDocument(document);
  // TODO: Log/notify on error.
  req.log(
    `Handled GraphQL Query: "${queryName}" with variables ${vars} in ${runTime}ms`
  );
  return { runTime };
};

router.use(
  "/",
  graphqlHTTP({
    schema: schema,
    rootValue: new RootResolver(),
    graphiql: {
      defaultQuery: DEFAULT_QUERY,
    },
    customFormatErrorFn: (error) => {
      console.error(error);
      return {
        message: error.message,
        locations: error.locations,
        stack: error.stack ? error.stack.split("\n") : [],
        path: error.path,
      };
    },
    extensions,
  })
);

export default router;
