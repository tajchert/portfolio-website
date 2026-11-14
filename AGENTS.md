# AGENTS.md — Portfolio

## What this is

A single-page personal portfolio for Michał Tajchert. It is a static, hand-written HTML site with a plain link-list presentation, light and dark themes, and no framework, dependencies, or external requests from the page.

## Layout

```
site/index.html          home page, inline CSS and theme script
site/404.html            matching not-found page
site/_headers            Cloudflare Pages headers and CSP
site/                    icons, share image, CV PDF, robots.txt, sitemap.xml
scripts/build.mjs        validates inline-script CSP hashes and copies to dist/
tools/                   source files and instructions for regenerating images
michal-tajchert-cv.md    CV Markdown source
```

## Commands

```sh
npm run build
npm run preview
```

The build copies `site/` to `dist/` and copies the root CV Markdown into `dist/`. Preview builds first, then serves the result at `http://127.0.0.1:4321`.

## Conventions

- Keep the site in one HTML file with inline CSS and one small inline theme script. `404.html` is a separate matching page.
- Keep it dependency-free and make no external requests from the page.
- Use CSS custom properties for light and dark colors. The system preference selects the initial theme; the theme button overrides it and stores the selection in `localStorage`.
- Preserve semantic HTML, the canonical URL, description, Open Graph and Twitter metadata, and `ProfilePage` / `Person` JSON-LD in `site/index.html`.
- Keep the layout free of horizontal overflow from 320 px upward.
- The inline script hash in `site/_headers` must match scripts in both HTML files. If the build reports a new hash, update the `script-src` hash there and run `npm run build` again.
- Regenerate the favicon files and `site/og.png` using the instructions in `tools/README.md`.
- `michal-tajchert-cv.md` at the repository root is the Markdown CV source; the build copies it into `dist/`. The PDF served by the site is `site/michal-tajchert-cv.pdf`.

## Workflow

Work on a branch; do not commit to `main`. Run `npm run build`, then check the page in a browser in light and dark mode at phone and desktop widths.

## Deploy

Cloudflare Pages project: `mtajchert-portfolio`. Build command: `npm run build`. Output directory: `dist`. Direct upload:

```sh
npx wrangler pages deploy dist --project-name=mtajchert-portfolio --branch=main
```

The canonical domain is https://mtajchert.com. DNS and the `mtajchert.pl` redirect to `mtajchert.com` are configured in the Cloudflare dashboard.
