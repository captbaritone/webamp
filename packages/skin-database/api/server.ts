import Sentry from "@sentry/node";
import { createApp } from "./app";

const port = process.env.PORT ? Number(process.env.PORT) : 3001;

// GO!
const app = createApp();
app.listen(port, () => console.log(`Example app listening on port ${port}!`));

// Initialize Sentry after we start listening. Any crash at start time will appear in the console and we'll notice.
Sentry.init({
  dsn:
    "https://0e6bc841b4f744b2953a1fe5981effe6@o68382.ingest.sentry.io/5508241",

  // We recommend adjusting this value in production, or using tracesSampler
  // for finer control
  tracesSampleRate: 1.0,
});
