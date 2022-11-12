export async function fetchGraphql(query, variables) {
  const response = await fetch("https://api.webampskins.org/graphql", {
    headers: {
      accept: "application/json",
      "content-type": "application/json",
    },
    body: JSON.stringify({ query, variables }),
    method: "POST",
  });
  if (!response.ok) {
    throw new Error("Failed to fetch skin info");
  }
  const json = await response.json();
  const { data } = json;
  return data;
}

export function stripExt(filename) {
  return filename.replace(/\.[^/.]+$/, "");
}
