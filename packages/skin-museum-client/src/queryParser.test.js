import queryParser from "./queryParser";

test("Only nsfw", () => {
  const [query, options] = queryParser("filter:nsfw");
  expect(query).toBe("");
  expect(options).toEqual({ filters: "nsfw=1" });
});

test("Not nsfw", () => {
  const [query, options] = queryParser("-filter:nsfw");
  expect(query).toBe("");
  expect(options).toEqual({ filters: "nsfw=0" });
});
