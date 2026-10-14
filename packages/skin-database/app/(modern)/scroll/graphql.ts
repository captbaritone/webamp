// Minimal client for our own GraphQL endpoint (app/graphql/route.ts).
export async function fetchGraphql(
  query: string,
  variables: Record<string, unknown> = {}
): Promise<any> {
  const response = await fetch("/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
  });
  if (!response.ok) {
    throw new Error(`GraphQL request failed: ${response.status}`);
  }
  const json = await response.json();
  if (json.errors?.length) {
    throw new Error(json.errors[0].message);
  }
  return json.data;
}
