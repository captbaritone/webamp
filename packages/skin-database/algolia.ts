import { algoliasearch } from "algoliasearch";
import { ALGOLIA_ACCOUNT, ALGOLIA_KEY } from "./config";

console.log("Algolia account:", JSON.stringify(ALGOLIA_ACCOUNT));

export const client = algoliasearch(ALGOLIA_ACCOUNT, ALGOLIA_KEY);
