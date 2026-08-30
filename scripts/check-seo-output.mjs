#!/usr/bin/env node

/**
 * Verifica l'HTML effettivamente prodotto dalla prima serie SEO: canonical,
 * hreflang reciproco, default italiano, metadata e presenza in sitemap.
 */

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryDirectory = resolve(scriptDirectory, '..');
const distDirectory = resolve(repositoryDirectory, 'astro', 'dist');
const pairs = [
  { it: '/spese/', en: '/en/expenses/' },
  { it: '/documenti/', en: '/en/documents/' },
  { it: '/budget-famiglia/', en: '/en/family-budget/' },
  { it: '/privacy-offline/', en: '/en/offline-privacy/' },
  { it: '/partners/open-banking/', en: '/en/partners/open-banking/' },
];

const outputPath = (route) => route === '/'
  ? resolve(distDirectory, 'index.html')
  : resolve(distDirectory, `.${route}`, 'index.html');
const expectedMeta = (attribute, name, content) => `<meta ${attribute}="${name}" content="${content}">`;
const expectedTag = (rel, value) => new RegExp(`<link\\s+rel=["']${rel}["']\\s+href=["']${value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["']`, 'i');

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
const routeForOutput = (filePath) => {
  const outputRelativePath = relative(distDirectory, filePath).replace(/\\/g, '/');
  if (outputRelativePath === 'index.html') return '/';
  return '/' + outputRelativePath.slice(0, -'index.html'.length);
};

const failures = [];
const titles = new Set();
const descriptions = new Set();
let publicOutputPageCount = 0;

if (!existsSync(distDirectory)) {
  failures.push('dist assente: eseguire npm run build');
} else {
  for (const pair of pairs) {
    for (const [locale, route] of Object.entries(pair)) {
      const filePath = outputPath(route);
      if (!existsSync(filePath)) {
        failures.push(`${route}: output assente`);
        continue;
      }
      const html = readFileSync(filePath, 'utf8');
      const counterpart = pair[locale === 'it' ? 'en' : 'it'];
      const title = html.match(/<title>([^<]+)<\/title>/i)?.[1]?.trim();
      const description = html.match(/<meta\s+name="description"\s+content="([^"]+)"/i)?.[1]?.trim();
      if (!title || titles.has(title)) failures.push(`${route}: title mancante o duplicato`);
      if (!description || descriptions.has(description)) failures.push(`${route}: description mancante o duplicata`);
      if (title) titles.add(title);
      if (description) descriptions.add(description);
      if (!new RegExp(`<html[^>]+lang=["']${locale}["']`, 'i').test(html)) failures.push(`${route}: lang ${locale} mancante`);
      if (!expectedTag('canonical', `https://groowy.app${route}`).test(html)) failures.push(`${route}: canonical errata`);
      if (!expectedTag('alternate"? hreflang="?it', `https://groowy.app${pair.it}`).test(html)) failures.push(`${route}: hreflang it assente`);
      if (!expectedTag('alternate"? hreflang="?en', `https://groowy.app${pair.en}`).test(html)) failures.push(`${route}: hreflang en assente`);
      if (!expectedTag('alternate"? hreflang="?x-default', `https://groowy.app${pair.it}`).test(html)) failures.push(`${route}: x-default non italiano`);
      if (!new RegExp(`<a[^>]+href=["']${counterpart.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["']`, 'i').test(html)) failures.push(`${route}: selettore lingua non reciproco`);
    }
  }
  const publicOutputPages = collectHtmlFiles(distDirectory)
    .filter((filePath) => !legacyFallbackFiles.has(
      relative(distDirectory, filePath).replace(/\\/g, '/'),
    ));
  publicOutputPageCount = publicOutputPages.length;
  for (const filePath of publicOutputPages) {
    const route = routeForOutput(filePath);
    const html = readFileSync(filePath, 'utf8');
    const locale = html.match(/<html[^>]+lang="(it|en)"/i)?.[1];
    const title = html.match(/<title>([^<]+)<\/title>/i)?.[1]?.trim();
    const description = html.match(/<meta\s+name="description"\s+content="([^"]+)"/i)?.[1]?.trim();
    const socialLocale = locale === 'it' ? 'it_IT' : 'en_US';
    const socialUrl = 'https://groowy.app' + route;
    const socialImage = 'https://groowy.app/og.png';
    if (!locale) failures.push(route + ': lingua pubblica mancante');
    if (!title) failures.push(route + ': title mancante');
    if (!description) failures.push(route + ': description mancante');
    if (!expectedTag('canonical', socialUrl).test(html)) failures.push(route + ': canonical errata');
    if (!html.includes(expectedMeta('property', 'og:type', 'website'))) failures.push(route + ': og:type mancante');
    if (!html.includes(expectedMeta('property', 'og:site_name', 'Groowy'))) failures.push(route + ': og:site_name mancante');
    if (!html.includes(expectedMeta('property', 'og:title', title))) failures.push(route + ': og:title non coerente');
    if (!html.includes(expectedMeta('property', 'og:description', description))) failures.push(route + ': og:description non coerente');
    if (!html.includes(expectedMeta('property', 'og:url', socialUrl))) failures.push(route + ': og:url errato');
    if (!html.includes(expectedMeta('property', 'og:locale', socialLocale))) failures.push(route + ': og:locale errato');
    if (!html.includes(expectedMeta('property', 'og:image', socialImage))) failures.push(route + ': og:image mancante');
    if (!html.includes(expectedMeta('name', 'twitter:card', 'summary_large_image'))) failures.push(route + ': twitter:card mancante');
    if (!html.includes(expectedMeta('name', 'twitter:title', title))) failures.push(route + ': twitter:title non coerente');
    if (!html.includes(expectedMeta('name', 'twitter:description', description))) failures.push(route + ': twitter:description non coerente');
    if (!html.includes(expectedMeta('name', 'twitter:image', socialImage))) failures.push(route + ': twitter:image mancante');
  }
  const socialImagePath = resolve(distDirectory, 'og.png');
  if (!existsSync(socialImagePath) || statSync(socialImagePath).size === 0) {
    failures.push('og.png: asset di anteprima assente o vuoto');
  }
  const sitemapPath = resolve(distDirectory, 'sitemap.xml');
  const sitemap = existsSync(sitemapPath) ? readFileSync(sitemapPath, 'utf8') : '';
  for (const route of pairs.flatMap((pair) => [pair.it, pair.en])) {
    if (!sitemap.includes(`<loc>https://groowy.app${route}</loc>`)) failures.push(`sitemap: route guida assente ${route}`);
  }
}

if (failures.length) {
  console.error(`SEO_OUTPUT_RED ${failures.join('; ')}`);
  process.exitCode = 1;
} else {
  console.log(`SEO_OUTPUT_GREEN ${pairs.length * 2} route guida/partner e ${publicOutputPageCount} route pubbliche, canonical/hreflang/social/sitemap verificati`);
}
