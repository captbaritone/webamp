import { getPositionDiff, generateGraph } from "./resizeUtils";

describe("resizeUtils", () => {
  it("can enter shade mode", () => {
    const graph = {
      a: {},
      b: { below: "a" },
      c: { below: "b" },
    };
    const sizeDiff = {
      a: { height: -75, width: 0 },
      b: { height: 0, width: 0 },
      c: { height: 0, width: 0 },
    };
    const actual = getPositionDiff(graph, sizeDiff);
    const expected = {
      a: { x: 0, y: 0 },
      b: { x: 0, y: -75 },
      c: { x: 0, y: -75 },
    };
    expect(actual).toEqual(expected);
  });
  it("can make the middle window enter shade mode", () => {
    const graph = {
      a: {},
      b: { below: "a" },
      c: { below: "b" },
    };
    const sizeDiff = {
      a: { height: 0, width: 0 },
      b: { height: -75, width: 0 },
      c: { height: 0, width: 0 },
    };
    const actual = getPositionDiff(graph, sizeDiff);
    const expected = {
      a: { x: 0, y: 0 },
      b: { x: 0, y: 0 },
      c: { x: 0, y: -75 },
    };
    expect(actual).toEqual(expected);
  });
  it("can exit shade mode", () => {
    const graph = {
      a: {},
      b: { below: "a" },
      c: { below: "b" },
    };
    const sizeDiff = {
      a: { height: 75, width: 0 },
      b: { height: 0, width: 0 },
      c: { height: 0, width: 0 },
    };
    const actual = getPositionDiff(graph, sizeDiff);
    const expected = {
      a: { x: 0, y: 0 },
      b: { x: 0, y: 75 },
      c: { x: 0, y: 75 },
    };
    expect(actual).toEqual(expected);
  });
  it("can enter double mode", () => {
    const graph = {
      a: {},
      b: { below: "a" },
      c: { below: "b" },
    };
    const sizeDiff = {
      a: { height: 100, width: 100 },
      b: { height: 100, width: 100 },
      c: { height: 100, width: 100 },
    };
    const actual = getPositionDiff(graph, sizeDiff);
    const expected = {
      a: { x: 0, y: 0 },
      b: { x: 0, y: 100 },
      c: { x: 0, y: 200 },
    };
    expect(actual).toEqual(expected);
  });
  it("can enter double mode when shaped like a grid", () => {
    const graph = {
      a: {},
      b: { right: "a" },
      c: { below: "a" },
      d: { below: "b", right: "c" },
    };
    const sizeDiff = {
      a: { height: 100, width: 100 },
      b: { height: 100, width: 100 },
      c: { height: 100, width: 100 },
      d: { height: 100, width: 100 },
    };
    const actual = getPositionDiff(graph, sizeDiff);
    const expected = {
      a: { x: 0, y: 0 },
      b: { x: 100, y: 0 },
      c: { x: 0, y: 100 },
      d: { x: 100, y: 100 },
    };
    expect(actual).toEqual(expected);
  });
  it("can enter double mode when shaped like a 3x3 grid", () => {
    const graph = {
      a: {},
      b: { right: "a" },
      c: { right: "b" },

      d: { below: "a" },
      e: { below: "b", right: "d" },
      f: { below: "c", right: "e" },

      g: { below: "d" },
      h: { below: "e", right: "g" },
      i: { below: "f", right: "h" },
    };
    const sizeDiff = {
      a: { height: 100, width: 100 },
      b: { height: 100, width: 100 },
      c: { height: 100, width: 100 },

      d: { height: 100, width: 100 },
      e: { height: 100, width: 100 },
      f: { height: 100, width: 100 },

      g: { height: 100, width: 100 },
      h: { height: 100, width: 100 },
      i: { height: 100, width: 100 },
    };
    const actual = getPositionDiff(graph, sizeDiff);
    const expected = {
      a: { x: 0, y: 0 },
      b: { x: 100, y: 0 },
      c: { x: 200, y: 0 },

      d: { x: 0, y: 100 },
      e: { x: 100, y: 100 },
      f: { x: 200, y: 100 },

      g: { x: 0, y: 200 },
      h: { x: 100, y: 200 },
      i: { x: 200, y: 200 },
    };
    expect(actual).toEqual(expected);
  });
  it("can exit double mode", () => {
    const graph = {
      a: {},
      b: { below: "a" },
      c: { below: "b" },
    };
    const sizeDiff = {
      a: { height: -100, width: -100 },
      b: { height: -100, width: -100 },
      c: { height: -100, width: -100 },
    };
    const actual = getPositionDiff(graph, sizeDiff);
    const expected = {
      a: { x: 0, y: 0 },
      b: { x: 0, y: -100 },
      c: { x: 0, y: -200 },
    };
    expect(actual).toEqual(expected);
  });
  it("can enter shade mode when horizontal", () => {
    const graph = {
      a: {},
      b: { right: "a" },
      c: { right: "b" },
    };
    const sizeDiff = {
      a: { height: -75, width: 0 },
      b: { height: 0, width: 0 },
      c: { height: 0, width: 0 },
    };
    const actual = getPositionDiff(graph, sizeDiff);
    const expected = {
      a: { x: 0, y: 0 },
      b: { x: 0, y: 0 },
      c: { x: 0, y: 0 },
    };
    expect(actual).toEqual(expected);
  });
  it("can enter double mode when horizontal", () => {
    const graph = {
      a: {},
      b: { right: "a" },
      c: { right: "b" },
    };
    const sizeDiff = {
      a: { height: 100, width: 100 },
      b: { height: 100, width: 100 },
      c: { height: 100, width: 100 },
    };
    const actual = getPositionDiff(graph, sizeDiff);
    const expected = {
      a: { x: 0, y: 0 },
      b: { x: 100, y: 0 },
      c: { x: 200, y: 0 },
    };
    expect(actual).toEqual(expected);
  });
  it("can leave double mode when horizontal", () => {
    const graph = {
      a: {},
      b: { right: "a" },
      c: { right: "b" },
    };
    const sizeDiff = {
      a: { height: -100, width: -100 },
      b: { height: -100, width: -100 },
      c: { height: -100, width: -100 },
    };
    const actual = getPositionDiff(graph, sizeDiff);
    const expected = {
      a: { x: 0, y: 0 },
      b: { x: -100, y: 0 },
      c: { x: -200, y: 0 },
    };
    expect(actual).toEqual(expected);
  });
  it("can shade two windows above two other windows", () => {
    const graph = {
      a: {},
      b: { below: "a" },
      c: {},
      d: { below: "c" },
    };
    const sizeDiff = {
      a: { height: -75, width: 0 },
      b: { height: 0, width: 0 },
      c: { height: -75, width: 0 },
      d: { height: 0, width: 0 },
    };
    const actual = getPositionDiff(graph, sizeDiff);
    const expected = {
      a: { x: 0, y: 0 },
      b: { x: 0, y: -75 },
      c: { x: 0, y: 0 },
      d: { x: 0, y: -75 },
    };
    expect(actual).toEqual(expected);
  });
});
describe("generateGraph", () => {
  it("of stacked windows", () => {
    const actual = generateGraph([
      { key: "a", x: 0, y: 0, width: 100, height: 100 },
      { key: "b", x: 0, y: 100, width: 100, height: 100 },
      { key: "c", x: 0, y: 200, width: 100, height: 100 },
    ]);
    expect(actual).toEqual({
      a: {},
      b: { below: "a" },
      c: { below: "b" },
    });
  });
  it("of disconnected windows", () => {
    const actual = generateGraph([
      { key: "a", x: 0, y: 0, width: 100, height: 100 },
      { key: "b", x: 0, y: 110, width: 100, height: 100 },
    ]);
    expect(actual).toEqual({
      a: {},
      b: {},
    });
  });
  it("of windows that touch in y, but the lower one is to the right", () => {
    const actual = generateGraph([
      { key: "a", x: 0, y: 0, width: 100, height: 100 },
      { key: "b", x: 110, y: 100, width: 100, height: 100 },
    ]);
    expect(actual).toEqual({
      a: {},
      b: {},
    });
  });
  it("of windows that touch in y, but the lower one is to the left", () => {
    const actual = generateGraph([
      { key: "a", x: 110, y: 0, width: 100, height: 100 },
      { key: "b", x: 0, y: 100, width: 100, height: 100 },
    ]);
    expect(actual).toEqual({
      a: {},
      b: {},
    });
  });
  it("of windows that touch in x, but the right one is below", () => {
    const actual = generateGraph([
      { key: "a", x: 0, y: 0, width: 100, height: 100 },
      { key: "b", x: 100, y: 110, width: 100, height: 100 },
    ]);
    expect(actual).toEqual({
      a: {},
      b: {},
    });
  });
  it("of windows that touch in x, but the right one is above", () => {
    const actual = generateGraph([
      { key: "a", x: 0, y: 110, width: 100, height: 100 },
      { key: "b", x: 100, y: 0, width: 100, height: 100 },
    ]);
    expect(actual).toEqual({
      a: {},
      b: {},
    });
  });
});
