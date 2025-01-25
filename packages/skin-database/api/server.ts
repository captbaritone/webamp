import dotenv from "dotenv";

dotenv.config();

import { createApp } from "./app";
import DiscordEventHandler from "./DiscordEventHandler";

const port = process.env.PORT ? Number(process.env.PORT) : 3001;

const handler = new DiscordEventHandler();

// GO!
const app = createApp({
  eventHandler: (action) => handler.handle(action),
  logger: {
    log: (message, context) => console.log(message, context),
    logError: (message, context) => console.error(message, context),
  },
});
app.listen(port, () => {
  console.log(
    `Winamp Skin Museum database API app listening on http://localhost:${port}`
  );
  console.log(`Explore: http://localhost:${port}/graphql`);
});

