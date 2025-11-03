import UserContext from "../../data/UserContext";
import DiscordEventHandler from "../../api/DiscordEventHandler";
import { createYogaInstance } from "./yoga";

const handler = new DiscordEventHandler();

const { handleRequest } = createYogaInstance({
  eventHandler: (action) => handler.handle(action),
  getUserContext() {
    return new UserContext();
  },
  logger: {
    log: (message: string, context: Record<string, any>) => {
      // console.log(message, context);
    },
    logError: (message: string, context: Record<string, any>) => {
      console.error(message, context);
    },
  },
});

export {
  handleRequest as GET,
  handleRequest as POST,
  handleRequest as OPTIONS,
};
