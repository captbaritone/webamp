import { ftsColumnExpression, ftsMatchExpression } from "../ftsQuery";

describe("ftsMatchExpression", () => {
  it("quotes each token and prefix matches the last one", () => {
    expect(ftsMatchExpression("green day")).toBe('"green" "day"*');
  });

  it("handles a single token", () => {
    expect(ftsMatchExpression("metallica")).toBe('"metallica"*');
  });

  it("does not prefix match a single character token", () => {
    expect(ftsMatchExpression("a")).toBe('"a"');
    expect(ftsMatchExpression("blink a")).toBe('"blink" "a"');
  });

  it("strips characters FTS5 would read as operators", () => {
    // Each of these threw a syntax error when passed through directly.
    expect(ftsMatchExpression("rock's")).toBe('"rock" "s"');
    expect(ftsMatchExpression("drum-n-bass")).toBe('"drum" "n" "bass"*');
    expect(ftsMatchExpression("C++")).toBe('"C"');
    expect(ftsMatchExpression("AND")).toBe('"AND"*');
    expect(ftsMatchExpression('"unclosed')).toBe('"unclosed"*');
    expect(ftsMatchExpression("a:b")).toBe('"a" "b"');
    expect(ftsMatchExpression("NEAR(foo")).toBe('"NEAR" "foo"*');
  });

  it("keeps digits and non-latin letters", () => {
    expect(ftsMatchExpression("blink 182")).toBe('"blink" "182"*');
    expect(ftsMatchExpression("плеер")).toBe('"плеер"*');
  });

  it("returns null when there is nothing to search for", () => {
    expect(ftsMatchExpression("")).toBe(null);
    expect(ftsMatchExpression("   ")).toBe(null);
    // queryParser strips `filter:` tokens out of the query before it reaches
    // us, so an all-filters query arrives empty.
    expect(ftsMatchExpression("+++")).toBe(null);
  });
});

describe("ftsColumnExpression", () => {
  it("limits a match expression to one column", () => {
    expect(ftsColumnExpression("file_names", '"green" "day"*')).toBe(
      'file_names : ("green" "day"*)'
    );
  });
});
