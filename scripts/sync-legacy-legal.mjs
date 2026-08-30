import { copyFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const siteRoot = resolve(scriptDirectory, '..');
const publicDirectory = resolve(siteRoot, 'astro', 'public');

// Questi file restano la fonte legale autorevole. Il nuovo build li include
// senza duplicarne o riscriverne il contenuto editoriale.
const legacyLegalFiles = [
  'privacy-policy.html',
  'terms-of-service.html',
  'delete-account.html',
  'reset-password.html',
];

mkdirSync(publicDirectory, { recursive: true });

for (const fileName of legacyLegalFiles) {
  const sourcePath = resolve(siteRoot, fileName);
  const targetPath = resolve(publicDirectory, fileName);
  copyFileSync(sourcePath, targetPath);
}

console.log(`LEGAL_SYNC_GREEN ${legacyLegalFiles.length} file legacy copiati`);
