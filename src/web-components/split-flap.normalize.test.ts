import { resolveCharset, normalize, SF_CHARSETS } from './split-flap.normalize';

test('named charsets resolve', () => {
  expect(resolveCharset('num')).toBe(SF_CHARSETS.num);
  expect(resolveCharset('alpha')).toBe(SF_CHARSETS.alpha);
  expect(resolveCharset('XYZ')).toBe('XYZ'); // literal passthrough
});

test('normalize uppercases, maps unknowns to blank, and pads', () => {
  const cs = SF_CHARSETS.alpha; // index 0 is a space (blank)
  expect(normalize('abc', 3, 'left', cs)).toBe('ABC');
  expect(normalize('AB', 4, 'right', cs)).toBe('  AB');
  expect(normalize('AB', 4, 'left', cs)).toBe('AB  ');
  expect(normalize('AB', 4, 'center', cs)).toBe(' AB ');
  expect(normalize('AB😀', 3, 'left', cs)).toBe('AB '); // unknown → blank
  expect(normalize('TOOLONG', 3, 'left', cs)).toBe('TOO'); // truncates
});
