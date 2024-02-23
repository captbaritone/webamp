import { Router } from "express";
import { graphqlHTTP } from "express-graphql";

import DEFAULT_QUERY from "./defaultQuery";
import { getSchema } from "./schema";

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
    schema: getSchema(),
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
