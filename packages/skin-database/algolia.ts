import { algoliasearch } from "algoliasearch";
import { ALGOLIA_ACCOUNT, ALGOLIA_KEY } from "./config";

console.log("RAN ALGOLIA", ALGOLIA_ACCOUNT, ALGOLIA_KEY);

export const client = algoliasearch(ALGOLIA_ACCOUNT, ALGOLIA_KEY);
