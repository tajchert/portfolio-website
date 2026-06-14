import { defineConfig } from 'astro/config';

// Static site for Cloudflare Pages. Output to dist/.
export default defineConfig({
  output: 'static',
  site: 'https://mtajchert.pages.dev',
});
