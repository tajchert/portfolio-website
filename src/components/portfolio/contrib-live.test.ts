import { rollDigits, bumpField, todayCellIndex, bucket } from './contrib-live';

test('rollDigits marks only the digits that change, right-aligned', () => {
  expect(rollDigits(1239, 1240)).toEqual([
    { from: '1', to: '1' },
    { from: '2', to: '2' },
    { from: '3', to: '4' },
    { from: '9', to: '0' },
  ]);
  expect(rollDigits(41, 42)).toEqual([
    { from: '4', to: '4' },
    { from: '1', to: '2' },
  ]);
});

test('rollDigits grows a new leading digit from blank', () => {
  expect(rollDigits(999, 1000)).toEqual([
    { from: '', to: '1' },
    { from: '9', to: '0' },
    { from: '9', to: '0' },
    { from: '9', to: '0' },
  ]);
  expect(rollDigits(0, 1)).toEqual([{ from: '0', to: '1' }]);
});

test('bumpField adds to GitLab only when that source is shown', () => {
  expect(bumpField('all')).toBe('gh');
  expect(bumpField('gh')).toBe('gh');
  expect(bumpField('gl')).toBe('gl');
});

test("todayCellIndex points at today's cell in live mode, last cell otherwise", () => {
  // 53 weeks × 7 days; last column is the current week, rows are Sun..Sat.
  expect(todayCellIndex(true, 0, 371)).toBe(364);
  expect(todayCellIndex(true, 6, 371)).toBe(370);
  expect(todayCellIndex(true, 3, 371)).toBe(367);
  expect(todayCellIndex(false, 3, 371)).toBe(370);
});

test('bucket mirrors the vendored intensity thresholds', () => {
  expect([0, 1, 2, 3, 5, 6, 9, 10, 40].map(bucket)).toEqual([0, 1, 1, 2, 2, 3, 3, 4, 4]);
});
