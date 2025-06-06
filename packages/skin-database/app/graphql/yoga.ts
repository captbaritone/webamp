import {
  createYoga,
  YogaInitialContext,
  YogaServerInstance,
} from "graphql-yoga";
import { getSchema } from "../../api/graphql/schema";
import UserContext from "../../data/UserContext";
import { ApiAction, EventHandler, Logger } from "../../api/types";

interface NextContext {
  params: Promise<Record<string, string>>;
}

type Options = {
  eventHandler?: EventHandler;
  getUserContext(): UserContext;
  logger?: Logger;
};

export function createYogaInstance({
  eventHandler,
  logger,
  getUserContext,
}: Options): YogaServerInstance<any, any> {
  return createYoga<NextContext>({
    schema: getSchema(),

    // While using Next.js file convention for routing, we need to configure Yoga to use the correct endpoint
    graphqlEndpoint: "/graphql",

    graphiql: true,

    cors: {
      origin: "*", // Allow all origins for simplicity, adjust as needed
      methods: ["GET", "POST", "OPTIONS"],
      credentials: true,
    },
    context: (ctx: YogaInitialContext) => {
      const context = {
        url: ctx.request.url,
      };
      return {
        ...ctx.request,
        ctx: getUserContext(),
        notify(event: ApiAction) {
          if (eventHandler) {
            eventHandler(event);
          }
        },
        log(message) {
          if (logger != null) {
            logger.log(message, context);
          }
        },
        logError(message) {
          if (logger != null) {
            logger.logError(message, context);
          }
        },
      };
    },
  });
}
