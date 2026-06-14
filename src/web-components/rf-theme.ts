export type Theme = 'dark' | 'light';

/** Stored theme always wins; otherwise follow system (prefersDark). */
export function resolveInitialTheme(stored: string | null, prefersDark: boolean): Theme {
  if (stored === 'dark' || stored === 'light') return stored;
  return prefersDark ? 'dark' : 'light';
}

export function nextTheme(current: Theme): Theme {
  return current === 'dark' ? 'light' : 'dark';
}

export const THEME_KEY = 'rf-theme';
