# Portfolio — Michał Tajchert

Single-page personal portfolio in the **TE × Nothing** retro-futurism language.
Built with Astro (static output), styled with a vendored copy of the
[retrofuturism-web-design-system](https://gitlab.com/mtajchert/retrofuturism-web-design-system).

## Run

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # static output → dist/
npm run preview  # serve the built dist/ at http://localhost:4321
npm test         # unit tests (contribution-graph logic)
```

> **View over a server, never via `file://`.** Opening `dist/index.html`
> directly (`file://…`) loads the CSS but browsers block the ES-module
> scripts on a `file://` origin (CORS), so the interactive web components
> (split-flap display, contribution heatmap) won't render. Use
> `npm run preview` (or any static server, e.g. `npx serve dist`). This is
> only a local-preview concern — Cloudflare Pages serves over HTTPS, so it
> works there.

## Deploy to Cloudflare Pages

- Build command: `npm run build`
- Output directory: `dist`
- Framework preset: Astro

Fully static; no server runtime and no build-time secrets. The design system is
vendored into `src/`, so the build needs no access to the private design-system repo.

## Design system

`src/styles`, `src/components`, and `src/web-components` are copied from the
design system. The page-specific sections live in `src/components/portfolio/`.
The contribution-activity heatmap (`ContribGraph`) was contributed back to the
design system and vendored here.
