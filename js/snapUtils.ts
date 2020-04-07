import { Box, Point, Diff, BoundingBox } from "./types";

export const SNAP_DISTANCE = 15;

export const top = (box: Box) => box.y;
export const bottom = (box: Box) => box.y + box.height;
export const left = (box: Box) => box.x;
export const right = (box: Box) => box.x + box.width;

export const near = (a: number, b: number) => Math.abs(a - b) < SNAP_DISTANCE;

// http://stackoverflow.com/a/3269471/1263117
export const overlapX = (a: Box, b: Box) =>
  left(a) <= right(b) + SNAP_DISTANCE && left(b) <= right(a) + SNAP_DISTANCE;
export const overlapY = (a: Box, b: Box) =>
  top(a) <= bottom(b) + SNAP_DISTANCE && top(b) <= bottom(a) + SNAP_DISTANCE;

// Give a new position for `boxA` that snaps it to `boxB` if neede.
export const snap = (boxA: Box, boxB: Box) => {
  let x, y;

  // TODO: Refactor/simplify this code
  if (overlapY(boxA, boxB)) {
    if (near(left(boxA), right(boxB))) {
      x = right(boxB);
    } else if (near(right(boxA), left(boxB))) {
      x = left(boxB) - boxA.width;
    } else if (near(left(boxA), left(boxB))) {
      x = left(boxB);
    } else if (near(right(boxA), right(boxB))) {
      x = right(boxB) - boxA.width;
    }
  }

  if (overlapX(boxA, boxB)) {
    if (near(top(boxA), bottom(boxB))) {
      y = bottom(boxB);
    } else if (near(bottom(boxA), top(boxB))) {
      y = top(boxB) - boxA.height;
    } else if (near(top(boxA), top(boxB))) {
      y = top(boxB);
    } else if (near(bottom(boxA), bottom(boxB))) {
      y = bottom(boxB) - boxA.height;
    }
  }
  return { x, y };
};

export const snapDiff = (a: Box, b: Box): Point => {
  const newPos = snap(a, b);
  return {
    x: newPos.x === undefined ? 0 : newPos.x - a.x,
    y: newPos.y === undefined ? 0 : newPos.y - a.y,
  };
};

// TODO: Use the first x and y combo
export const snapDiffManyToMany = (as: Box[], bs: Box[]): Point => {
  let x: number | undefined = 0;
  let y: number | undefined = 0;
  for (const a of as) {
    for (const b of bs) {
      const diff = snapDiff(a, b);
      x = x || diff.x;
      y = y || diff.y;
      if (x !== undefined && x > 0 && y !== undefined && y > 0) {
        break;
      }
    }
  }
  return { x, y };
};

export const snapToMany = (boxA: Box, otherBoxes: Box[]): Diff => {
  let x: number | undefined;
  let y: number | undefined;

  otherBoxes.forEach((boxB) => {
    const newPos = snap(boxA, boxB);
    x = newPos.x || x;
    y = newPos.y || y;
  });

  return { x, y };
};

export const snapWithin = (boxA: Box, boundingBox: BoundingBox): Diff => {
  let x, y;

  if (boxA.x - SNAP_DISTANCE < 0) {
    x = 0;
  } else if (boxA.x + boxA.width + SNAP_DISTANCE > boundingBox.width) {
    x = boundingBox.width - boxA.width;
  }

  if (boxA.y - SNAP_DISTANCE < 0) {
    y = 0;
  } else if (boxA.y + boxA.height + SNAP_DISTANCE > boundingBox.height) {
    y = boundingBox.height - boxA.height;
  }

  return { x, y };
};

export const snapWithinDiff = (a: Box, b: BoundingBox) => {
  const newPos = snapWithin(a, b);
  return {
    x: newPos.x === undefined ? 0 : newPos.x - a.x,
    y: newPos.y === undefined ? 0 : newPos.y - a.y,
  };
};

export const applySnap = (original: Point, ...snaps: Diff[]) =>
  snaps.reduce(
    (previous, snapped) => ({
      ...previous,
      x: typeof snapped.x !== "undefined" ? snapped.x : previous.x,
      y: typeof snapped.y !== "undefined" ? snapped.y : previous.y,
    }),
    original
  );

export const boundingBox = (nodes: Box[]): Box => {
  const boxes = nodes.slice();
  const firstNode = boxes.pop();
  if (firstNode == null) {
    throw new Error("boundingBox must be called with at least one node");
  }
  const bounding = {
    top: top(firstNode),
    right: right(firstNode),
    bottom: bottom(firstNode),
    left: left(firstNode),
  };

  boxes.forEach((node) => {
    bounding.top = Math.min(bounding.top, top(node));
    bounding.right = Math.max(bounding.right, right(node));
    bounding.bottom = Math.max(bounding.bottom, bottom(node));
    bounding.left = Math.min(bounding.left, left(node));
  });

  return {
    x: bounding.left,
    y: bounding.top,
    width: bounding.right - bounding.left,
    height: bounding.bottom - bounding.top,
  };
};

export function traceConnection<B extends Box>(
  areConnected: (candidate: Box, n: Box) => boolean
) {
  return (candidates: B[], node: B): Set<B> => {
    const connected = new Set<B>();
    const checkNode = (n: B) => {
      for (const candidate of candidates) {
        if (!connected.has(candidate) && areConnected(candidate, n)) {
          connected.add(candidate);
          checkNode(candidate);
        }
      }
    };
    checkNode(node);
    return connected;
  };
}

export const applyDiff = (a: Point, b: Point) => ({
  x: a.x + b.x,
  y: a.y + b.y,
});

// TODO: This should not
export const applyMultipleDiffs = (initial: Point, ...diffs: Point[]) => {
  const metaDiff = diffs.reduce((m, diff) => ({
    // Use the smallest non-zero diff for each axis.
    // TODO: Min should be the absolute value
    x: m.x === 0 || diff.x === 0 ? m.x + diff.x : Math.min(m.x, diff.x),
    y: m.y === 0 || diff.y === 0 ? m.y + diff.y : Math.min(m.y, diff.y),
  }));
  return applyDiff(initial, metaDiff);
};
