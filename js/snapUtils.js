// box = {x, y, width, height}

export const SNAP_DISTANCE = 15;

export const top = (box) => box.y;
export const bottom = (box) => box.y + box.height;
export const left = (box) => box.x;
export const right = (box) => box.x + box.width;

export const near = (a, b) => Math.abs(a - b) < SNAP_DISTANCE;

export const snap = (boxA, boxB) => {
  let x, y;

  if (near(left(boxA), right(boxB))) {
    x = right(boxB);
  }

  if (near(right(boxA), left(boxB))) {
    x = left(boxB) - boxA.width;
  }

  if (near(top(boxA), bottom(boxB))) {
    y = bottom(boxB);
  }

  if (near(bottom(boxA), top(boxB))) {
    y = top(boxB) - boxA.height;
  }
  return {x, y};
};

export const snapToMany = (boxA, otherBoxes) => {
  let x, y;

  otherBoxes.forEach((boxB) => {
    const newPos = snap(boxA, boxB);
    x = newPos.x || x;
    y = newPos.y || y;
  });

  return {x, y};
};
