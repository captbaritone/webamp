import algoliasearch from "algoliasearch";
import { ALGOLIA_ACCOUNT, ALGOLIA_KEY, ALGOLIA_INDEX } from "./config";

const client = algoliasearch(ALGOLIA_ACCOUNT, ALGOLIA_KEY);
export const searchIndex = client.initIndex(ALGOLIA_INDEX);
