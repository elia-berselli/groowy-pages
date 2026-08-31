import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const siteRoot = resolve(scriptDirectory, '..');
const publicDirectory = resolve(siteRoot, 'astro', 'public');
const legacyFiles = [
  'privacy-policy.html',
  'terms-of-service.html',
  'delete-account.html',
  'reset-password.html',
  'styles.css',
  'reset-password.js',
  'partners.html',
];

const digest = (value) => createHash('sha256').update(value).digest('hex');
const failures = [];

for (const fileName of legacyFiles) {
  const sourcePath = resolve(siteRoot, fileName);
  const targetPath = resolve(publicDirectory, fileName);
  if (!existsSync(sourcePath) || !existsSync(targetPath)) {
    failures.push(`${fileName}: sorgente o copia assente`);
    continue;
  }

  const source = readFileSync(sourcePath);
  const target = readFileSync(targetPath);
  if (digest(source) !== digest(target)) {
    failures.push(`${fileName}: copia non byte-identica`);
  }
}

if (failures.length > 0) {
  console.error(`LEGAL_RED ${failures.join('; ')}`);
  process.exitCode = 1;
} else {
  console.log(`LEGAL_GREEN ${legacyFiles.length} file e asset byte-identici`);
}
