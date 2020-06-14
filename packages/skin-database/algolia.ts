import algoliasearch from "algoliasearch";
import { ALGOLIA_INDEX, ALGOLIA_KEY } from "./config";

const client = algoliasearch(ALGOLIA_INDEX, ALGOLIA_KEY);
export const searchIndex = client.initIndex("Skins");
