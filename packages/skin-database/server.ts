import { parse } from "url";
import next from "next";
import { createApp } from "./api/app";
import DiscordEventHandler from "./api/DiscordEventHandler";

const handler = new DiscordEventHandler();

const port = parseInt(process.env.PORT || "3000", 10);
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const expressApp = createApp({
    eventHandler: (action) => handler.handle(action),
    logger: {
      log: (message, context) => console.log(message, context),
      logError: (message, context) => console.error(message, context),
    },
  });

  // If a route does not match in express, fallback to Next.js routes
  expressApp.all("*", (req, res) => {
    const parsedUrl = parse(req.url, true);
    return handle(req, res, parsedUrl);
  });

  expressApp.listen(port);
  console.log(
    `> Server listening at http://localhost:${port} as ${
      dev ? "development" : process.env.NODE_ENV
    }`
  );
});
