import { isRandomPlace, museumListLength, museumPosition } from "../museumList";

test.each([0, 1, 9, 10, 13, 14, 15, 100, 1001])(
  "a museum of %i skins puts each in one place, in order",
  (skins) => {
    const length = museumListLength(skins);
    const positions: number[] = [];
    for (let i = 0; i < length; i++) {
      if (!isRandomPlace(i)) positions.push(museumPosition(i));
    }
    expect(positions).toEqual(Array.from({ length: skins }, (_, i) => i));
    // It doesn't end on a random place with museum skins still to come, or
    // leave out one after the last full run.
    expect(isRandomPlace(length)).toBe(false);
  }
);

test("keeps the museum's top, then one place in five is random", () => {
  const places = Array.from({ length: 25 }, (_, i) => isRandomPlace(i));
  expect(places.map((random) => (random ? "R" : "m")).join("")).toBe(
    "mmmmmmmmmm" + "mmmmR" + "mmmmR" + "mmmmR"
  );
});
