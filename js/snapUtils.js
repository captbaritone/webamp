// box = {x, y, width, height}

export const SNAP_DISTANCE = 15;

export const top = box => box.y;
export const bottom = box => box.y + box.height;
export const left = box => box.x;
export const right = box => box.x + box.width;

export const near = (a, b) => Math.abs(a - b) < SNAP_DISTANCE;

// http://stackoverflow.com/a/3269471/1263117
export const overlapX = (a, b) =>
  left(a) <= right(b) + SNAP_DISTANCE && left(b) <= right(a) + SNAP_DISTANCE;
export const overlapY = (a, b) =>
  top(a) <= bottom(b) + SNAP_DISTANCE && top(b) <= bottom(a) + SNAP_DISTANCE;

// Give a new position for `boxA` that snaps it to `boxB` if neede.
export const snap = (boxA, boxB) => {
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

export const snapDiff = (a, b) => {
  const newPos = snap(a, b);
  return {
    x: newPos.x === undefined ? 0 : newPos.x - a.x,
    y: newPos.y === undefined ? 0 : newPos.y - a.y
  };
};

// TODO: Use the first x and y combo
export const snapDiffManyToMany = (as, bs) => {
  let x = 0;
  let y = 0;
  for (const a of as) {
    for (const b of bs) {
      const diff = snapDiff(a, b);
      x = x || diff.x;
      y = y || diff.y;
      if (x > 0 && y > 0) {
        break;
      }
    }
  }
  return { x, y };
};

export const snapToMany = (boxA, otherBoxes) => {
  let x, y;

  otherBoxes.forEach(boxB => {
    const newPos = snap(boxA, boxB);
    x = newPos.x || x;
    y = newPos.y || y;
  });

  return { x, y };
};

export const snapWithin = (boxA, boundingBox) => {
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

export const snapWithinDiff = (a, b) => {
  const newPos = snapWithin(a, b);
  return {
    x: newPos.x === undefined ? 0 : newPos.x - a.x,
    y: newPos.y === undefined ? 0 : newPos.y - a.y
  };
};

export const applySnap = (original, ...snaps) =>
  snaps.reduce(
    (previous, snapped) => ({
      ...previous,
      x: typeof snapped.x !== "undefined" ? snapped.x : previous.x,
      y: typeof snapped.y !== "undefined" ? snapped.y : previous.y
    }),
    original
  );

export const boundingBox = nodes => {
  const boxes = nodes.slice();
  const firstNode = boxes.pop();
  const bounding = {
    top: top(firstNode),
    right: right(firstNode),
    bottom: bottom(firstNode),
    left: left(firstNode)
  };

  boxes.forEach(node => {
    bounding.top = Math.min(bounding.top, top(node));
    bounding.right = Math.max(bounding.right, right(node));
    bounding.bottom = Math.max(bounding.bottom, bottom(node));
    bounding.left = Math.min(bounding.left, left(node));
  });

  return {
    x: bounding.left,
    y: bounding.top,
    width: bounding.right - bounding.left,
    height: bounding.bottom - bounding.top
  };
};

export const traceConnection = areConnected => (candidates, node) => {
  const connected = new Set();
  const checkNode = n => {
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

export const applyDiff = (a, b) => ({
  x: a.x + b.x,
  y: a.y + b.y
});

// TODO: This should not
export const applyMultipleDiffs = (initial, ...diffs) => {
  const metaDiff = diffs.reduce((m, diff) => ({
    // Use the smallest non-zero diff for each axis.
    // TODO: Min should be the absolute value
    x: m.x === 0 || diff.x === 0 ? m.x + diff.x : Math.min(m.x, diff.x),
    y: m.y === 0 || diff.y === 0 ? m.y + diff.y : Math.min(m.y, diff.y)
  }));
  return applyDiff(initial, metaDiff);
};
