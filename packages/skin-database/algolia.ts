import { algoliasearch } from "algoliasearch";
import { ALGOLIA_ACCOUNT, ALGOLIA_KEY } from "./config";

export const client = algoliasearch(ALGOLIA_ACCOUNT, ALGOLIA_KEY);
