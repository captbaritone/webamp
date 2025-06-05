import { createYoga, YogaInitialContext } from "graphql-yoga";
import { getSchema } from "../../api/graphql/schema";
import UserContext from "../../data/UserContext";
import DiscordEventHandler from "../../api/DiscordEventHandler";

const handler = new DiscordEventHandler();

interface NextContext {
  params: Promise<Record<string, string>>;
}

const { handleRequest } = createYoga<NextContext>({
  schema: getSchema(),

  // While using Next.js file convention for routing, we need to configure Yoga to use the correct endpoint
  graphqlEndpoint: "/graphql",

  // Yoga needs to know how to create a valid Next response
  fetchAPI: { Response },

  graphiql: true,

  cors: {
    origin: "*", // Allow all origins for simplicity, adjust as needed
    methods: ["GET", "POST", "OPTIONS"],
    credentials: true,
  },
  context: (ctx: YogaInitialContext) => {
    return {
      ...ctx.request,
      ctx: new UserContext(),
      notify: (action) => handler.handle(action),
      log(message: string) {
        console.log(message, {
          url: ctx.request.url,
        });
      },
      error(message: string) {
        console.error(message, {
          url: ctx.request.url,
        });
      },
    };
  },
});

export {
  handleRequest as GET,
  handleRequest as POST,
  handleRequest as OPTIONS,
};
