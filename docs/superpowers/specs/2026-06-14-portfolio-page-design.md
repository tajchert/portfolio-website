# Portfolio Page — Design

## Goal

A single-page personal portfolio for **Michał Tajchert** (CTO), built in the
**TE × Nothing** retro-futurism language. Built with **Astro**, output fully
static, deployed to **Cloudflare Pages**. Content is placeholder for now and
that is acceptable.

Source of truth for the visual design is the Claude Design handoff file
`Portfolio.dc.html` (kept under `docs/reference/`). The implementation must
match its visual output; it need not copy the prototype's `.dc.html` internal
structure (`x-dc`, `sc-if`, `DCLogic`), which is design-tool scaffolding.

## Decisions (confirmed with user)

1. **Design system consumption: vendor (copy in).** Copy `src/styles/`,
   `src/components/`, `src/web-components/` from
   `git@gitlab.com:mtajchert/retrofuturism-web-design-system.git` into this
   repo. Rationale: zero build-time auth, deploys to Cloudflare Pages with no
   setup; this is the consumption method the design system's own README
   recommends.
2. **New component lives in the design system.** The contribution-activity
   heatmap is built in the design system repo (on a branch, pushed for review),
   then vendored into the portfolio.
3. **Hero variant: `terminal`.** The `.dc.html` offers three hero variants
   (`terminal` / `panel` / `flap`) selectable in the design tool. The user
   chose `terminal`. The other two are dropped.
4. **Dark-finish only.** The portfolio is black-finish only (the design is
   authored dark-only). No theme toggle on this page, but components still use
   `--rf-*` tokens so they render correctly under the locked dark theme.

## Architecture

Astro static site. The page ships effectively zero JS except the one
interactive web component (the contribution graph toggle) and the split-flap
display — both vanilla custom elements that self-register on import, matching
the design system's "interactivity isolated in custom elements" rule.

```
portfolio-page/
  astro.config.mjs            # output: 'static', site set to pages.dev
  package.json                # astro only; build → dist/
  src/
    styles/                   # vendored from DS (tokens, themes, keyframes, base)
    components/               # vendored DS components (SplitFlap, Glyph, Chip, ContribGraph, ...)
    web-components/           # vendored DS custom elements (split-flap.js, contrib-graph.js, ...)
    layouts/
      Base.astro              # dark-locked layout; imports the 4 DS stylesheets
    components/portfolio/     # page-specific section components (NOT part of DS)
      StatusBar.astro
      Hero.astro
      RoleFlap.astro
      About.astro
      Projects.astro
      Experience.astro
      Activity.astro
      Talks.astro
      Connect.astro
    pages/
      index.astro             # composes the sections
  public/                     # favicon etc.
  docs/reference/Portfolio.dc.html   # the handoff design, for reference
```

### Layout — `Base.astro`

Adapted from the design system's `Showcase.astro`, but:
- `data-theme="dark"` locked on `<html>` (no localStorage toggle, no
  `rf-theme-toggle`).
- Imports `tokens.css`, `themes.css`, `keyframes.css`, `base.css`.
- Sets page `<title>`, meta description, viewport, and the dot-grid page
  background (already provided by `base.css` via `--rf-page` / `--rf-dot-color`;
  the design uses `#0b0b0b` ≈ DS `--rf-page`).
- Adds the extra keyframes the design needs that are not in the DS
  `keyframes.css`: `glyph-pulse-soft`, `rec-blink`, `cursor-blink`,
  `knob-spin`. (`scan` is unused by the terminal variant and omitted.) These go
  in a small page-scoped style block, or are added to the DS `keyframes.css`
  copy.

### Page sections — `src/components/portfolio/*`

These are consumers of the design system, not part of it (mirrors the DS's
`components/sections/*` showcase pattern). Each emits static markup styled with
`--rf-*` tokens.

- **StatusBar** — sticky top bar: glyph-LED logo + `MT_OS` wordmark, anchor nav
  (WORK / EXP / ACTIVITY / TALKS / CONNECT), blinking `ONLINE` record dot.
  Hover states (`#ff4d12`) implemented as real CSS `:hover` (the `.dc.html`
  uses a non-standard `style-hover` attribute that must be translated to CSS).
- **Hero** — two-column grid: identity (name in Doto, role, location, skill
  chips) + the **terminal** card (zsh prompt mock with blinking caret).
- **RoleFlap** — the "depending on the day" split-flap panel. Reuses the DS
  `SplitFlap.astro` (`mode="cycle"`, the same `values`, `size`, `interval`
  from the design).
- **About** (01), **Projects** (02, featured + secondary cards), **Experience**
  (03, timeline), **Activity** (04, see below), **Talks** (05, list), **Connect**
  (06, link cards) + footer.

All anchor `:hover` border/color transitions translated from `style-hover` to
real CSS (scoped `<style>` per component or shared utility classes).

### New design-system component — `ContribGraph`

Lives in the design system (`src/components/ContribGraph.astro` +
`src/web-components/contrib-graph.js`), pushed to a branch for review, then
vendored here.

- Renders a 53×7 contribution heatmap, a source toggle (ALL / GITHUB / GITLAB),
  a live total readout, and four stat tiles (TOTAL / LONGEST STREAK / CURRENT
  STREAK / BUSIEST DAY).
- The deterministic placeholder data generator (LCG seeded `20260613`, the
  per-day `gh`/`gl` synthesis) is ported verbatim from the `.dc.html` `DCLogic`
  so output matches the mock. It runs **client-side in the web component** so
  the toggle can recompute buckets/stats without a server.
- Bucketing, colors, and glows match the design exactly: bg ramp
  `#161616 → rgba(244,244,242,{.24,.46,.74}) → #ff5a1e`; top bucket gets the
  orange glow.
- Props: `theme` (dark/light). Data + interactivity self-contained. The
  component is reusable: any consumer drops `<contrib-graph>` and gets the
  generated demo data, or (future) passes real data via an attribute.

The component is reusable and theme-token driven so it earns its place in the
design system rather than being portfolio-specific.

## Deployment

- `npm run build` → `dist/` (fully static).
- Cloudflare Pages: build command `npm run build`, output dir `dist`, framework
  preset Astro. No server runtime, no env vars, no private-dependency auth.

## Testing

- The `ContribGraph` data/stat logic (LCG generator, bucketing, streak/total
  computation) is extracted into a pure TS module in the design system and unit
  tested with Vitest (matching the DS's `split-flap.normalize.test.ts`
  pattern), so the numbers are verifiable without a browser.
- `npm run build` must succeed with no errors as the integration check.
- Manual visual diff against `Portfolio.dc.html` for the page itself.

## Out of scope

- Real contribution data / GitHub-GitLab API integration (placeholder
  generator only).
- Real copy (placeholders retained).
- The `panel` and `flap` hero variants.
- Light theme for the portfolio page (DS keeps light support; portfolio locks
  dark).
```
