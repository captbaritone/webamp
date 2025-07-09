import { algoliasearch } from "algoliasearch";
import { ALGOLIA_ACCOUNT, ALGOLIA_KEY, ALGOLIA_INDEX } from "./config";

export const client = algoliasearch(ALGOLIA_ACCOUNT, ALGOLIA_KEY);
