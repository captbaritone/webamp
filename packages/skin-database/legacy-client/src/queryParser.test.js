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

test("Filters for our own search", () => {
  const [query, , filters, complete] = queryParser(
    "zelda has:ani -has:playlist has:transparency -filter:nsfw"
  );
  expect(query.trim()).toBe("zelda");
  expect(filters).toEqual({
    ani: true,
    playlist: false,
    transparency: true,
    nsfw: false,
  });
  expect(complete).toBe(true);
});

test("Our own search's filters can't say comparisons or unknown attributes", () => {
  expect(queryParser("has:transparency>100")[3]).toBe(false);
  expect(queryParser("has:sparkles")[3]).toBe(false);
  expect(queryParser("zelda")[3]).toBe(true);
});
