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

export const applySnap = (original, ...snaps) =>
  snaps.reduce(
    (previous, snapped) => ({
      ...previous,
      x: typeof snapped.x !== "undefined" ? snapped.x : previous.x,
      y: typeof snapped.y !== "undefined" ? snapped.y : previous.y
    }),
    original
  );
