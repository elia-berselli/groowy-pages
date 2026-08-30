import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const siteRoot = resolve(scriptDirectory, '..');
const distDirectory = resolve(siteRoot, 'astro', 'dist');
const legacyFallbackFiles = new Set([
  'privacy-policy.html',
  'terms-of-service.html',
  'delete-account.html',
  'reset-password.html',
]);

const collectHtmlFiles = (directory) => readdirSync(directory, { withFileTypes: true })
  .flatMap((entry) => {
    const entryPath = resolve(directory, entry.name);
    if (entry.isDirectory()) return collectHtmlFiles(entryPath);
    return entry.isFile() && entry.name.endsWith('.html') ? [entryPath] : [];
  });

const resolveHref = (href, currentFile) => {
  const url = new URL(href, `https://groowy.local/${relative(distDirectory, currentFile).replace(/\\/g, '/')}`);
  const pathname = decodeURIComponent(url.pathname);
  const outputPath = pathname.endsWith('.html')
    ? resolve(distDirectory, `.${pathname}`)
    : pathname === '/'
      ? resolve(distDirectory, 'index.html')
      : resolve(distDirectory, `.${pathname}`, 'index.html');
  return { anchor: url.hash.slice(1), outputPath };
};

const anchorExists = (html, anchor) => new RegExp(`(?:id|name)=["']${anchor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["']`, 'i').test(html);
const hrefPattern = /<a\b[^>]*\bhref=(['"])(.*?)\1[^>]*>/gi;
const ignoredSchemes = /^(?:mailto:|tel:|https?:|data:|javascript:)/i;

const failures = [];
let checkedLinks = 0;
let checkedPages = 0;

if (!existsSync(distDirectory)) {
  failures.push('dist assente: eseguire npm run build');
} else {
  const htmlFiles = collectHtmlFiles(distDirectory)
    .filter((filePath) => !legacyFallbackFiles.has(relative(distDirectory, filePath).replace(/\\/g, '/')));

  for (const pagePath of htmlFiles) {
    const pageHtml = readFileSync(pagePath, 'utf8');
    checkedPages += 1;
    for (const match of pageHtml.matchAll(hrefPattern)) {
      const href = match[2].trim();
      if (!href || href.startsWith('#')) {
        if (href.slice(1) && !anchorExists(pageHtml, href.slice(1))) {
          failures.push(`${relative(distDirectory, pagePath)}: anchor mancante ${href}`);
        }
        checkedLinks += 1;
        continue;
      }
      if (ignoredSchemes.test(href)) continue;

      const { anchor, outputPath } = resolveHref(href, pagePath);
      if (!existsSync(outputPath) || !statSync(outputPath).isFile()) {
        failures.push(`${relative(distDirectory, pagePath)}: destinazione assente ${href}`);
        continue;
      }
      if (anchor && !anchorExists(readFileSync(outputPath, 'utf8'), anchor)) {
        failures.push(`${relative(distDirectory, pagePath)}: anchor destinazione mancante ${href}`);
      }
      checkedLinks += 1;
    }
  }
}

if (failures.length > 0) {
  console.error(`SITE_LINKS_RED ${failures.join('; ')}`);
  process.exitCode = 1;
} else {
  console.log(`SITE_LINKS_GREEN ${checkedPages} pagine e ${checkedLinks} link interni verificati`);
}
