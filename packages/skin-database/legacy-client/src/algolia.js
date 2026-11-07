import * as Utils from "./utils";
import { gql } from "./utils";
import { algoliasearch } from "algoliasearch";

const client = algoliasearch("HQ9I5Z6IM5", "6466695ec3f624a5fccf46ec49680e51");

// Whether search goes to Algolia or to our own SQLite FTS index. We've run
// out of Algolia quota before (it's ~300k search requests per billing period,
// which resets on the 16th); set this to false to serve search ourselves.
export const USE_ALGOLIA = true;

// Fallback search that uses SQLite. Useful for when we've exceeded the Algolia
// search quota. Takes the whole search, has:/filter: terms and all: the
// server applies them, except comparisons such as has:transparency>100.
export async function graphqlSearch(query) {
  const queryText = gql`
    query SearchQuery($query: String!) {
      search_classic_skins(query: $query, first: 500) {
        filename(normalize_extension: true)
        md5
        nsfw
      }
    }
  `;
  const data = await Utils.fetchGraphql(queryText, { query });
  const hits = data.search_classic_skins.map((skin) => {
    return {
      objectID: skin.md5,
      fileName: skin.filename,
      nsfw: skin.nsfw,
    };
  });
  return { hits };
}

export async function algoliaSearch(query, options = {}) {
  const result = await client.searchSingleIndex({
    indexName: "Skins",
    searchParams: {
      query,
      attributesToRetrieve: ["objectID", "fileName", "color", "nsfw"],
      attributesToHighlight: [],
      hitsPerPage: 1000,
      // https://www.algolia.com/doc/api-reference/api-parameters/typoTolerance/
      // min: Retrieve records with the smallest number of typos.
      typoTolerance: "min",
      ...options,
    },
  });
  return result;
}
