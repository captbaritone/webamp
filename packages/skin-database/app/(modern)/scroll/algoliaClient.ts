import { algoliasearch } from "algoliasearch";

// Using the legacy hardcoded credentials for client-side search
const client = algoliasearch("HQ9I5Z6IM5", "6466695ec3f624a5fccf46ec49680e51");

export async function searchSkins(query: string) {
  const result = await client.searchSingleIndex({
    indexName: "Skins",
    searchParams: {
      query,
      attributesToRetrieve: ["objectID", "fileName", "nsfw"],
      attributesToHighlight: [],
      hitsPerPage: 1000,
      typoTolerance: "min",
    },
  });
  return result;
}
