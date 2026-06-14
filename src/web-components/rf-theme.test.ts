import { resolveInitialTheme, nextTheme } from './rf-theme';

test('stored theme wins over system preference', () => {
  expect(resolveInitialTheme('light', true)).toBe('light');
  expect(resolveInitialTheme('dark', false)).toBe('dark');
});

test('falls back to system preference when nothing stored', () => {
  expect(resolveInitialTheme(null, true)).toBe('dark');
  expect(resolveInitialTheme(null, false)).toBe('light');
});

test('nextTheme flips', () => {
  expect(nextTheme('dark')).toBe('light');
  expect(nextTheme('light')).toBe('dark');
});
