import * as Utils from "./utils";
import algoliasearch from "algoliasearch";
var client = algoliasearch("HQ9I5Z6IM5", "6466695ec3f624a5fccf46ec49680e51");

var index = client.initIndex("Skins");

export async function graphqlSearch(query, options = {}) {
  const queryText = Utils.gql`
   query SearchQuery($query: String!) {
  search_classic_skins(query: $query) {
    filename
    md5
    nsfw
  }
}`;
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

export function search(query, options = {}) {
  return new Promise((resolve, reject) => {
    index.search(
      {
        query,
        attributes: ["objectID", "fileName", "color", "nsfw"],
        attributesToHighlight: [],
        hitsPerPage: 1000,
        // https://www.algolia.com/doc/api-reference/api-parameters/typoTolerance/
        // min: Retrieve records with the smallest number of typos.
        typoTolerance: "min",
        ...options,
      },
      (err, content) => {
        if (err != null) {
          reject(err);
          return;
        }
        resolve(content);
      }
    );
  });
}
