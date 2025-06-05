import { createYoga } from "graphql-yoga";
import { getSchema } from "../../api/graphql/schema";

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
});

export {
  handleRequest as GET,
  handleRequest as POST,
  handleRequest as OPTIONS,
};
