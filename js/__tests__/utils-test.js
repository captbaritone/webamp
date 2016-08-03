jest.unmock('../utils');

import {
  getTimeObj,
  getTimeStr,
  clamp
} from '../utils';

describe('getTimeObj', () => {
  it('expresses seconds as an object', () => {
    const actual = getTimeObj(1234);
    const expected = {
      minutesFirstDigit: 2,
      minutesSecondDigit: 0,
      secondsFirstDigit: 3,
      secondsSecondDigit: 4
    };
    expect(actual).toEqual(expected);
  });
});

describe('getTimeStr', () => {
  it('expresses seconds as string', () => {
    const actual = getTimeStr(1234);
    const expected = '20:34';
    expect(actual).toEqual(expected);
  });
  it('pads with zeros', () => {
    const actual = getTimeStr(5);
    const expected = '00:05';
    expect(actual).toEqual(expected);
  });
  it('truncates extra minutes', () => {
    const actual = getTimeStr(540000);
    const expected = '9000:00';
    expect(actual).toEqual(expected);
  });
});

describe('clamp', () => {
  it('respects the max value', () => {
    const actual = clamp(101, 0, 100);
    const expected = 100;
    expect(actual).toEqual(expected);
  });
  it('respects the min value', () => {
    const actual = clamp(0, 1, 100);
    const expected = 1;
    expect(actual).toEqual(expected);
  });
  it('respects the given value if in range', () => {
    const actual = clamp(50, 0, 100);
    const expected = 50;
    expect(actual).toEqual(expected);
  });
});
