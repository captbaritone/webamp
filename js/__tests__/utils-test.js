jest.unmock('../utils');

import {
  getTimeObj,
  getTimeStr,
  getBalanceText,
  getVolumeText,
  getPositionText,
  getMediaText,
  getDoubleSizeModeText,
  wrapForMarquee
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
