// Build: copy site/ to dist/ as-is, plus the CV markdown from the repo root.
// Plain Node, no dependencies. Also checks that every inline <script> is
// allowed by the Content-Security-Policy hash list in site/_headers.
import { cpSync, copyFileSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const site = `${root}site`;
const dist = `${root}dist`;

const headers = readFileSync(`${site}/_headers`, 'utf8');
for (const file of readdirSync(site).filter((f) => f.endsWith('.html'))) {
  const html = readFileSync(`${site}/${file}`, 'utf8');
  for (const [, body] of html.matchAll(/<script>([\s\S]*?)<\/script>/g)) {
    const hash = `'sha256-${createHash('sha256').update(body).digest('base64')}'`;
    if (!headers.includes(hash)) {
      console.error(`site/${file}: inline script changed. Put ${hash} in the script-src of site/_headers.`);
      process.exit(1);
    }
  }
}

rmSync(dist, { recursive: true, force: true });
cpSync(site, dist, { recursive: true });
copyFileSync(`${root}michal-tajchert-cv.md`, `${dist}/michal-tajchert-cv.md`);
console.log('Built dist/');
