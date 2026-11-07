import { hasFilter, parseSearch, toggleFilter } from "../searchQuery";

test("splits has: filters from a search's words", () => {
  expect(parseSearch("zelda has:ani")).toEqual({
    text: "zelda",
    options: { filters: "ani=1" },
    filtersComplete: true,
  });
  expect(parseSearch("has:transparency")).toEqual({
    text: "",
    options: { numericFilters: "transparentPixels>=4000" },
    filtersComplete: true,
  });
});

test("leaves titles with colons alone", () => {
  // Among the museum's real searches.
  for (const query of ["re:zero", "steins:gate", "beck:"]) {
    expect(parseSearch(query)).toEqual({
      text: query,
      options: {},
      filtersComplete: true,
    });
  }
});

test("knows which terms our own search can't take", () => {
  // The parser drops unknown attributes, so the server's search would differ.
  expect(parseSearch("has:sparkles").filtersComplete).toBe(false);
  expect(parseSearch("has:transparency>100").filtersComplete).toBe(false);
});

test("adds and removes a filter term, leaving the rest", () => {
  expect(toggleFilter("", "has:ani", true)).toBe("has:ani");
  expect(toggleFilter("zelda", "has:ani", true)).toBe("zelda has:ani");
  // Already there.
  expect(toggleFilter("zelda has:ani", "has:ani", true)).toBe("zelda has:ani");
  expect(toggleFilter("zelda has:ani has:cur", "has:ani", false)).toBe(
    "zelda has:cur"
  );
  expect(toggleFilter("has:ani", "has:ani", false)).toBe("");
});

test("only counts a filter that's a whole term, and not negated", () => {
  expect(hasFilter("zelda has:ani", "has:ani")).toBe(true);
  expect(hasFilter("has:animated", "has:ani")).toBe(false);
  expect(hasFilter("-has:ani", "has:ani")).toBe(false);
});
