export interface NodeResolver {
  id({ id }): Promise<string>;
  __typename: string;
}

export function toId(graphqlType: string, id: string) {
  return Buffer.from(`${graphqlType}__${id}`).toString("base64");
}

export function fromId(base64Id: string): { graphqlType: string; id: string } {
  const decoded = Buffer.from(base64Id, "base64").toString("ascii");
  const [graphqlType, id] = decoded.split("__");
  return { graphqlType, id };
}
