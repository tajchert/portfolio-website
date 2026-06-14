# Portfolio Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a static Astro portfolio page for Michał Tajchert in the TE × Nothing retro-futurism language, pixel-matching `docs/reference/Portfolio.dc.html` (hero variant `terminal`), deployable to Cloudflare Pages with zero build-time auth.

**Architecture:** Astro `output: 'static'`. The TE × Nothing design system is vendored (copied) into `src/styles`, `src/components`, `src/web-components`. Page sections live in `src/components/portfolio/` and consume DS components. The only client JS is two self-registering vanilla web components: the existing `split-flap` and a new `contrib-graph` (the activity heatmap), which is first built and unit-tested in the design system repo, then vendored in.

**Tech Stack:** Astro 4, vanilla Web Components, TypeScript (strict), Vitest, CSS custom-property tokens.

---

## Reference paths

- Design source (already in this repo): `docs/reference/Portfolio.dc.html`
- Design system clone (already on disk, used as the copy source and as the repo where the new component is committed): `/tmp/rfwds-clone` (remote `git@gitlab.com:mtajchert/retrofuturism-web-design-system.git`)

If `/tmp/rfwds-clone` is missing, recreate it:
```bash
cd /tmp && git clone git@gitlab.com:mtajchert/retrofuturism-web-design-system.git rfwds-clone
```

---

## File Structure

```
porfolio-page/
  package.json                         # Task 1
  astro.config.mjs                     # Task 1
  tsconfig.json                        # Task 1
  vitest.config.ts                     # Task 1
  .gitignore                           # Task 1
  src/
    env.d.ts                           # Task 1
    styles/{tokens,themes,keyframes,base}.css   # Task 2 (vendored)
    styles/portfolio.css               # Task 2 (new: hover utils + cursor-blink)
    web-components/*.js, *.ts          # Task 2 (vendored) + Task 6 (contrib-graph)
    components/*.astro                 # Task 2 (vendored DS) + Task 6 (ContribGraph.astro)
    layouts/Base.astro                 # Task 7
    components/portfolio/
      Tag.astro                        # Task 8
      StatusBar.astro                  # Task 9
      Hero.astro                       # Task 10
      RoleFlap.astro                   # Task 11
      About.astro                      # Task 12
      Projects.astro                   # Task 13
      Experience.astro                 # Task 14
      Activity.astro                   # Task 15
      Talks.astro                      # Task 16
      Connect.astro                    # Task 17
    pages/index.astro                  # Task 18
  README.md                            # Task 19
```

The new design-system component is created in `/tmp/rfwds-clone` in Tasks 3–5, pushed to a branch, then copied into this repo in Task 6.

---

## Task 1: Scaffold the Astro project

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`, `vitest.config.ts`, `.gitignore`, `src/env.d.ts`

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "portfolio-page",
  "type": "module",
  "version": "0.1.0",
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "test": "vitest run"
  },
  "dependencies": {
    "astro": "^4.15.0"
  },
  "devDependencies": {
    "typescript": "^5.5.0",
    "vitest": "^2.0.0"
  }
}
```

- [ ] **Step 2: Create `astro.config.mjs`**

```js
import { defineConfig } from 'astro/config';

// Static site for Cloudflare Pages. Output to dist/.
export default defineConfig({
  output: 'static',
  site: 'https://mtajchert.pages.dev',
});
```

- [ ] **Step 3: Create `tsconfig.json`**

```json
{
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": {
    "types": ["vitest/globals"]
  }
}
```

- [ ] **Step 4: Create `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config';
export default defineConfig({
  test: { globals: true, environment: 'node' },
});
```

- [ ] **Step 5: Create `.gitignore`**

```
node_modules/
dist/
.astro/
.DS_Store
```

- [ ] **Step 6: Create `src/env.d.ts`**

```ts
/// <reference path="../.astro/types.d.ts" />
```

- [ ] **Step 7: Install dependencies**

Run: `npm install`
Expected: completes, creates `node_modules/` and `package-lock.json`.

- [ ] **Step 8: Commit**

```bash
git add package.json astro.config.mjs tsconfig.json vitest.config.ts .gitignore src/env.d.ts package-lock.json
git commit -m "Scaffold Astro project for portfolio page"
```

---

## Task 2: Vendor the design system + add portfolio CSS

**Files:**
- Create (by copy): `src/styles/{tokens,themes,keyframes,base}.css`, `src/web-components/*`, `src/components/*.astro`, `src/components/primitives/*.astro`
- Create: `src/styles/portfolio.css`

- [ ] **Step 1: Copy the portable design system in**

Run:
```bash
mkdir -p src/styles src/web-components src/components/primitives
cp /tmp/rfwds-clone/src/styles/tokens.css   src/styles/
cp /tmp/rfwds-clone/src/styles/themes.css   src/styles/
cp /tmp/rfwds-clone/src/styles/keyframes.css src/styles/
cp /tmp/rfwds-clone/src/styles/base.css     src/styles/
cp /tmp/rfwds-clone/src/web-components/*.js  src/web-components/
cp /tmp/rfwds-clone/src/web-components/*.ts  src/web-components/
cp /tmp/rfwds-clone/src/components/*.astro   src/components/
cp /tmp/rfwds-clone/src/components/primitives/*.astro src/components/primitives/
```
Expected: files present. Verify with `ls src/components` (should include `SplitFlap.astro`, `Glyph.astro`, `Chip.astro`, etc.) and `ls src/web-components` (should include `split-flap.js`).

Note: the DS `sections/` showcase components are intentionally NOT copied — they are the DS's own showcase, not portable.

- [ ] **Step 2: Create `src/styles/portfolio.css`**

This holds the hover utilities (the design prototype used a non-standard `style-hover` attribute that must become real CSS) and the one keyframe the DS does not ship (`cursor-blink`). `glyph-pulse-soft` and `rec-blink` already exist in the vendored `keyframes.css`.

```css
/* Portfolio-page utilities. The page is dark-locked; values match the design. */

@keyframes cursor-blink { 0%, 49% { opacity: 1; } 50%, 100% { opacity: 0; } }

/* hover translations from the prototype's style-hover attribute */
.pf-link-accent { transition: color .15s ease; }
.pf-link-accent:hover { color: var(--rf-accent); }

.pf-card-accent { transition: border-color .15s ease; }
.pf-card-accent:hover { border-color: var(--rf-accent); }

.pf-card-soft { transition: border-color .15s ease; }
.pf-card-soft:hover { border-color: #3a3a3a; }
```

- [ ] **Step 3: Commit**

```bash
git add src/styles src/web-components src/components
git commit -m "Vendor TE x Nothing design system + portfolio CSS utilities"
```

---

