import router from "./router";
import fileUpload from "express-fileupload";
import cors, { CorsOptions } from "cors";
import bodyParser from "body-parser";
import Sentry from "@sentry/node";
import expressSitemapXml from "express-sitemap-xml";
import * as Skins from "../data/skins";
import express, { Handler } from "express";
import UserContext from "../data/UserContext";
import cookieSession from "cookie-session";
import { SECRET } from "../config";

export type ApiAction =
  | { type: "REVIEW_REQUESTED"; md5: string }
  | { type: "REJECTED_SKIN"; md5: string }
  | { type: "APPROVED_SKIN"; md5: string }
  | { type: "MARKED_SKIN_NSFW"; md5: string }
  | { type: "SKIN_UPLOADED"; md5: string }
  | { type: "ERROR_PROCESSING_UPLOAD"; id: string; message: string }
  | { type: "CLASSIC_SKIN_UPLOADED"; md5: string }
  | { type: "MODERN_SKIN_UPLOADED"; md5: string }
  | { type: "SKIN_UPLOAD_ERROR"; uploadId: string; message: string };

export type EventHandler = (event: ApiAction) => void;
export type Logger = {
  log(message: string, context: any): void;
  logError(message: string, context: any): void;
};

// Add UserContext to req objects globally
declare global {
  namespace Express {
    interface Request {
      ctx: UserContext;
      notify(action: ApiAction): void;
      log(message: string): void;
      logError(message: string): void;
      session: {
        username: string | undefined;
      };
    }
  }
}

type Options = {
  eventHandler?: EventHandler;
  extraMiddleware?: Handler;
  logger?: Logger;
};

export function createApp({ eventHandler, extraMiddleware, logger }: Options) {
  const app = express();
  if (Sentry) {
    app.use(Sentry.Handlers.requestHandler());
  }

  // https://expressjs.com/en/guide/behind-proxies.html
  // This is needed in order to allow `cookieSession({secure: true})` cookies to be sent.
  app.set("trust proxy", "loopback");

  app.use(
    cookieSession({
      secure: true,
      sameSite: "none",
      httpOnly: false,
      name: "session",
      secret: SECRET,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    })
  );

  if (extraMiddleware != null) {
    app.use(extraMiddleware);
  }

  // Add UserContext to request
  app.use((req, res, next) => {
    req.ctx = new UserContext(req.session.username);
    next();
    // TODO: Dispose of context?
  });

  // Attach event handler
  app.use((req, res, next) => {
    req.notify = (action) => {
      if (eventHandler) {
        eventHandler(action);
      }
    };
    next();
  });

  // Attach logger
  app.use((req, res, next) => {
    const context = {
      url: req.url,
      params: req.params,
      query: req.query,
      username: req.ctx.username,
    };
    req.log = (message) => {
      if (logger != null) {
        logger.log(message, context);
      }
    };
    req.logError = (message) => {
      if (logger != null) {
        logger.logError(message, context);
      }
    };
    next();
  });

  // Configure CORs
  app.use(cors(corsOptions));
  app.options("*", cors(corsOptions));

  // Configure json output
  app.set("json spaces", 2);

  // parse application/json
  app.use(bodyParser.json());

  // Configure File Uploads
  const limits = { fileSize: 50 * 1024 * 1024 };
  app.use(fileUpload({ limits }));

  // Configure sitemap
  app.use(expressSitemapXml(getSitemapUrls, "https://skins.webamp.org"));

  // Add routes
  app.use("/", router);

  // The error handler must be before any other error middleware and after all controllers
  if (Sentry) {
    app.use(Sentry.Handlers.errorHandler());
  }

  // Optional fallthrough error handler
  app.use(function onError(err, _req, res, _next) {
    res.statusCode = 500;
    res.json({ errorId: res.sentry, message: err.message });
  });

  return app;
}

async function getSitemapUrls() {
  const md5s = await Skins.getAllClassicSkins();
  const skinUrls = md5s.map(({ md5, fileName }) => `skin/${md5}/${fileName}`);
  return ["/about", "/", "/upload", ...skinUrls];
}

const allowList = [
  /https:\/\/skins\.webamp\.org/,
  /http:\/\/localhost:3000/,
  /netlify.app/,
];

const corsOptions: CorsOptions = {
  credentials: true,
  origin: function (origin, callback) {
    if (!origin || allowList.some((regex) => regex.test(origin))) {
      callback(null, true);
    } else {
      callback(
        new Error(`Request from origin "${origin}" not allowed by CORS.`)
      );
    }
  },
};
