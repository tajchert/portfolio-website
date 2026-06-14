# Portfolio — Michał Tajchert

Single-page personal portfolio in the **TE × Nothing** retro-futurism language.
Built with Astro (static output), styled with a vendored copy of the
[retrofuturism-web-design-system](https://gitlab.com/mtajchert/retrofuturism-web-design-system).

## Run

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # static output → dist/
npm run preview  # serve the built dist/
npm test         # unit tests (contribution-graph logic)
```

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