## Task 3: [DS repo] ContribGraph logic module + tests (TDD)

Work in `/tmp/rfwds-clone`. Create a feature branch first.

**Files (in `/tmp/rfwds-clone`):**
- Create: `src/web-components/contrib-graph.normalize.ts`
- Test: `src/web-components/contrib-graph.normalize.test.ts`

- [ ] **Step 1: Create the branch**

Run:
```bash
cd /tmp/rfwds-clone && git checkout -b feat/contrib-graph
```

- [ ] **Step 2: Write the failing test**

Create `/tmp/rfwds-clone/src/web-components/contrib-graph.normalize.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { generateDays, dayValue, bucket, computeStats } from './contrib-graph.normalize';

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
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `cd /tmp/rfwds-clone && npx vitest run src/web-components/contrib-graph.normalize.test.ts`
Expected: FAIL — cannot resolve `./contrib-graph.normalize` (module not found).

- [ ] **Step 4: Write the implementation**

Create `/tmp/rfwds-clone/src/web-components/contrib-graph.normalize.ts`. The generator is ported verbatim from the `Portfolio.dc.html` `DCLogic._gen()` so output matches the mock exactly (53 weeks × 7 days, LCG, weekday weighting, occasional spikes, occasional weekend gaps).

```ts
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
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `cd /tmp/rfwds-clone && npx vitest run src/web-components/contrib-graph.normalize.test.ts`
Expected: PASS — all assertions green.

- [ ] **Step 6: Commit (in the DS repo)**

```bash
cd /tmp/rfwds-clone
git add src/web-components/contrib-graph.normalize.ts src/web-components/contrib-graph.normalize.test.ts
git commit -m "feat(contrib-graph): tested contribution-data logic module"
```

---

## Task 4: [DS repo] `contrib-graph` web component

**Files (in `/tmp/rfwds-clone`):**
- Create: `src/web-components/contrib-graph.js`

