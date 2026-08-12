// Cloudflare Pages static build: copy frontend files into dist/
// (dist matches Cloudflare Pages' default "Build output directory")
import { cpSync, mkdirSync, rmSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(root, 'dist');
rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });

// Frontend-only files (backend server.js / data / secrets are NOT published)
const files = [
  'index.html',
  'style.css',
  'script.js',
  'vocab-data.js',
  'phrases-data.js',
  'essay-data.js',
  'sample-data.js',
  'cet4.tsv',
  'cet6.tsv',
  'phrases.tsv'
];

for (const f of files) {
  cpSync(path.join(root, f), path.join(out, f));
}
console.log('Static site built into', out);
