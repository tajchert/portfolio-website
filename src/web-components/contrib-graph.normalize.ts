export interface Day { gh: number; gl: number; }
export type Source = 'all' | 'gh' | 'gl';

export interface Stats {
  total: number;
  longest: number;
  current: number;
  best: number;
}

/** Deterministic placeholder contribution data — ported from the design mock. */
export function generateDays(seed = 20260613): Day[] {
  let s = seed >>> 0;
  const r = () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
  const out: Day[] = [];
  for (let w = 0; w < 53; w++) {
    for (let d = 0; d < 7; d++) {
      const wk = d >= 1 && d <= 5;
      const base = wk ? 1 : 0.45;
      let gh = Math.floor(Math.pow(r(), 2.1) * 11 * base);
      let gl = Math.floor(Math.pow(r(), 2.4) * 7 * base);
      if (r() > 0.93) gh += 5 + Math.floor(r() * 9);
      if (r() > 0.965) gl += 4 + Math.floor(r() * 7);
      if (r() > 0.88 && !wk) { gh = 0; gl = 0; }
      out.push({ gh, gl });
    }
  }
  return out;
}

export function dayValue(day: Day, src: Source): number {
  return src === 'gh' ? day.gh : src === 'gl' ? day.gl : day.gh + day.gl;
}

/** Contribution count → intensity level 0..4. */
export function bucket(c: number): number {
  return !c ? 0 : c <= 2 ? 1 : c <= 5 ? 2 : c <= 9 ? 3 : 4;
}

export function computeStats(days: Day[], src: Source): Stats {
  const total = days.reduce((a, day) => a + dayValue(day, src), 0);
  let longest = 0, run = 0;
  for (const day of days) {
    if (dayValue(day, src) > 0) { run++; longest = Math.max(longest, run); }
    else run = 0;
  }
  let current = 0;
  for (let i = days.length - 1; i >= 0; i--) {
    if (dayValue(days[i], src) > 0) current++;
    else break;
  }
  let best = 0;
  for (const day of days) best = Math.max(best, dayValue(day, src));
  return { total, longest, current, best };
}

/** Cell background ramp (level 0..4) and matching glow — matches the design. */
export const CONTRIB_BG = ['#161616', 'rgba(244,244,242,.24)', 'rgba(244,244,242,.46)', 'rgba(244,244,242,.74)', '#ff5a1e'];
export const CONTRIB_GLOW = ['none', 'none', 'none', '0 0 4px rgba(244,244,242,.4)', '0 0 7px rgba(255,90,30,.75)'];
