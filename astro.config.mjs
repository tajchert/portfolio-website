import { defineConfig } from 'astro/config';

// Static site for Cloudflare Pages. Output to dist/.
// Single-page site: sitemap is a static file in public/ (no integration needed).
export default defineConfig({
  output: 'static',
  site: 'https://mtajchert.pages.dev',
});
