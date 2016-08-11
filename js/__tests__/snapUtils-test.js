jest.unmock('../snapUtils');

import {
  top,
  bottom,
  left,
  right,
  near,
  snap,
  overlapY,
  overlapX
} from '../snapUtils';

describe('side functions', () => {
  const box = {x: 10, y: 15, width: 50, height: 100};
  it('can find the top of a box', () => {
    const actual = top(box);
    const expected = 15;
    expect(actual).toEqual(expected);
  });
  it('can find the bottom of a box', () => {
    const actual = bottom(box);
    const expected = 115;
    expect(actual).toEqual(expected);
  });
  it('can find the left of a box', () => {
    const actual = left(box);
    const expected = 10;
    expect(actual).toEqual(expected);
  });
  it('can find the right of a box', () => {
    const actual = right(box);
    const expected = 60;
    expect(actual).toEqual(expected);
  });
});

describe('near function', () => {
  it('can tell if A is near B', () => {
    const actual = near(10, 20);
    const expected = true;
    expect(actual).toEqual(expected);
  });
  it('can tell if A is near B', () => {
    const actual = near(10, 30);
    const expected = false;
    expect(actual).toEqual(expected);
  });
});

describe('overlap functions', () => {
  it('overlapY detects when the boxes overlap in the Y axis', () => {
    const a = {y: 10, height: 50};
    const b = {y: 40, height: 50};
    const actual = overlapY(a, b);
    const expected = true;
    expect(actual).toEqual(expected);
  });
  it('overlapY detects when the boxes are within SNAP_DISTANCE on the Y axis', () => {
    const a = {y: 10, height: 50};
    const b = {y: 70, height: 50};
    const actual = overlapY(a, b);
    const expected = true;
    expect(actual).toEqual(expected);
  });
  it('overlapY detects when the boxes do not overlap in the Y axis', () => {
    const a = {y: 10, height: 50};
    const b = {y: 90, height: 50};
    const actual = overlapY(a, b);
    const expected = false;
    expect(actual).toEqual(expected);
  });
  it('overlapX detects when the boxes overlap in the X axis', () => {
    const a = {x: 10, width: 50};
    const b = {x: 40, width: 50};
    const actual = overlapX(a, b);
    const expected = true;
    expect(actual).toEqual(expected);
  });
  it('overlapX detects when the boxes are within SNAP_DISTANCE on the X axis', () => {
    const a = {x: 10, width: 50};
    const b = {x: 70, width: 50};
    const actual = overlapX(a, b);
    const expected = true;
    expect(actual).toEqual(expected);
  });
  it('overlapX detects when the boxes do not overlap in the X axis', () => {
    const a = {x: 10, width: 50};
    const b = {x: 90, width: 50};
    const actual = overlapX(a, b);
    const expected = false;
    expect(actual).toEqual(expected);
  });
});

describe('snap function', () => {
  it('does not snap if A and B are obviously far apart', () => {
    const a = {x: 10, y: 10, width: 100, height: 100};
    const b = {x: 200, y: 200, width: 100, height: 100};
    const actual = snap(a, b);
    const expected = {};
    expect(actual).toEqual(expected);
  });
  it('snaps the left of A to the right of B', () => {
    const a = {x: 120, y: 10, width: 100, height: 100};
    const b = {x: 10, y: 10, width: 100, height: 100};
    const actual = snap(a, b);
    const expected = {x: 110};
    expect(actual).toEqual(expected);
  });
  it('snaps the right of A to the left of B', () => {
    const a = {x: 10, y: 10, width: 100, height: 100};
    const b = {x: 120, y: 10, width: 100, height: 100};
    const actual = snap(a, b);
    const expected = {x: 20};
    expect(actual).toEqual(expected);
  });
  it('snaps the top of A to the bottom of B', () => {
    const a = {x: 10, y: 10, width: 100, height: 100};
    const b = {x: 10, y: 120, width: 100, height: 100};
    const actual = snap(a, b);
    const expected = {y: 20};
    expect(actual).toEqual(expected);
  });
  it('snaps the bottom of A to the top of B', () => {
    const a = {x: 10, y: 120, width: 100, height: 100};
    const b = {x: 10, y: 10, width: 100, height: 100};
    const actual = snap(a, b);
    const expected = {y: 110};
    expect(actual).toEqual(expected);
  });
  it('does not snap to the X axis if A is below B', () => {
    const a = {x: 10, y: 10, width: 100, height: 100};
    const b = {x: 110, y: 150, width: 100, height: 100};
    const actual = snap(a, b);
    const expected = {};
    expect(actual).toEqual(expected);
  });
  it('snaps in both axis if the corners are within SNAP_DISTANCE', () => {
    const a = {x: 10, y: 10, width: 100, height: 100};
    const b = {x: 120, y: 120, width: 100, height: 100};
    const actual = snap(a, b);
    const expected = {x: 20, y: 20};
    expect(actual).toEqual(expected);
  });
});
