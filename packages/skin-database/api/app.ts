import router from "./router";
import fileUpload from "express-fileupload";
import cors, { CorsOptions } from "cors";
import bodyParser from "body-parser";
import Sentry from "@sentry/node";
import expressSitemapXml from "express-sitemap-xml";
import * as Skins from "../data/skins";
import express from "express";

export function createApp() {
  const app = express();
  app.use(Sentry.Handlers.requestHandler());

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
  app.use(Sentry.Handlers.errorHandler());

  // Optional fallthrough error handler
  app.use(function onError(err, req, res, next) {
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