The component renders to light DOM with inline styles (mirroring the prototype; no shadow encapsulation needed). It re-implements the same logic as `contrib-graph.normalize.ts` in plain JS (the DS's established pattern — see `split-flap.js`, which duplicates `SF_CHARSETS`). It renders the graph card, the ALL/GITHUB/GITLAB toggle, the live total, the legend, and the four stat tiles, and recomputes on toggle.

- [ ] **Step 1: Create `/tmp/rfwds-clone/src/web-components/contrib-graph.js`**

```js
/* ───────────────────────────────────────────────────────────────
   <contrib-graph> — GitHub/GitLab-style contribution heatmap for the
   TE × Nothing design language.

   • 53×7 dot-matrix grid, intensity ramp white→orange.
   • Source toggle: ALL / GITHUB / GITLAB. Recomputes cells + stats.
   • Live total readout + four stat tiles (total / longest / current / busiest).
   • Placeholder data is generated deterministically (seeded LCG) so the
     board is identical on every load; pass a real dataset later if wanted.

   Attributes
   ──────────
   seed     integer seed for the placeholder generator (default 20260613)
   source   initial source: "all" (default) | "gh" | "gl"
   ─────────────────────────────────────────────────────────────── */

const CONTRIB_BG = ['#161616', 'rgba(244,244,242,.24)', 'rgba(244,244,242,.46)', 'rgba(244,244,242,.74)', '#ff5a1e'];
const CONTRIB_GLOW = ['none', 'none', 'none', '0 0 4px rgba(244,244,242,.4)', '0 0 7px rgba(255,90,30,.75)'];

function generateDays(seed) {
  let s = seed >>> 0;
  const r = () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; };
  const out = [];
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
const dayValue = (day, src) => src === 'gh' ? day.gh : src === 'gl' ? day.gl : day.gh + day.gl;
const bucket = (c) => !c ? 0 : c <= 2 ? 1 : c <= 5 ? 2 : c <= 9 ? 3 : 4;

class ContribGraph extends HTMLElement {
  static get observedAttributes() { return ['seed', 'source']; }

  constructor() {
    super();
    this._days = [];
    this._src = 'all';
  }

  connectedCallback() {
    const seed = parseInt(this.getAttribute('seed') || '20260613', 10);
    this._days = generateDays(seed);
    const s = this.getAttribute('source');
    if (s === 'gh' || s === 'gl' || s === 'all') this._src = s;
    this._render();
  }

  _chipStyle(on) {
    const base = "font-family:'Space Mono',monospace;font-size:10px;letter-spacing:.14em;font-weight:700;border-radius:999px;padding:7px 15px;cursor:pointer;";
    return on
      ? base + 'border:1px solid #ff4d12;background:#ff4d12;color:#0b0b0b;'
      : base + 'border:1px solid #2a2a2a;background:#0d0d0d;color:#8a8a82;';
  }

  _stats() {
    const days = this._days, src = this._src;
    const total = days.reduce((a, d) => a + dayValue(d, src), 0);
    let longest = 0, run = 0;
    for (const d of days) { if (dayValue(d, src) > 0) { run++; longest = Math.max(longest, run); } else run = 0; }
    let current = 0;
    for (let i = days.length - 1; i >= 0; i--) { if (dayValue(days[i], src) > 0) current++; else break; }
    let best = 0;
    for (const d of days) best = Math.max(best, dayValue(d, src));
    return { total, longest, current, best };
  }

  _render() {
    const src = this._src;
    const st = this._stats();
    const cells = this._days.map((d) => {
      const lvl = bucket(dayValue(d, src));
      return `<div style="width:11px;height:11px;border-radius:2px;background:${CONTRIB_BG[lvl]};box-shadow:${CONTRIB_GLOW[lvl]};"></div>`;
    }).join('');

    const tile = (val, label, accent) =>
      `<div style="border:1px solid #1f1f1f;border-radius:12px;background:#0a0a0a;padding:16px;">
         <div style="font-family:'Doto',monospace;font-weight:700;font-size:30px;line-height:1;color:${accent ? '#ff5a1e' : '#f4f4f2'};">${val}</div>
         <div style="font-family:'Space Mono',monospace;font-size:9px;letter-spacing:.14em;color:${accent ? '#8a5a44' : '#7a7a72'};margin-top:8px;">${label}</div>
       </div>`;

    const legendSwatch = (bg, glow) =>
      `<span style="width:11px;height:11px;border-radius:2px;background:${bg};box-shadow:${glow || 'none'};"></span>`;

    this.innerHTML = `
      <div style="border:1px solid #1f1f1f;border-radius:14px;background:#0a0a0a;padding:clamp(16px,3vw,24px);">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap;margin-bottom:22px;">
          <div style="display:flex;gap:8px;">
            <button data-src="all" style="${this._chipStyle(src === 'all')}">ALL</button>
            <button data-src="gh" style="${this._chipStyle(src === 'gh')}">GITHUB</button>
            <button data-src="gl" style="${this._chipStyle(src === 'gl')}">GITLAB</button>
          </div>
          <div style="display:flex;align-items:baseline;gap:8px;">
            <span style="font-family:'Doto',monospace;font-weight:700;font-size:30px;line-height:1;color:#ff5a1e;text-shadow:0 0 12px rgba(255,90,30,.45);">${st.total}</span>
            <span style="font-family:'Space Mono',monospace;font-size:10px;letter-spacing:.14em;color:#7a7a72;">CONTRIBUTIONS</span>
          </div>
        </div>

        <div style="overflow-x:auto;padding-bottom:6px;">
          <div style="display:inline-flex;gap:8px;">
            <div style="display:grid;grid-template-rows:repeat(7,11px);gap:3px;font-family:'Space Mono',monospace;font-size:8px;color:#6c6c6c;align-items:center;">
              <span></span><span>MON</span><span></span><span>WED</span><span></span><span>FRI</span><span></span>
            </div>
            <div style="display:grid;grid-template-rows:repeat(7,11px);grid-auto-flow:column;grid-auto-columns:11px;gap:3px;">
              ${cells}
            </div>
          </div>
        </div>

        <div style="display:flex;align-items:center;gap:7px;margin-top:18px;font-family:'Space Mono',monospace;font-size:9px;letter-spacing:.1em;color:#6c6c6c;">
          <span>LESS</span>
          ${legendSwatch(CONTRIB_BG[0])}
          ${legendSwatch(CONTRIB_BG[1])}
          ${legendSwatch(CONTRIB_BG[2])}
          ${legendSwatch(CONTRIB_BG[3], CONTRIB_GLOW[3])}
          ${legendSwatch(CONTRIB_BG[4], '0 0 6px rgba(255,90,30,.6)')}
          <span>MORE</span>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px;margin-top:14px;">
        ${tile(st.total, 'TOTAL', false)}
        ${tile(st.longest, 'LONGEST STREAK', false)}
        ${tile(st.current, 'CURRENT STREAK', false)}
        ${tile(st.best, 'BUSIEST DAY', true)}
      </div>
    `;

    this.querySelectorAll('button[data-src]').forEach((b) => {
      b.addEventListener('click', () => {
        this._src = b.getAttribute('data-src');
        this._render();
      });
    });
  }
}

if (!customElements.get('contrib-graph')) {
  customElements.define('contrib-graph', ContribGraph);
}
```

- [ ] **Step 2: Commit (in the DS repo)**

```bash
cd /tmp/rfwds-clone
git add src/web-components/contrib-graph.js
git commit -m "feat(contrib-graph): interactive heatmap web component"
```

---

## Task 5: [DS repo] `ContribGraph.astro` wrapper + showcase + push

**Files (in `/tmp/rfwds-clone`):**
- Create: `src/components/ContribGraph.astro`
- Create: `src/components/sections/ContribGraphSection.astro`
- Modify: `src/pages/index.astro`
- Modify: `README.md` (component list)

- [ ] **Step 1: Create `/tmp/rfwds-clone/src/components/ContribGraph.astro`**

```astro
---
interface Props {
  seed?: number;
  source?: 'all' | 'gh' | 'gl';
  'data-preview'?: boolean;
}
const p = Astro.props;
---
<contrib-graph
  seed={p.seed}
  source={p.source}
  data-preview={p['data-preview'] ? '' : undefined}
></contrib-graph>
<script>
  import '../web-components/contrib-graph.js';
</script>
```

- [ ] **Step 2: Create `/tmp/rfwds-clone/src/components/sections/ContribGraphSection.astro`**

```astro
---
import SectionHeader from '../primitives/SectionHeader.astro';
import ContribGraph from '../ContribGraph.astro';
---
<div style="max-width:1300px;margin:86px auto 0;">
  <SectionHeader index="10" title="CONTRIBUTION GRAPH" jp="活動" desc="A dot-matrix contribution heatmap with a source toggle, live total and streak stats. Placeholder data is generated deterministically." />
  <ContribGraph />
</div>
```

- [ ] **Step 3: Wire into `/tmp/rfwds-clone/src/pages/index.astro`**

Add the import alongside the other section imports (after the `SplitFlapSection` import line):

```astro
import ContribGraphSection from '../components/sections/ContribGraphSection.astro';
```

Add the element at the end of the showcase, right after `<SplitFlapSection />`:

```astro
  <ContribGraphSection />
```

- [ ] **Step 4: Update the component list in `/tmp/rfwds-clone/README.md`**

Change the Components line to append `· ContribGraph`:

```
Glyph · GlyphBehaviour · Chip · Toggle · Stepper · Field · Button · Loader · DotIcon ·
DotAvatar · DotNumber · DotChart · StatReadout · SplitFlap · ContribGraph. See the showcase
(`src/pages/index.astro`) for every state and a live playground.
```

- [ ] **Step 5: Build and test the DS to verify integration**

Run:
```bash
cd /tmp/rfwds-clone && npm install && npm run build && npm test
```
Expected: build succeeds (writes `dist/`), all Vitest tests pass (including the new `contrib-graph.normalize.test.ts`).

- [ ] **Step 6: Commit and push the branch**

```bash
cd /tmp/rfwds-clone
git add src/components/ContribGraph.astro src/components/sections/ContribGraphSection.astro src/pages/index.astro README.md
git commit -m "feat(contrib-graph): astro wrapper + showcase section"
git push -u origin feat/contrib-graph
```
Expected: branch pushed. Report the branch URL to the user for review/merge (do not merge to main automatically).

---

## Task 6: Vendor `ContribGraph` into the portfolio

**Files:**
- Create (by copy): `src/web-components/contrib-graph.js`, `src/web-components/contrib-graph.normalize.ts`, `src/web-components/contrib-graph.normalize.test.ts`, `src/components/ContribGraph.astro`

- [ ] **Step 1: Copy the new component in**

Run (from the portfolio repo root):
```bash
cp /tmp/rfwds-clone/src/web-components/contrib-graph.js            src/web-components/
cp /tmp/rfwds-clone/src/web-components/contrib-graph.normalize.ts  src/web-components/
cp /tmp/rfwds-clone/src/web-components/contrib-graph.normalize.test.ts src/web-components/
cp /tmp/rfwds-clone/src/components/ContribGraph.astro              src/components/
```

- [ ] **Step 2: Verify the vendored test passes here**

Run: `npx vitest run src/web-components/contrib-graph.normalize.test.ts`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/web-components/contrib-graph.js src/web-components/contrib-graph.normalize.ts src/web-components/contrib-graph.normalize.test.ts src/components/ContribGraph.astro
git commit -m "Vendor ContribGraph component from design system"
```

---

## Task 7: `Base.astro` layout

**Files:**
- Create: `src/layouts/Base.astro`

- [ ] **Step 1: Create `src/layouts/Base.astro`**

Dark-locked layout. Imports the four DS stylesheets plus `portfolio.css`. No theme toggle. The dot-grid page background and base typography come from `base.css`; the design's page color `#0b0b0b` is set explicitly on `<html>` to match the mock exactly (DS `--rf-page` is pure `#000`).

```astro
---
import '../styles/tokens.css';
import '../styles/themes.css';
import '../styles/keyframes.css';
import '../styles/base.css';
import '../styles/portfolio.css';
interface Props { title?: string; description?: string; }
const {
  title = 'Michał Tajchert — CTO',
  description = 'Michał Tajchert — Chief Technology Officer. Mobile, platform & eCommerce engineering. Warsaw, PL.',
} = Astro.props;
---
<html lang="en" data-theme="dark" style="background:#0b0b0b;">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{title}</title>
    <meta name="description" content={description} />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:type" content="website" />
    <meta name="theme-color" content="#0b0b0b" />
  </head>
  <body style="background:#0b0b0b;">
    <slot />
  </body>
</html>
```

- [ ] **Step 2: Commit**

```bash
git add src/layouts/Base.astro
git commit -m "Add dark-locked Base layout"
```

---

## Task 8: `Tag.astro` pill helper

**Files:**
- Create: `src/components/portfolio/Tag.astro`

The design repeats two pill styles: skill/tech tags (bordered) and one accent tag (orange fill). This small helper keeps the section components DRY.

- [ ] **Step 1: Create `src/components/portfolio/Tag.astro`**

```astro
---
interface Props { accent?: boolean; size?: 'sm' | 'xs'; }
const { accent = false, size = 'sm' } = Astro.props;
const fs = size === 'xs' ? '9px' : '10px';
const pad = size === 'xs' ? '4px 10px' : '6px 13px';
const track = size === 'xs' ? '.1em' : '.14em';
const skin = accent
  ? 'color:#0b0b0b;background:#ff4d12;border:1px solid #ff4d12;font-weight:700;'
  : 'color:#cfcfca;border:1px solid #2a2a2a;';
---
<span style={`display:inline-block;font-family:var(--rf-font-mono);font-size:${fs};letter-spacing:${track};border-radius:999px;padding:${pad};${skin}`}><slot /></span>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/portfolio/Tag.astro
git commit -m "Add Tag pill helper"
```

---

## Task 9: `StatusBar.astro`

**Files:**
- Create: `src/components/portfolio/StatusBar.astro`

Translation of the sticky status bar (`Portfolio.dc.html` lines 33–56). LED strips reuse the DS `Glyph` component; nav hover uses the `.pf-link-accent` class.

- [ ] **Step 1: Create `src/components/portfolio/StatusBar.astro`**

```astro
---
import Glyph from '../Glyph.astro';
const nav = [
  { href: '#work', label: 'WORK' },
  { href: '#log', label: 'EXP' },
  { href: '#activity', label: 'ACTIVITY' },
  { href: '#talks', label: 'TALKS' },
  { href: '#connect', label: 'CONNECT' },
];
---
<div style="position:sticky;top:0;z-index:50;background:#0b0b0b;border-bottom:1px solid #1a1a1a;">
  <div style="max-width:1080px;margin:0 auto;padding:11px clamp(16px,4vw,40px);display:flex;align-items:center;justify-content:space-between;gap:16px;">
    <a href="#top" style="display:flex;align-items:center;gap:10px;">
      <span style="display:flex;align-items:center;gap:3px;">
        <Glyph shape="dot" w={6} h={6} />
        <Glyph shape="bar" w={24} h={6} />
        <Glyph shape="dot" w={6} h={6} accent />
      </span>
      <span style="font-family:var(--rf-font-mono);font-size:11px;font-weight:700;letter-spacing:.22em;color:#f4f4f2;">MT_OS</span>
    </a>
    <div style="display:flex;align-items:center;gap:clamp(12px,2.4vw,26px);font-family:var(--rf-font-mono);font-size:10.5px;letter-spacing:.18em;color:#7a7a72;">
      {nav.map((n) => <a href={n.href} class="pf-link-accent">{n.label}</a>)}
    </div>
    <div style="display:flex;align-items:center;gap:7px;font-family:var(--rf-font-mono);font-size:10px;letter-spacing:.14em;color:#7a7a72;">
      <Glyph shape="dot" w={7} h={7} accent pulse="rec" />
      <span>ONLINE</span>
    </div>
  </div>
</div>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/portfolio/StatusBar.astro
git commit -m "Add StatusBar section"
```

---

## Task 10: `Hero.astro` (terminal variant)

**Files:**
- Create: `src/components/portfolio/Hero.astro`

Translation of the hero (lines 60–86 identity + lines 88–110 terminal variant). Only the `terminal` variant is built. Skill chips use `Tag`; the eyebrow LED strip reuses `Glyph`.

- [ ] **Step 1: Create `src/components/portfolio/Hero.astro`**

```astro
---
import Glyph from '../Glyph.astro';
import Tag from './Tag.astro';
---
<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:clamp(28px,4vw,52px);align-items:center;margin-bottom:clamp(64px,9vw,104px);">

  <!-- identity -->
  <div>
    <div style="display:flex;align-items:center;gap:11px;margin-bottom:22px;">
      <span style="display:flex;align-items:center;gap:3px;">
        <Glyph shape="dot" w={6} h={6} pulse="soft" />
        <Glyph shape="bar" w={22} h={6} />
        <Glyph shape="bar" w={10} h={6} />
        <Glyph shape="dot" w={6} h={6} accent />
      </span>
      <span style="font-family:var(--rf-font-mono);font-size:10.5px;letter-spacing:.32em;text-transform:uppercase;color:#7a7a72;">portfolio · 自己紹介</span>
    </div>
    <h1 style="margin:0;font-family:var(--rf-font-display),'Space Mono',monospace;font-weight:600;font-size:clamp(46px,9.5vw,92px);line-height:.86;letter-spacing:.01em;color:#f4f4f2;text-transform:lowercase;">michał<br>tajchert</h1>
    <div style="margin-top:22px;display:flex;align-items:baseline;gap:12px;flex-wrap:wrap;">
      <span style="font-size:clamp(17px,2.4vw,21px);font-weight:500;letter-spacing:-.01em;color:#f4f4f2;">Chief Technology Officer</span>
      <span style="font-family:var(--rf-font-jp);font-size:13px;color:#6c6c6c;white-space:nowrap;flex-shrink:0;">最高技術責任者</span>
    </div>
    <div style="margin-top:8px;font-family:var(--rf-font-mono);font-size:12px;letter-spacing:.06em;color:#8a8a82;">@mtajchert &nbsp;·&nbsp; WARSAW, PL</div>
    <div style="margin-top:24px;display:flex;flex-wrap:wrap;gap:8px;">
      <Tag>MOBILE</Tag>
      <Tag>PLATFORM</Tag>
      <Tag>eCOMMERCE</Tag>
      <Tag accent>ANDROID</Tag>
    </div>
  </div>

  <!-- terminal -->
  <div style="border:1px solid #1f1f1f;border-radius:12px;background:#070707;overflow:hidden;box-shadow:0 24px 60px rgba(0,0,0,.55);">
    <div style="display:flex;align-items:center;gap:10px;padding:11px 14px;border-bottom:1px solid #1a1a1a;background:#0d0d0d;">
      <span style="display:flex;gap:6px;align-items:center;">
        <span style="width:9px;height:9px;border-radius:50%;background:#f4f4f2;"></span>
        <span style="width:9px;height:9px;border-radius:50%;background:#3a3a3a;"></span>
        <span style="width:9px;height:9px;border-radius:50%;background:#ff4d12;box-shadow:0 0 7px rgba(255,77,18,.7);"></span>
      </span>
      <span style="font-family:var(--rf-font-mono);font-size:10px;letter-spacing:.1em;color:#6c6c6c;margin-left:4px;">mtajchert — zsh — 96×24</span>
    </div>
    <div style="padding:18px 18px 20px;font-family:var(--rf-font-mono);font-size:13px;line-height:1.85;color:#cfcfca;">
      <div><span style="color:#ff4d12;">mtajchert@nothing</span><span style="color:#6c6c6c;">:~$</span> whoami</div>
      <div style="color:#f4f4f2;">&gt; michał tajchert</div>
      <div style="color:#7a7a72;">&gt; cto · ex-mobile lead · ex-banking</div>
      <div style="margin-top:6px;"><span style="color:#ff4d12;">mtajchert@nothing</span><span style="color:#6c6c6c;">:~$</span> uptime</div>
      <div style="color:#f4f4f2;">&gt; ~14y shipping mobile &amp; platform</div>
      <div style="margin-top:6px;"><span style="color:#ff4d12;">mtajchert@nothing</span><span style="color:#6c6c6c;">:~$</span> cat now.txt</div>
      <div style="color:#f4f4f2;">&gt; leading eng at an eCommerce co.</div>
      <div style="margin-top:6px;"><span style="color:#ff4d12;">mtajchert@nothing</span><span style="color:#6c6c6c;">:~$</span> <span style="display:inline-block;width:9px;height:16px;background:#ff4d12;vertical-align:-3px;animation:cursor-blink 1.1s steps(1) infinite;"></span></div>
    </div>
  </div>
</div>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/portfolio/Hero.astro
git commit -m "Add Hero section (terminal variant)"
```

---

## Task 11: `RoleFlap.astro`

**Files:**
- Create: `src/components/portfolio/RoleFlap.astro`

Translation of the role / split-flap panel (lines 151–165). Reuses the DS `SplitFlap` component and `Glyph`.

- [ ] **Step 1: Create `src/components/portfolio/RoleFlap.astro`**

```astro
---
import Glyph from '../Glyph.astro';
import SplitFlap from '../SplitFlap.astro';
---
<div style="margin-bottom:clamp(56px,8vw,96px);border:1px solid #1f1f1f;border-radius:16px;background:#070707;background-image:radial-gradient(rgba(255,255,255,.05) 1px,transparent 1.3px);background-size:9px 9px;padding:clamp(26px,4vw,40px);box-shadow:0 24px 60px rgba(0,0,0,.5);">
  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:clamp(20px,3vw,30px);flex-wrap:wrap;gap:12px;">
    <span style="font-family:var(--rf-font-mono);font-size:10px;letter-spacing:.26em;color:#7a7a72;">DEPENDING ON THE DAY · 肩書き</span>
    <span style="display:flex;align-items:center;gap:5px;">
      <Glyph shape="dot" w={6} h={6} pulse="soft" />
      <Glyph shape="bar" w={26} h={6} />
      <Glyph shape="dot" w={6} h={6} accent />
    </span>
  </div>
  <div style="text-align:center;overflow-x:auto;padding:4px 0;">
    <SplitFlap mode="cycle" values="BUILDER,ENGINEER,MANAGER,MENTOR" theme="dark" size={64} gap={6} interval={2400} align="center" />
  </div>
  <div style="margin-top:clamp(18px,3vw,26px);font-family:var(--rf-font-mono);font-size:10.5px;letter-spacing:.14em;color:#7a7a72;text-align:center;">hands on keys · shipping teams · growing people</div>
</div>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/portfolio/RoleFlap.astro
git commit -m "Add RoleFlap section with split-flap display"
```

---

## Task 12: `About.astro`

**Files:**
- Create: `src/components/portfolio/About.astro`

Translation of section 01 (lines 167–178).

- [ ] **Step 1: Create `src/components/portfolio/About.astro`**

```astro
<div style="margin-bottom:clamp(56px,8vw,96px);">
  <div style="display:flex;align-items:baseline;gap:14px;margin-bottom:8px;flex-wrap:wrap;">
    <span style="font-family:var(--rf-font-mono);font-size:12px;font-weight:700;letter-spacing:.28em;color:#f4f4f2;">01 / ABOUT</span>
    <span style="font-family:var(--rf-font-jp);font-size:13px;color:#6c6c6c;white-space:nowrap;flex-shrink:0;">概要</span>
  </div>
  <div style="height:1px;background:#1a1a1a;margin-bottom:28px;"></div>
  <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:clamp(24px,4vw,48px);">
    <p style="margin:0;font-size:clamp(18px,2.6vw,24px);line-height:1.5;letter-spacing:-.01em;color:#e6e6e1;text-wrap:pretty;">CTO in eCommerce, building the kind of mobile and platform engineering I always wanted to work on. Ex-mobile lead, six years in banking running teams, and before that an Android dev in startups and a software house.</p>
    <div style="font-size:15px;line-height:1.7;color:#9a9a92;text-wrap:pretty;">
      <p style="margin:0 0 14px;">[ placeholder — replace with your own words. ] I care about small, sharp tools, calm interfaces, and engineering orgs that ship without drama.</p>
      <p style="margin:0;">Off-hours I build indie apps and side projects, mostly on Android and the web. Below: the things I've made, where I've worked, and where I've talked about it.</p>
    </div>
  </div>
</div>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/portfolio/About.astro
git commit -m "Add About section"
```

---

## Task 13: `Projects.astro`

**Files:**
- Create: `src/components/portfolio/Projects.astro`

Translation of section 02 (lines 180–248): two featured cards + three secondary cards. Featured cards use `.pf-card-accent` hover; secondary use `.pf-card-soft`. Tech tags use `Tag` (`size="xs"`). Data is in frontmatter to keep the template DRY.

- [ ] **Step 1: Create `src/components/portfolio/Projects.astro`**

```astro
---
import Tag from './Tag.astro';

const featured = [
  {
    name: 'flux',
    desc: '[ placeholder ] A focus timer that turns your day into a dot-matrix. Offline-first, no accounts, no nonsense.',
    tags: ['KOTLIN', 'COMPOSE', 'ROOM'],
    stats: [{ v: '1.2k', l: '★' }, { v: '12k', l: 'installs' }],
  },
  {
    name: 'ndot-cli',
    desc: '[ placeholder ] A tiny CLI that renders any text as a Nothing-style dot-matrix glyph board in your terminal.',
    tags: ['RUST', 'CLI', 'OSS'],
    stats: [{ v: '840', l: '★' }, { v: 'v0.4', l: 'rev' }],
  },
];

const secondary = [
  { name: 'slot.fm', desc: '[ placeholder ] Split-flap web component & demo board.', meta: 'TS · WEB COMPONENT' },
  { name: 'paper.kt', desc: '[ placeholder ] Compose theme kit, mono & paper.', meta: 'KOTLIN · LIB' },
  { name: 'tx-log', desc: '[ placeholder ] Tiny self-hosted analytics, no cookies.', meta: 'GO · SELF-HOST' },
];
---
<div id="work" style="margin-bottom:clamp(56px,8vw,96px);scroll-margin-top:64px;">
  <div style="display:flex;align-items:baseline;gap:14px;margin-bottom:8px;flex-wrap:wrap;">
    <span style="font-family:var(--rf-font-mono);font-size:12px;font-weight:700;letter-spacing:.28em;color:#f4f4f2;">02 / PROJECTS</span>
    <span style="font-family:var(--rf-font-jp);font-size:13px;color:#6c6c6c;white-space:nowrap;flex-shrink:0;">制作物</span>
  </div>
  <div style="font-size:14px;color:#7a7a72;margin-bottom:24px;">Indie apps &amp; side projects. <span style="color:#ff8a5a;">★</span> = highlighted.</div>

  <!-- featured -->
  <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:16px;margin-bottom:16px;">
    {featured.map((p) => (
      <a href="#" class="pf-card-accent" style="border:1px solid #242424;border-radius:14px;background:#0d0d0d;padding:22px;display:block;position:relative;overflow:hidden;">
        <div style="position:absolute;top:0;right:0;width:120px;height:120px;background-image:radial-gradient(rgba(255,90,30,.18) 1px,transparent 1.4px);background-size:8px 8px;pointer-events:none;"></div>
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:18px;">
          <span style="font-family:var(--rf-font-mono);font-size:9px;letter-spacing:.2em;color:#0b0b0b;background:#ff4d12;border-radius:999px;padding:4px 10px;font-weight:700;">★ HIGHLIGHT</span>
          <span style="font-family:var(--rf-font-mono);font-size:10px;color:#6c6c6c;">↗</span>
        </div>
        <div style="font-family:var(--rf-font-display);font-weight:700;font-size:30px;line-height:1;color:#f4f4f2;margin-bottom:12px;">{p.name}</div>
        <p style="margin:0 0 18px;font-size:14px;line-height:1.6;color:#9a9a92;">{p.desc}</p>
        <div style="display:flex;flex-wrap:wrap;gap:7px;margin-bottom:16px;">
          {p.tags.map((t) => <Tag size="xs">{t}</Tag>)}
        </div>
        <div style="display:flex;gap:16px;font-family:var(--rf-font-mono);font-size:10px;letter-spacing:.06em;color:#7a7a72;">
          {p.stats.map((s) => (
            <span><span style="color:#f4f4f2;font-family:var(--rf-font-display);font-weight:700;font-size:13px;">{s.v}</span> {s.l}</span>
          ))}
        </div>
      </a>
    ))}
  </div>

  <!-- secondary -->
  <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px;">
    {secondary.map((p) => (
      <a href="#" class="pf-card-soft" style="border:1px solid #1f1f1f;border-radius:12px;background:#0a0a0a;padding:18px;display:block;">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;">
          <span style="width:8px;height:8px;border-radius:50%;background:#f4f4f2;box-shadow:0 0 7px rgba(255,255,255,.5);"></span>
          <span style="font-family:var(--rf-font-mono);font-size:10px;color:#6c6c6c;">↗</span>
        </div>
        <div style="font-family:var(--rf-font-display);font-weight:700;font-size:21px;color:#f4f4f2;margin-bottom:8px;">{p.name}</div>
        <p style="margin:0 0 12px;font-size:13px;line-height:1.55;color:#8a8a82;">{p.desc}</p>
        <div style="font-family:var(--rf-font-mono);font-size:9px;letter-spacing:.1em;color:#7a7a72;">{p.meta}</div>
      </a>
    ))}
  </div>
</div>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/portfolio/Projects.astro
git commit -m "Add Projects section"
```

---

## Task 14: `Experience.astro`

**Files:**
- Create: `src/components/portfolio/Experience.astro`

Translation of section 03 (lines 250–303): a timeline. The first entry's node is accent + "NOW" badge; the last entry has no connecting line below. Data in frontmatter.

- [ ] **Step 1: Create `src/components/portfolio/Experience.astro`**

```astro
---
const roles = [
  { title: 'Chief Technology Officer', badge: 'NOW', badgeAccent: true, meta: 'eCommerce Co. · 2023 — present · Warsaw', body: '[ placeholder ] Own the full technology org — mobile, platform, and infra. Set engineering direction, grow the team, ship the roadmap.', accentNode: true },
  { title: 'Mobile Lead', meta: 'eCommerce Co. · 2020 — 2023', body: '[ placeholder ] Led the mobile org across Android & iOS. Architecture, hiring, and delivery for the flagship shopping app.' },
  { title: 'Mobile Engineering Manager', badge: 'BANKING', meta: 'Bank · 2017 — 2020', body: '[ placeholder ] Managed mobile teams on a retail banking app — security, scale, and a regulated release process.' },
  { title: 'Senior Android Developer', badge: 'BANKING', meta: 'Bank · 2014 — 2017', body: '[ placeholder ] Built and shipped core features of the mobile banking app. Six years in the sector all told.' },
  { title: 'Android Developer', meta: 'Startups & software house · 2011 — 2014', body: '[ placeholder ] Where it started — Android apps for clients and early-stage products. Learned to ship.', dim: true },
];
---
<div id="log" style="margin-bottom:clamp(56px,8vw,96px);scroll-margin-top:64px;">
  <div style="display:flex;align-items:baseline;gap:14px;margin-bottom:8px;flex-wrap:wrap;">
    <span style="font-family:var(--rf-font-mono);font-size:12px;font-weight:700;letter-spacing:.28em;color:#f4f4f2;">03 / EXPERIENCE</span>
    <span style="font-family:var(--rf-font-jp);font-size:13px;color:#6c6c6c;white-space:nowrap;flex-shrink:0;">経歴</span>
  </div>
  <div style="height:1px;background:#1a1a1a;margin-bottom:28px;"></div>

  <div style="display:flex;flex-direction:column;">
    {roles.map((r, i) => {
      const last = i === roles.length - 1;
      const nodeColor = r.accentNode ? '#ff4d12' : r.dim ? '#3a3a3a' : '#f4f4f2';
      const nodeGlow = r.accentNode ? '0 0 10px rgba(255,77,18,.8)' : r.dim ? 'none' : '0 0 8px rgba(255,255,255,.4)';
      return (
        <div style={`display:grid;grid-template-columns:auto 1fr;gap:clamp(14px,3vw,28px);${last ? '' : 'padding-bottom:28px;'}`}>
          <div style="display:flex;flex-direction:column;align-items:center;">
            <span style={`width:11px;height:11px;border-radius:50%;background:${nodeColor};box-shadow:${nodeGlow};`}></span>
            {!last && <span style="flex:1;width:1px;background:#222;margin-top:6px;"></span>}
          </div>
          <div>
            <div style="display:flex;align-items:baseline;gap:10px;flex-wrap:wrap;margin-bottom:5px;">
              <span style="font-size:clamp(17px,2.4vw,20px);font-weight:600;color:#f4f4f2;">{r.title}</span>
              {r.badge && (
                <span style={`font-family:var(--rf-font-mono);font-size:10px;letter-spacing:.1em;border-radius:999px;padding:2px 9px;${r.badgeAccent ? 'color:#ff8a5a;border:1px solid #5a2a18;' : 'color:#cfcfca;border:1px solid #2a2a2a;'}`}>{r.badge}</span>
              )}
            </div>
            <div style="font-family:var(--rf-font-mono);font-size:12px;letter-spacing:.04em;color:#9a9a92;margin-bottom:10px;">{r.meta}</div>
            <p style="margin:0;font-size:14px;line-height:1.6;color:#8a8a82;max-width:560px;text-wrap:pretty;">{r.body}</p>
          </div>
        </div>
      );
    })}
  </div>
</div>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/portfolio/Experience.astro
git commit -m "Add Experience timeline section"
```

---

## Task 15: `Activity.astro`

**Files:**
- Create: `src/components/portfolio/Activity.astro`

Translation of section 04 (lines 305–359). The section header + description live here; the interactive graph, toggle, total, and stat tiles are the vendored `ContribGraph` component.

- [ ] **Step 1: Create `src/components/portfolio/Activity.astro`**

```astro
---
import ContribGraph from '../ContribGraph.astro';
---
<div id="activity" style="margin-bottom:clamp(56px,8vw,96px);scroll-margin-top:64px;">
  <div style="display:flex;align-items:baseline;gap:14px;margin-bottom:8px;flex-wrap:wrap;">
    <span style="font-family:var(--rf-font-mono);font-size:12px;font-weight:700;letter-spacing:.28em;color:#f4f4f2;">04 / ACTIVITY</span>
    <span style="font-family:var(--rf-font-jp);font-size:13px;color:#6c6c6c;white-space:nowrap;flex-shrink:0;">活動</span>
  </div>
  <div style="font-size:14px;color:#7a7a72;margin-bottom:22px;">Contribution density, last 12 months · GitHub + GitLab.</div>
  <ContribGraph />
</div>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/portfolio/Activity.astro
git commit -m "Add Activity section using ContribGraph"
```

---

## Task 16: `Talks.astro`

**Files:**
- Create: `src/components/portfolio/Talks.astro`

Translation of section 05 (lines 361–388). The most recent talk's number is accent.

- [ ] **Step 1: Create `src/components/portfolio/Talks.astro`**

```astro
---
const talks = [
  { n: '26', accent: true, title: '[ placeholder ] Building calm mobile platforms', meta: 'Mobile Warsaw · keynote' },
  { n: '25', title: '[ placeholder ] Scaling Android teams in fintech', meta: 'DroidCon · talk' },
  { n: '24', title: '[ placeholder ] From IC to CTO: what changed', meta: 'Code Europe · panel' },
  { n: '23', title: '[ placeholder ] Offline-first apps that feel instant', meta: 'GDG Warsaw · meetup' },
];
---
<div id="talks" style="margin-bottom:clamp(56px,8vw,96px);scroll-margin-top:64px;">
  <div style="display:flex;align-items:baseline;gap:14px;margin-bottom:8px;flex-wrap:wrap;">
    <span style="font-family:var(--rf-font-mono);font-size:12px;font-weight:700;letter-spacing:.28em;color:#f4f4f2;">05 / TALKS</span>
    <span style="font-family:var(--rf-font-jp);font-size:13px;color:#6c6c6c;white-space:nowrap;flex-shrink:0;">登壇</span>
  </div>
  <div style="font-size:14px;color:#7a7a72;margin-bottom:24px;">Conferences &amp; meetups I've spoken at.</div>

  <div style="border:1px solid #1f1f1f;border-radius:14px;background:#0a0a0a;overflow:hidden;">
    {talks.map((t, i) => (
      <div style={`display:grid;grid-template-columns:auto 1fr auto;gap:clamp(12px,2.5vw,24px);align-items:center;padding:16px clamp(14px,2.5vw,22px);${i === talks.length - 1 ? '' : 'border-bottom:1px solid #161616;'}`}>
        <span style={`font-family:var(--rf-font-display);font-weight:700;font-size:16px;color:${t.accent ? '#ff5a1e' : '#cfcfca'};`}>{t.n}</span>
        <div>
          <div style="font-size:15px;font-weight:500;color:#f4f4f2;">{t.title}</div>
          <div style="font-family:var(--rf-font-mono);font-size:10px;letter-spacing:.06em;color:#8a8a82;margin-top:3px;">{t.meta}</div>
        </div>
        <span style="font-family:var(--rf-font-mono);font-size:10px;color:#6c6c6c;">↗</span>
      </div>
    ))}
  </div>
</div>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/portfolio/Talks.astro
git commit -m "Add Talks section"
```

---

## Task 17: `Connect.astro` (+ footer)

**Files:**
- Create: `src/components/portfolio/Connect.astro`

Translation of section 06 + footer (lines 390–419). Link cards use `.pf-card-accent` hover.

- [ ] **Step 1: Create `src/components/portfolio/Connect.astro`**

```astro
---
const links = [
  { label: 'LINKEDIN', handle: '/in/mtajchert', href: 'https://linkedin.com/in/mtajchert' },
  { label: 'TWITTER / X', handle: '@mtajchert', href: 'https://twitter.com/mtajchert' },
  { label: 'GITHUB', handle: '@mtajchert', href: 'https://github.com/mtajchert' },
  { label: 'GITLAB', handle: '@mtajchert', href: 'https://gitlab.com/mtajchert' },
];
---
<div id="connect" style="scroll-margin-top:64px;">
  <div style="display:flex;align-items:baseline;gap:14px;margin-bottom:8px;flex-wrap:wrap;">
    <span style="font-family:var(--rf-font-mono);font-size:12px;font-weight:700;letter-spacing:.28em;color:#f4f4f2;">06 / CONNECT</span>
    <span style="font-family:var(--rf-font-jp);font-size:13px;color:#6c6c6c;white-space:nowrap;flex-shrink:0;">連絡</span>
  </div>
  <div style="height:1px;background:#1a1a1a;margin-bottom:24px;"></div>

  <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px;">
    {links.map((l) => (
      <a href={l.href} target="_blank" rel="noopener" class="pf-card-accent" style="border:1px solid #1f1f1f;border-radius:12px;background:#0d0d0d;padding:20px;display:flex;align-items:center;justify-content:space-between;">
        <div>
          <div style="font-family:var(--rf-font-mono);font-size:9px;letter-spacing:.18em;color:#7a7a72;margin-bottom:7px;">{l.label}</div>
          <div style="font-size:15px;font-weight:500;color:#f4f4f2;">{l.handle}</div>
        </div>
        <span style="font-family:var(--rf-font-display);font-weight:700;font-size:18px;color:#ff5a1e;">↗</span>
      </a>
    ))}
  </div>

  <div style="margin-top:56px;padding-top:24px;border-top:1px solid #1a1a1a;display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap;font-family:var(--rf-font-mono);font-size:10px;letter-spacing:.1em;color:#6c6c6c;">
    <span>© 2026 MICHAŁ TAJCHERT · WARSAW</span>
    <span style="display:flex;align-items:center;gap:8px;">designed in the <span style="color:#f4f4f2;">te × nothing</span> language <span style="width:6px;height:6px;border-radius:50%;background:#ff4d12;box-shadow:0 0 7px rgba(255,77,18,.8);"></span></span>
  </div>
</div>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/portfolio/Connect.astro
git commit -m "Add Connect section and footer"
```

---

## Task 18: `index.astro` — compose the page

**Files:**
- Create: `src/pages/index.astro`

Composes all sections inside the `#top` content container (matching the design's `max-width:1080px` wrapper, lines 58 + 421).

- [ ] **Step 1: Create `src/pages/index.astro`**

```astro
---
import Base from '../layouts/Base.astro';
import StatusBar from '../components/portfolio/StatusBar.astro';
import Hero from '../components/portfolio/Hero.astro';
import RoleFlap from '../components/portfolio/RoleFlap.astro';
import About from '../components/portfolio/About.astro';
import Projects from '../components/portfolio/Projects.astro';
import Experience from '../components/portfolio/Experience.astro';
import Activity from '../components/portfolio/Activity.astro';
import Talks from '../components/portfolio/Talks.astro';
import Connect from '../components/portfolio/Connect.astro';
---
<Base>
  <StatusBar />
  <div id="top" style="max-width:1080px;margin:0 auto;padding:clamp(40px,7vw,84px) clamp(16px,4vw,40px) 120px;">
    <Hero />
    <RoleFlap />
    <About />
    <Projects />
    <Experience />
    <Activity />
    <Talks />
    <Connect />
  </div>
</Base>
```

- [ ] **Step 2: Build to verify the whole page compiles**

Run: `npm run build`
Expected: build succeeds, writes `dist/index.html`. No errors.

- [ ] **Step 3: Sanity-check the built output**

Run: `grep -c "michał" dist/index.html && grep -c "contrib-graph" dist/index.html`
Expected: both ≥ 1 (name rendered; the web-component tag present in output).

- [ ] **Step 4: Commit**

```bash
git add src/pages/index.astro
git commit -m "Compose portfolio page in index.astro"
```

---

## Task 19: README + Cloudflare Pages notes

**Files:**
- Create: `README.md`

- [ ] **Step 1: Create `README.md`**

```markdown
# Portfolio — Michał Tajchert

Single-page personal portfolio in the **TE × Nothing** retro-futurism language.
Built with Astro (static output), styled with a vendored copy of the
[retrofuturism-web-design-system](https://gitlab.com/mtajchert/retrofuturism-web-design-system).

## Run

\`\`\`bash
npm install
npm run dev      # http://localhost:4321
npm run build    # static output → dist/
npm run preview  # serve the built dist/
npm test         # unit tests (contribution-graph logic)
\`\`\`

## Deploy to Cloudflare Pages

- Build command: \`npm run build\`
- Output directory: \`dist\`
- Framework preset: Astro

Fully static; no server runtime and no build-time secrets. The design system is
vendored into \`src/\`, so the build needs no access to the private design-system repo.

## Design system

\`src/styles\`, \`src/components\`, and \`src/web-components\` are copied from the
design system. The page-specific sections live in \`src/components/portfolio/\`.
The contribution-activity heatmap (\`ContribGraph\`) was contributed back to the
design system and vendored here.
\`\`\`
```

(Note: when creating the file, use a real triple-backtick fence — the escaped backticks above are only to embed the block in this plan.)

- [ ] **Step 2: Final full verification**

Run: `npm run build && npm test`
Expected: build succeeds; tests pass.

- [ ] **Step 3: Commit**

```bash
git add README.md
git commit -m "Add README with Cloudflare Pages deploy notes"
```

---

## Verification checklist (run after all tasks)

- [ ] `npm run build` succeeds, `dist/index.html` exists.
- [ ] `npm test` passes (contrib-graph logic).
- [ ] `dist/index.html` contains the name, all six section headings (01–06), and a `<contrib-graph>` element.
- [ ] Hero shows the terminal card only (no panel/flap variant markup).
- [ ] DS branch `feat/contrib-graph` pushed to GitLab and reported to the user for review (not merged to main).
- [ ] Visual spot-check against `docs/reference/Portfolio.dc.html` (optional, only if user asks to run a browser).
```
