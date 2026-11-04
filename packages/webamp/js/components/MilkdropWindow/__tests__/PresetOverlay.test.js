import { describe, test, expect } from "vitest";
import {
  getRangeCenteredOnIndex,
  getFilteredItems,
  highlightMatch,
} from "../PresetOverlay";

describe("getRangeCenteredOnIndex", () => {
  test("gets the whole range when the list is the same size as the range", () => {
    expect(getRangeCenteredOnIndex(100, 100, 0)).toEqual([0, 99]);
    expect(getRangeCenteredOnIndex(100, 100, 99)).toEqual([0, 99]);
    expect(getRangeCenteredOnIndex(100, 100, 50)).toEqual([0, 99]);
  });
  test("gets the first elements when index < half of range", () => {
    expect(getRangeCenteredOnIndex(100, 50, 0)).toEqual([0, 49]);
    expect(getRangeCenteredOnIndex(100, 50, 24)).toEqual([0, 49]);
  });
  test("truncates the returned range when the passed range is smaller than items", () => {
    expect(getRangeCenteredOnIndex(100, 50, 0)).toEqual([0, 49]);
    expect(getRangeCenteredOnIndex(100, 50, 24)).toEqual([0, 49]);
  });
  test("returns empty range when length is zero", () => {
    expect(getRangeCenteredOnIndex(0, 50, 0)).toEqual([0, -1]);
  });
  test("follows an example sliding window", () => {
    expect(getRangeCenteredOnIndex(10, 5, 1)).toEqual([0, 4]);
    expect(getRangeCenteredOnIndex(10, 5, 2)).toEqual([0, 4]);
    expect(getRangeCenteredOnIndex(10, 5, 3)).toEqual([1, 5]);
    expect(getRangeCenteredOnIndex(10, 5, 4)).toEqual([2, 6]);
    expect(getRangeCenteredOnIndex(10, 5, 5)).toEqual([3, 7]);
    expect(getRangeCenteredOnIndex(10, 5, 6)).toEqual([4, 8]);
    expect(getRangeCenteredOnIndex(10, 5, 7)).toEqual([5, 9]);
    expect(getRangeCenteredOnIndex(10, 5, 8)).toEqual([5, 9]);
    expect(getRangeCenteredOnIndex(10, 5, 9)).toEqual([5, 9]);
  });
});

describe("getFilteredItems", () => {
  const presetKeys = [
    "Geiss - Artifact 01",
    "Krash & Rovastar - Cerebral Demons",
    "Flexi - Mindblob Mix",
    "shifter - swarm",
    "Eo.S. - ether posession",
  ];

  test("returns full list with Local Directory item when query is empty", () => {
    const items = getFilteredItems(presetKeys, "");
    expect(items.length).toBe(6);
    expect(items[0]).toEqual({
      type: "LOCAL_DIR",
      presetIndex: -1,
      label: "Load Local Directory",
    });
    expect(items[1]).toEqual({
      type: "PRESET",
      presetIndex: 0,
      label: "Geiss - Artifact 01",
    });
    expect(items[5]).toEqual({
      type: "PRESET",
      presetIndex: 4,
      label: "Eo.S. - ether posession",
    });
  });

  test("filters presets case-insensitively and excludes Local Directory", () => {
    const items = getFilteredItems(presetKeys, "demon");
    expect(items.length).toBe(1);
    expect(items[0]).toEqual({
      type: "PRESET",
      presetIndex: 1,
      label: "Krash & Rovastar - Cerebral Demons",
    });
  });

  test("filters substring across multiple matches while preserving original preset indices", () => {
    // "Geiss - Artifact 01" (0), "Krash & Rovastar" (1), and "shifter - swarm" (3) contain "ar"
    const items = getFilteredItems(presetKeys, "ar");
    expect(items.length).toBe(3);
    expect(items.map((i) => i.presetIndex)).toEqual([0, 1, 3]);
  });

  test("returns empty array when query does not match any preset", () => {
    const items = getFilteredItems(presetKeys, "nonexistent query xyz");
    expect(items).toEqual([]);
  });

  test("handles null presetKeys safely", () => {
    expect(getFilteredItems(null, "test")).toEqual([]);
  });
});

describe("highlightMatch", () => {
  test("returns raw text when query is empty", () => {
    expect(highlightMatch("Geiss - Artifact 01", "")).toBe(
      "Geiss - Artifact 01"
    );
  });

  test("returns raw text when query does not match", () => {
    expect(highlightMatch("Geiss - Artifact 01", "zzz")).toBe(
      "Geiss - Artifact 01"
    );
  });

  test("highlights matching substring with correct casing", () => {
    const node = highlightMatch("Krash - Cerebral Demons", "cerebral");
    expect(node).not.toBe("Krash - Cerebral Demons");
    // Verify it returns React element containing matched text
    expect(JSON.stringify(node)).toContain("Cerebral");
  });
});
