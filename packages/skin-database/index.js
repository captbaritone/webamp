const express = require("express");
const app = express();
const Skins = require("./data/skins");
const port = process.env.PORT ? Number(process.env.PORT) : 3001;
const fileUpload = require("express-fileupload");
const cors = require("cors");
var bodyParser = require("body-parser");
const expressSitemapXml = require("express-sitemap-xml");
const router = require("./router");

const Sentry = require("@sentry/node");
// or use es6 import statements
// import * as Sentry from '@sentry/node';

Sentry.init({
  dsn:
    "https://0e6bc841b4f744b2953a1fe5981effe6@o68382.ingest.sentry.io/5508241",

  // We recommend adjusting this value in production, or using tracesSampler
  // for finer control
  tracesSampleRate: 1.0,
});

const allowList = [
  /https:\/\/skins\.webamp\.org/,
  /http:\/\/localhost:3000/,
  /netlify.app/,
];
const corsOptions = {
  origin: function (origin, callback) {
    if (allowList.some((regex) => regex.test(origin)) || !origin) {
      callback(null, true);
    } else {
      callback(
        new Error(`Request from origin "${origin}" not allowed by CORS.`)
      );
    }
  },
};

async function getUrls() {
  const md5s = await Skins.getAllClassicSkins();
  const skinUrls = md5s.map(({ md5, fileName }) => `skin/${md5}/${fileName}`);
  return ["/about", "/", "/upload", ...skinUrls];
}
app.use(expressSitemapXml(getUrls, "https://skins.webamp.org"));

// parse application/json
app.use(bodyParser.json());

app.use(Sentry.Handlers.requestHandler());

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

// TODO: Look into 766c4fad9088037ab4839b18292be8b1
// Has huge number of filenames in info.json

app.set("json spaces", 2);
app.use(
  fileUpload({
    limits: { fileSize: 50 * 1024 * 1024 },
  })
);

app.use(router);

// The error handler must be before any other error middleware and after all controllers
app.use(Sentry.Handlers.errorHandler());

// Optional fallthrough error handler
app.use(function onError(err, req, res, next) {
  res.statusCode = 500;
  res.json({ errorId: res.sentry, message: err.message });
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
