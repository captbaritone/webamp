import {
  DEFAULT_SEARCH_DEBOUNCE_MS,
  parseSearchDebounceMs,
  setSearchDebounceMs,
  getSearchDebounceMs,
} from "../legacy-client/src/searchConfig";

describe("parseSearchDebounceMs", () => {
  it("accepts a plain value", () => {
    expect(parseSearchDebounceMs("600")).toBe(600);
    expect(parseSearchDebounceMs(600)).toBe(600);
  });

  it("clamps to a range that keeps search usable", () => {
    expect(parseSearchDebounceMs("0")).toBe(50);
    expect(parseSearchDebounceMs("999999")).toBe(2000);
  });

  it("rounds fractional values", () => {
    expect(parseSearchDebounceMs("450.6")).toBe(451);
  });

  it("returns null for anything unusable, so we fall back to the default", () => {
    // An unset or fat-fingered env var must not disable search.
    expect(parseSearchDebounceMs(undefined)).toBe(null);
    expect(parseSearchDebounceMs("")).toBe(null);
    expect(parseSearchDebounceMs("soon")).toBe(null);
    expect(parseSearchDebounceMs("400ms")).toBe(null);
  });
});

describe("get/setSearchDebounceMs", () => {
  it("defaults to 400ms", () => {
    expect(getSearchDebounceMs()).toBe(DEFAULT_SEARCH_DEBOUNCE_MS);
    expect(DEFAULT_SEARCH_DEBOUNCE_MS).toBe(400);
  });

  it("ignores null so the default survives an unset env var", () => {
    setSearchDebounceMs(null);
    expect(getSearchDebounceMs()).toBe(DEFAULT_SEARCH_DEBOUNCE_MS);
  });

  it("applies a provided value", () => {
    setSearchDebounceMs(900);
    expect(getSearchDebounceMs()).toBe(900);
  });
});
