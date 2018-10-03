import { mockRandom } from "jest-mock-random";
import Presets from "../Presets";

let presets;
beforeEach(() => {
  mockRandom([0.0]);
  presets = new Presets({
    keys: ["a", "b"],
    initialPresets: { a: "Preset A", b: "Preset B" },
    randomize: true
  });
});

describe("initialize", () => {
  beforeEach(() => {});
  test("picks a random value", () => {
    expect(presets.getCurrent()).toBe("Preset A");
  });

  test("picks another random value", () => {
    mockRandom([0.9]);
    presets = new Presets({
      keys: ["a", "b"],
      initialPresets: { a: "Preset A", b: "Preset B" },
      randomize: true
    });
    expect(presets.getCurrent()).toBe("Preset B");
  });

  test("picks its random value from the initial presets", () => {
    presets = new Presets({
      keys: ["a", "b", "c", "d", "e", "f", "g", "h"],
      initialPresets: { a: "Preset A" },
      randomize: true
    });
    expect(presets.getCurrent()).toBe("Preset A");
  });
});

describe("next", () => {
  test("picks a 'random' preset", async () => {
    mockRandom([0.9]);
    presets.next();
    expect(presets.getCurrent()).toBe("Preset B");

    mockRandom([0.0]);
    presets.next();
    expect(presets.getCurrent()).toBe("Preset A");
  });

  test("picks the next key", async () => {
    presets.setRandomize(false);
    presets.next();
    expect(presets.getCurrent()).toBe("Preset B");
  });

  test("wraps around", async () => {
    presets.setRandomize(false);
    presets.next();
    presets.next();
    expect(presets.getCurrent()).toBe("Preset A");
  });
});

describe("previous", () => {
  test("picks the previous key", async () => {
    presets.setRandomize(false);
    presets.next();
    presets.previous();
    expect(presets.getCurrent()).toBe("Preset A");
  });

  test("does nothing when you are on the first item", async () => {
    presets.previous();
    expect(presets.getCurrent()).toBe("Preset A");
  });

  test("can do sequential previouses", async () => {
    mockRandom([0.0]);
    presets = new Presets({
      keys: ["a", "b", "c", "d"],
      initialPresets: {
        a: "Preset A",
        b: "Preset B",
        c: "Preset C",
        d: "Preset D"
      },
      randomize: false
    });
    presets.next(); // b
    presets.next(); // c
    presets.next(); // d
    presets.previous(); // c
    presets.previous(); // b
    presets.previous(); // a
    expect(presets.getCurrent()).toBe("Preset A");
  });

  test("will successfully resolve an unloaded preset", async () => {
    mockRandom([0.0]);
    presets = new Presets({
      keys: ["a", "b", "c", "d"],
      initialPresets: {
        a: "Preset A"
      },
      randomize: false,
      getRest: () =>
        Promise.resolve({
          b: "Preset B",
          c: "Preset C"
        })
    });
    presets.next(); // b
    presets.next(); // c
    const final = await presets.previous(); // b
    expect(final).toBe("Preset B");
  });
});

describe("getRest", () => {
  beforeEach(() => {
    mockRandom([0.0]);
    presets = new Presets({
      keys: ["a", "b"],
      initialPresets: { a: "Preset A" },
      getRest: () =>
        Promise.resolve({
          b: "Preset B"
        })
    });
  });
  test("will get the rest of the presets if needed", async () => {
    mockRandom([0.9]);
    const resolved = presets.next();
    expect(presets.getCurrent()).toBe("Preset A");
    await resolved;
    expect(presets.getCurrent()).toBe("Preset B");
  });

  test("next (loading), previous brings us back to where we started", async () => {
    presets.setRandomize(false);
    presets.next();
    expect(presets.getCurrent()).toBe("Preset A");
    await presets.previous();
    expect(presets.getCurrent()).toBe("Preset A");
  });
});

describe("selectIndex", () => {
  test("adds an entry to the history", async () => {
    presets.selectIndex(1);
    presets.previous();
    expect(presets.getCurrent()).toBe("Preset A");
  });
});

describe("getCurrentIndex", () => {
  test("gets the active index while loading", async () => {
    presets = new Presets({
      keys: ["a", "b"],
      initialPresets: { a: "Preset A" },
      randomize: false,
      getRest: () =>
        Promise.resolve({
          b: "Preset B"
        })
    });
    const resolved = presets.next();
    expect(presets.getCurrentIndex()).toBe(0);
    await resolved;
    expect(presets.getCurrentIndex()).toBe(1);
  });
});
