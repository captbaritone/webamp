import { getRangeCenteredOnIndex } from "../PresetOverlay";

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
