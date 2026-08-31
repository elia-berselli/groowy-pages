import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const siteRoot = resolve(scriptDirectory, '..');
const distDirectory = resolve(siteRoot, 'astro', 'dist');

const documents = [
  ['privacy-policy.html', 'privacy/index.html'],
  ['terms-of-service.html', 'terms/index.html'],
  ['delete-account.html', 'delete-account/index.html'],
];

const extractMain = (html, source) => {
  const match = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i);
  if (!match) throw new Error(`main assente: ${source}`);
  return match[1];
};

const extractLegalArticle = (html, source) => {
  const match = html.match(/<article\b[^>]*class="[^"]*\blegal-document\b[^"]*"[^>]*>([\s\S]*?)<\/article>/i);
  if (!match) throw new Error(`legal-document assente: ${source}`);
  return match[1];
};

const normaliseVisibleText = (html) => html
  .replace(/<!--[^]*?-->/g, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&nbsp;/g, ' ')
  .replace(/&amp;/g, '&')
  .replace(/&#39;|&apos;/g, "'")
  .replace(/&quot;/g, '"')
  .replace(/\s+/g, ' ')
  .trim();

const failures = [];

for (const [legacyName, builtName] of documents) {
  const legacyPath = resolve(siteRoot, legacyName);
  const builtPath = resolve(distDirectory, builtName);
  if (!existsSync(legacyPath) || !existsSync(builtPath)) {
    failures.push(`${legacyName}: sorgente o output assente`);
    continue;
  }

  try {
    const legacyText = normaliseVisibleText(extractMain(readFileSync(legacyPath, 'utf8'), legacyName));
    const builtText = normaliseVisibleText(extractLegalArticle(readFileSync(builtPath, 'utf8'), builtName));
    if (legacyText !== builtText) failures.push(`${legacyName}: testo divergente`);
  } catch (error) {
    failures.push(`${legacyName}: ${error instanceof Error ? error.message : 'errore sconosciuto'}`);
  }
}

if (failures.length > 0) {
  console.error(`LEGAL_RENDER_RED ${failures.join('; ')}`);
  process.exitCode = 1;
} else {
  console.log(`LEGAL_RENDER_GREEN ${documents.length} route con testo invariato`);
}
