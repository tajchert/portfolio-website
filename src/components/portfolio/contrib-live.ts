// Pure helpers for the portfolio's "live" +1 tick on the contribution graph.

export type Source = 'all' | 'gh' | 'gl';
export interface DigitSlot { from: string; to: string }

/** Right-aligned digit pairs for an odometer roll; a new leading digit rolls in from ''. */
export function rollDigits(from: number, to: number): DigitSlot[] {
  const a = String(from), b = String(to);
  const len = Math.max(a.length, b.length);
  const pa = a.padStart(len, ' '), pb = b.padStart(len, ' ');
  return Array.from({ length: len }, (_, i) => ({ from: pa[i].trim(), to: pb[i].trim() }));
}

/** Which source gets the +1 so the visible total actually moves. */
export const bumpField = (src: Source): 'gh' | 'gl' => (src === 'gl' ? 'gl' : 'gh');

/** Today's cell in the 53-week window (rows Sun..Sat); placeholder data has no "today". */
export function todayCellIndex(live: boolean, utcDay: number, length: number): number {
  return live ? Math.min((53 - 1) * 7 + utcDay, length - 1) : length - 1;
}

// Mirrors contrib-graph.js (vendored) so a bumped cell can be recolored in place.
export const bucket = (c: number) => (!c ? 0 : c <= 2 ? 1 : c <= 5 ? 2 : c <= 9 ? 3 : 4);
export const CONTRIB_BG = ['#161616', 'rgba(244,244,242,.24)', 'rgba(244,244,242,.46)', 'rgba(244,244,242,.74)', '#ff5a1e'];
export const CONTRIB_GLOW = ['none', 'none', 'none', '0 0 4px rgba(244,244,242,.4)', '0 0 7px rgba(255,90,30,.75)'];
