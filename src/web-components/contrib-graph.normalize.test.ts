import { describe, it, expect } from 'vitest';
import { generateDays, dayValue, bucket, computeStats, indexByDate, buildWindow } from './contrib-graph.normalize';

describe('generateDays', () => {
  it('produces 53*7 = 371 deterministic days', () => {
    const a = generateDays();
    const b = generateDays();
    expect(a).toHaveLength(371);
    expect(a).toEqual(b); // deterministic for the same seed
  });

  it('each day has non-negative integer gh/gl counts', () => {
    for (const d of generateDays()) {
      expect(Number.isInteger(d.gh)).toBe(true);
      expect(Number.isInteger(d.gl)).toBe(true);
      expect(d.gh).toBeGreaterThanOrEqual(0);
      expect(d.gl).toBeGreaterThanOrEqual(0);
    }
  });

  it('different seeds give different data', () => {
    expect(generateDays(1)).not.toEqual(generateDays(2));
  });
});

describe('dayValue', () => {
  const day = { gh: 3, gl: 4 };
  it('sums for "all"', () => expect(dayValue(day, 'all')).toBe(7));
  it('uses gh for "gh"', () => expect(dayValue(day, 'gh')).toBe(3));
  it('uses gl for "gl"', () => expect(dayValue(day, 'gl')).toBe(4));
});

describe('bucket', () => {
  it('maps counts to levels 0..4', () => {
    expect(bucket(0)).toBe(0);
    expect(bucket(1)).toBe(1);
    expect(bucket(2)).toBe(1);
    expect(bucket(3)).toBe(2);
    expect(bucket(5)).toBe(2);
    expect(bucket(6)).toBe(3);
    expect(bucket(9)).toBe(3);
    expect(bucket(10)).toBe(4);
    expect(bucket(99)).toBe(4);
  });
});

describe('computeStats', () => {
  it('totals, longest/current streak, and busiest day', () => {
    const days = [
      { gh: 1, gl: 0 }, // 1
      { gh: 0, gl: 0 }, // 0  -> breaks streak
      { gh: 2, gl: 3 }, // 5
      { gh: 1, gl: 0 }, // 1  -> current streak runs to end = 2
    ];
    const s = computeStats(days, 'all');
    expect(s.total).toBe(7);
    expect(s.longest).toBe(2);
    expect(s.current).toBe(2);
    expect(s.best).toBe(5);
  });

  it('current streak is 0 when the last day is empty', () => {
    const days = [{ gh: 2, gl: 0 }, { gh: 0, gl: 0 }];
    expect(computeStats(days, 'all').current).toBe(0);
  });
});

describe('indexByDate', () => {
  it('maps github/gitlab to gh/gl keyed by date', () => {
    const idx = indexByDate([
      { date: '2026-01-04', github: 0, gitlab: 2 },
      { date: '2026-01-14', github: 8, gitlab: 21 },
    ]);
    expect(idx['2026-01-04']).toEqual({ gh: 0, gl: 2 });
    expect(idx['2026-01-14']).toEqual({ gh: 8, gl: 21 });
  });
  it('treats missing counts as 0 and ignores entries without a date', () => {
    const idx = indexByDate([{ date: '2026-02-01' } as any, { github: 5 } as any]);
    expect(idx['2026-02-01']).toEqual({ gh: 0, gl: 0 });
    expect(Object.keys(idx)).toEqual(['2026-02-01']);
  });
});

describe('buildWindow', () => {
  it('returns weeks*7 cells in column-major order', () => {
    const cells = buildWindow({}, '2026-06-14', 53);
    expect(cells).toHaveLength(53 * 7);
    expect(cells.every((c) => c.gh === 0 && c.gl === 0)).toBe(true);
  });

  it('places a date in the correct cell and zero-fills the rest', () => {
    // 2026-06-14 is a Sunday → the last column is that week; row 0 = Sunday.
    const cells = buildWindow(indexByDate([{ date: '2026-06-14', github: 3, gitlab: 4 }]), '2026-06-14', 53);
    const lastColRow0 = cells[(53 - 1) * 7 + 0];
    expect(lastColRow0).toEqual({ gh: 3, gl: 4 });
    // exactly one populated cell
    expect(cells.filter((c) => c.gh || c.gl)).toHaveLength(1);
  });

  it('spans roughly a year back from today', () => {
    // a date ~52 weeks before today should land in the first column
    const cells = buildWindow(indexByDate([{ date: '2025-06-15', github: 1, gitlab: 0 }]), '2026-06-14', 53);
    const firstColRow0 = cells[0]; // 2025-06-15 is a Sunday
    expect(firstColRow0).toEqual({ gh: 1, gl: 0 });
  });
});
