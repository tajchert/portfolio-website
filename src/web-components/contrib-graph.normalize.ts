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

/**
 * `todayIndex` marks the cell for "today". A rolling window ends with the
 * current week, whose cells after today are future/zero — counting the current
 * streak from the array end would always hit those and report 0. When
 * `todayIndex` is given, the current streak counts back from there, with a
 * grace day (an as-yet-empty *today* doesn't reset the streak). Default (-1)
 * counts strictly from the last cell (placeholder data has no future cells).
 */
export function computeStats(days: Day[], src: Source, todayIndex = -1): Stats {
  const total = days.reduce((a, day) => a + dayValue(day, src), 0);
  let longest = 0, run = 0;
  for (const day of days) {
    if (dayValue(day, src) > 0) { run++; longest = Math.max(longest, run); }
    else run = 0;
  }
  let start = todayIndex >= 0 ? Math.min(todayIndex, days.length - 1) : days.length - 1;
  if (todayIndex >= 0 && start >= 0 && dayValue(days[start], src) === 0) start--; // grace: today not over yet
  let current = 0;
  for (let i = start; i >= 0; i--) {
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

/* ── Real data: map a contribution API ({days:[{date,github,gitlab}]}) into the
   grid. Works with one or more years concatenated. ────────────────────────── */

export interface RawDay { date: string; github?: number; gitlab?: number; }

/** Index raw API days by ISO date (YYYY-MM-DD). Later entries win on collision. */
export function indexByDate(days: RawDay[]): Record<string, Day> {
  const out: Record<string, Day> = {};
  for (const d of days) {
    if (d && d.date) out[d.date] = { gh: d.github || 0, gl: d.gitlab || 0 };
  }
  return out;
}

/**
 * Build a column-major, Sunday-first window of `weeks` columns (7 rows each)
 * ending in the week that contains `todayISO`. Missing/out-of-range dates are
 * zero. Index order is `col*7 + row`, matching the CSS grid (grid-auto-flow:
 * column, 7 rows) so the rightmost column is the current week.
 */
export function buildWindow(byDate: Record<string, Day>, todayISO: string, weeks = 53): Day[] {
  const today = new Date(todayISO + 'T00:00:00Z');
  const sunday = new Date(today);
  sunday.setUTCDate(today.getUTCDate() - today.getUTCDay()); // back to Sunday (0=Sun)
  const start = new Date(sunday);
  start.setUTCDate(sunday.getUTCDate() - (weeks - 1) * 7);
  const iso = (dt: Date) => dt.toISOString().slice(0, 10);
  const out: Day[] = [];
  for (let col = 0; col < weeks; col++) {
    for (let row = 0; row < 7; row++) {
      const dt = new Date(start);
      dt.setUTCDate(start.getUTCDate() + col * 7 + row);
      out.push(byDate[iso(dt)] || { gh: 0, gl: 0 });
    }
  }
  return out;
}
