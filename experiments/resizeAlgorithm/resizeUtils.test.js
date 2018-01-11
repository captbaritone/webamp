import fs from "fs";

import { double } from "./resizeUtils";

function compositeContains(composite, value) {
  return !!(composite & value);
}

const decomposeValues = composite =>
  [1, 2, 4].filter(value => compositeContains(composite, value));

function matrixFromMap(map) {
  return map
    .trim()
    .split("\n")
    .map(row => row.trim().split(""));
}

function walkMatrix(matrix, cb) {
  matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      cb(x, y, value);
    });
  });
}

function boxesFromMatrix(matrix) {
  const boxes = new Map();
  walkMatrix(matrix, (x, y, composite) => {
    const values = decomposeValues(composite);
    values.forEach(value => {
      if (!boxes.has(value)) {
        // Initialize the box
        boxes.set(value, { top: y, left: x, width: 1, height: 1 });
      } else {
        const box = boxes.get(value);
        if (box.top === y && x - box.left === box.width) {
          // The top side is still growing.
          box.width++;
        } else if (box.left === x && y - box.top === box.height) {
          // The left side is still growing.
          box.height++;
        }
      }
    });
  });
  return boxes;
}

function parseBoxes(map) {
  return boxesFromMatrix(matrixFromMap(map));
}

function boxContains(box, pos) {
  if (
    pos.x >= box.left &&
    pos.x < box.left + box.width &&
    pos.y >= box.top &&
    pos.y < box.top + box.height
  ) {
    return true;
  }
  return false;
}

function matrixFromBoxes(boxes) {
  let width = 0;
  let height = 0;
  boxes.forEach(box => {
    width = Math.max(width, box.left + box.width);
    height = Math.max(height, box.top + box.height);
  });
  const matrix = [];
  for (let y = 0; y < height; y++) {
    if (!matrix[y]) {
      matrix[y] = [];
    }
    for (let x = 0; x < width; x++) {
      let cellNumber = 0;
      boxes.forEach((box, boxNumber) => {
        if (boxContains(box, { x, y })) {
          cellNumber += Number(boxNumber);
        }
      });
      matrix[y].push(String(cellNumber || " "));
    }
  }
  return matrix;
}

function mapFromMatrix(matrix) {
  return matrix.map(row => row.join("")).join("\n");
}

function assertionsFromTxt(txtPath) {
  return fs
    .readFileSync(txtPath, "utf8")
    .split(/\=\=\= /)
    .filter(Boolean)
    .map(assertionText => {
      const lines = assertionText.split("\n");
      const [message, ...bodyLines] = lines;
      let [input, output] = bodyLines.join("\n").split("---\n");
      input = input.trim();
      output = output.trim();
      return { message, input, output };
    });
}

xdescribe("integration", () => {
  assertionsFromTxt("./js/__fixtures__/resizeDoubleTestCases.txt").forEach(
    ({ input, output, message }) => {
      it(message, () => {
        const matrix = matrixFromMap(input);
        const boxes = boxesFromMatrix(matrix);
        const doubledBoxes = double(boxes);
        const derivedMatrix = matrixFromBoxes(doubledBoxes);
        const derivedMap = mapFromMatrix(derivedMatrix);
        expect(derivedMap).toEqual(output);
      });
    }
  );
});

describe("matrixFromBoxes", () => {
  it("can make a matrix from a box", () => {
    const boxes = new Map([["1", { top: 0, left: 0, width: 4, height: 4 }]]);
    expect(matrixFromBoxes(boxes)).toEqual(
      matrixFromMap(`
        1111
        1111
        1111
        1111
    `)
    );
  });
  it("can make a matrix from two boxes", () => {
    const boxes = new Map([
      ["1", { top: 0, left: 0, width: 4, height: 4 }],
      ["2", { top: 1, left: 1, width: 2, height: 2 }]
    ]);
    expect(matrixFromBoxes(boxes)).toEqual(
      matrixFromMap(`
        1111
        1331
        1331
        1111
    `)
    );
  });
});

describe("parseBoxes", () => {
  it("parses a box", () => {
    const boxes = parseBoxes(`
        1111
        1111
        1111
        1111
    `);
    expect(boxes.get(1)).toEqual({ top: 0, left: 0, width: 4, height: 4 });
  });
  it("parses a smaller box", () => {
    const boxes = parseBoxes(`
      11
      11
    `);
    expect(boxes.get(1)).toEqual({ top: 0, left: 0, width: 2, height: 2 });
  });
  it("parses nested boxes", () => {
    const boxes = parseBoxes(`
      1111
      1331
      1331
      1111
    `);
    expect(boxes.get(1)).toEqual({ top: 0, left: 0, width: 4, height: 4 });
    expect(boxes.get(2)).toEqual({ top: 1, left: 1, width: 2, height: 2 });
  });
  it("parses overlapping boxes", () => {
    const boxes = parseBoxes(`
      110
      132
      022
    `);
    expect(boxes.get(1)).toEqual({ top: 0, left: 0, width: 2, height: 2 });
    expect(boxes.get(2)).toEqual({ top: 1, left: 1, width: 2, height: 2 });
  });
  it("parses three overlapping boxes", () => {
    const boxes = parseBoxes(`
      1154
      1374
      0220
    `);
    expect(boxes.get(1)).toEqual({ top: 0, left: 0, width: 3, height: 2 });
    expect(boxes.get(2)).toEqual({ top: 1, left: 1, width: 2, height: 2 });
    expect(boxes.get(4)).toEqual({ top: 0, left: 2, width: 2, height: 2 });
  });
});
