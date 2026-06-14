# AGENTS.md — Portfolio (Michał Tajchert)

Onboarding for engineers (human or agent) making a few commits here. Senior level assumed.

## What this is

A single-page personal portfolio in the **TE × Nothing** retro-futurism language. Static
Astro site, deployed to **Cloudflare Pages**. Dark-finish only.

## Stack

- **Astro 4**, `output: 'static'` → `dist/`. No SSR, no server runtime.
- **Vanilla Web Components** for all client interactivity (self-register on import). No React/Vue/Svelte.
- **CSS custom properties** (`--rf-*`) for theming. No CSS framework.
- **TypeScript** (strict) for tested pure logic. **Vitest** for unit tests.

## Commands

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # → dist/
npm run preview  # serve dist/ at http://localhost:4321
npm test         # vitest
```

> **Always preview over a server, never `file://`.** Module scripts are blocked on a
> `file://` origin (CORS), so the web components (split-flap, contribution graph, CV
> actions) won't run. Use `npm run preview`. Cloudflare serves over HTTPS, so it's fine there.

## Layout

```
src/
  styles/        tokens.css, themes.css, keyframes.css, base.css   ← VENDORED from design system
                 portfolio.css                                     ← page-local (resets, hover utils, responsive)
  components/    *.astro (Glyph, SplitFlap, Chip, ContribGraph, …) ← VENDORED
  web-components/*.js + *.normalize.ts (+ .test.ts)                ← VENDORED
  components/portfolio/   StatusBar, Hero, RoleFlap, About, Projects,
                          Experience, Activity, Talks, Connect, CvActions, Tag  ← THIS site's sections
  layouts/Base.astro      dark-locked layout, <head> meta + JSON-LD
  pages/index.astro       composes the sections
  config.ts               single source of truth (e.g. BLOG_URL)
michal-tajchert-cv.md      the CV, imported `?raw` at build (single source)
public/                    favicon.svg, og.png, robots.txt, sitemap.xml
```

## The design system — read before adding components

`src/styles`, `src/components`, `src/web-components` are **vendored copies** of a
private retro-futurism design system. We vendor (not a live dependency) so the
build needs no auth for the private repo.

- **Do not diverge the vendored copies by editing them in place.** If a shared/reusable
  component needs changes, make them in the design-system repo on a branch, push for
  review, then **copy the files back in**. Page-specific stuff lives in
  `src/components/portfolio/` (never in the DS).

## Conventions

- **Tokens vs literals.** DS components style with `var(--rf-*)`. Portfolio sections
  (`components/portfolio/`) intentionally use the design's **literal hex** — the page is
  dark-locked and we match the mock exactly. Don't "tokenize" them.
- **Interactivity = web components.** Keep JS in vanilla custom elements under
  `web-components/`. Pure, branchy logic goes in a `*.normalize.ts` module with Vitest
  tests; the `.js` element mirrors it (the repo's established, if non-DRY, pattern).
- **Hover/links.** The design mock used a non-standard `style-hover` attribute → translate
  to real CSS via the `.pf-*` classes in `portfolio.css`. Anchors are reset to inherit
  color / no underline there too.
- **Semantics & SEO.** Real landmarks (`header/nav/main/section/footer`) and heading
  hierarchy (`h1`→`h2`→`h3`); a heading reset in `portfolio.css` keeps them visually
  identical to styled spans. `Person`/`ProfilePage` JSON-LD + canonical + OG/Twitter live
  in `Base.astro`. Keep these intact when editing sections.
- **Responsive.** No horizontal overflow at any width (verify 320–1280px). Use
  `minmax(min(100%, Npx), 1fr)` for auto-fit grids; the in-page nav is hidden < 600px.
- **Single sources.** Blog URL → `src/config.ts`. CV content → `michal-tajchert-cv.md`
  (imported `?raw`). Change these in one place.

## Notable pieces

- **Contribution graph** (`contrib-graph`): with `data-src` set (Activity.astro points at
  `commitgraph.mtajchert.com/api/contributions`), it fetches current + previous year live,
  merges into a rolling 53-week window, caches in `localStorage` (6h), shows a shimmer
  while loading, and **falls back to placeholder data** if the API is down. Current streak
  counts back from today's cell; the grid starts scrolled to the most recent week.
- **CV actions** (`cv-actions`): COPY (clipboard) + SAVE (Blob download) of the bundled
  markdown, passed in as base64 (UTF-8 safe).

## Workflow

- **Branch, don't commit to `main`.** One focused change per branch; frequent small commits.
- **TDD the pure logic** (`*.normalize.ts`). Run `npm run build` **and** `npm test` before
  committing; both must be green.
- **Verify visually.** For UI/responsive/loading changes, check the built output (headless
  browser is fine) — overflow, the affected viewport(s), and the actual rendered component.
- Commit messages: imperative, explain the *why*. End with the project's `Co-Authored-By`
  trailer when an agent made the change.

## Deploy (Cloudflare Pages)

- Project: **`mtajchert-portfolio`**. Build `npm run build`,
  output `dist`, fully static, no env vars/secrets.
- Deploy: `npx wrangler pages deploy dist --project-name=mtajchert-portfolio --branch=main`
  (direct upload — wrangler is authenticated). Or connect the repo to Pages (GitLab) for
  auto-deploys; there's no git remote yet.
- `site` in `astro.config.mjs` drives canonical/OG/sitemap URLs — update it if the domain changes.
- **DNS / custom domain / redirects are done in the Cloudflare dashboard** (not in this
  repo): `mtajchert.com` → the Pages project; `mtajchert.pl` → 301 to `mtajchert.com`.
- `public/og.png` is a generated 1200×630 card; regenerate it (headless render of the hero)
  if the identity/branding changes.

## Gotchas

- `file://` breaks the web components (see Commands). Always use a server.
- The contribution graph depends on `commitgraph.mtajchert.com` at runtime; it degrades to
  placeholder data, so a broken graph in dev usually means that service, not this code.
- Blog is on Hashnode's free subdomain (`mtajchert.hashnode.dev`) — linked, not hosted here.
