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

describe('getBalanceText', () => {
  it('treats negative numbers as left', () => {
    const actual = getBalanceText(-25);
    const expected = 'Balance: 25% Left';
    expect(actual).toEqual(expected);
  });
  it('treats positive numbers as right', () => {
    const actual = getBalanceText(25);
    const expected = 'Balance: 25% Right';
    expect(actual).toEqual(expected);
  });
  it('has a special case for center', () => {
    const actual = getBalanceText(0);
    const expected = 'Balance: Center';
    expect(actual).toEqual(expected);
  });
});

describe('getVolumeText', () => {
  it('expresses volume as percent', () => {
    const actual = getVolumeText(50);
    const expected = 'Volume: 50%';
    expect(actual).toEqual(expected);
  });
});

describe('getPositionText', () => {
  it('formats a position', () => {
    const duration = 86;
    const seekToPercent = 85;
    const actual = getPositionText(duration, seekToPercent);
    const expected = 'Seek to: 01:13/01:26 (85%)';
    expect(actual).toEqual(expected);
  });
});

describe('getMediaText', () => {
  it('formats a name and duration', () => {
    const name = 'My Great Song';
    const duration = 86;
    const actual = getMediaText(name, duration);
    const expected = 'My Great Song (01:26)  ***  ';
    expect(actual).toEqual(expected);
  });
});

describe('wrapForMarquee', () => {
  const long = 'This is a long string. Longer than 30 characters!';
  it('truncates to 30 characters', () => {
    const actual = wrapForMarquee(long, 0);
    const expected = 'This is a long string. Longer ';
    expect(actual).toEqual(expected);
  });
  it('offsets by the number of steps', () => {
    const actual = wrapForMarquee(long, 8);
    const expected = 'a long string. Longer than 30 ';
    expect(actual).toEqual(expected);
  });
  it('wraps around when step > text length', () => {
    const actual = wrapForMarquee(long, 51);
    const expected = 'his is a long string. Longer t';
    expect(actual).toEqual(expected);
  });
  it('wraps text when it gets to the end', () => {
    const actual = wrapForMarquee(long, 30);
    const expected = 'than 30 characters! This is a ';
    expect(actual).toEqual(expected);
  });
  it('does not step through short strings', () => {
    const actual = wrapForMarquee('Short string', 30);
    const expected = 'Short string';
    expect(actual).toEqual(expected);
  });
});

describe('getDoubleSizeModeText', () => {
  it('prompts to enable when disabled', () => {
    const actual = getDoubleSizeModeText(true);
    const expected = 'Disable doublesize mode';
    expect(actual).toEqual(expected);
  });
  it('prompts to disable when enabled', () => {
    const actual = getDoubleSizeModeText(false);
    const expected = 'Enable doublesize mode';
    expect(actual).toEqual(expected);
  });
});
