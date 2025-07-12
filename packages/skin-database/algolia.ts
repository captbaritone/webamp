import { algoliasearch } from "algoliasearch";
import { ALGOLIA_ACCOUNT, ALGOLIA_KEY } from "./config";

if (!ALGOLIA_ACCOUNT || !ALGOLIA_KEY) {
  throw new Error("Algolia account and key must be defined in config.js");
}

export const client = algoliasearch(ALGOLIA_ACCOUNT, ALGOLIA_KEY);
