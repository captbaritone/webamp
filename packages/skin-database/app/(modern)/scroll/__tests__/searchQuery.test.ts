import { hasFilter, parseSearch, toggleFilter } from "../searchQuery";

test("splits has: filters from a search's words", () => {
  expect(parseSearch("zelda has:ani")).toEqual({
    text: "zelda",
    options: { filters: "ani=1" },
    hasSyntax: true,
  });
  expect(parseSearch("has:transparency")).toEqual({
    text: "",
    options: { numericFilters: "transparentPixels>=4000" },
    hasSyntax: true,
  });
});

test("leaves titles with colons alone", () => {
  // Among the museum's real searches.
  for (const query of ["re:zero", "steins:gate", "beck:"]) {
    expect(parseSearch(query)).toEqual({
      text: query,
      options: {},
      hasSyntax: false,
    });
  }
});

test("counts terms for unknown attributes as syntax", () => {
  // The parser drops them, so the server's search would differ.
  expect(parseSearch("has:sparkles").hasSyntax).toBe(true);
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
