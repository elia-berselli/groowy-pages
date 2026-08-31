#!/usr/bin/env node

/**
 * Gate editoriale della prima serie SEO.
 *
 * Non misura il ranking e non certifica claim di prodotto: impedisce invece
 * che questa prima serie diventi una matrice cieca di pagine simili. Ogni guida
 * deve avere intento, metadata, evidenze e una coppia linguistica esplicita.
 */

import { readdir, readFile } from 'node:fs/promises';
import { join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDirectory = resolve(fileURLToPath(new URL('.', import.meta.url)));
const repositoryDirectory = resolve(scriptDirectory, '..');
const guidesDirectory = join(repositoryDirectory, 'astro', 'src', 'content', 'guides');
const requiredKeys = new Set([
  'it/spese',
  'it/documenti',
  'it/budget-famiglia',
  'it/privacy-offline',
  'en/expenses',
  'en/documents',
  'en/family-budget',
  'en/offline-privacy',
]);
const requiredFields = [
  'title', 'description', 'h1', 'eyebrow', 'locale', 'translationKey',
  'canonicalPath', 'alternatePath', 'searchIntent', 'family', 'status',
  'indexing', 'productStatus', 'order', 'claimRefs', 'evidenceRefs', 'author',
  'reviewer', 'updatedAt',
];

async function markdownFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const entryPath = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await markdownFiles(entryPath));
    if (entry.isFile() && entry.name.endsWith('.md')) files.push(entryPath);
  }
  return files.sort();
}

function parseValue(rawValue) {
  const value = rawValue.trim();
  if (value.startsWith('[') && value.endsWith(']')) {
    const body = value.slice(1, -1).trim();
    return body ? body.split(',').map((item) => item.trim().replace(/^['"]|['"]$/g, '')) : [];
  }
  return value.replace(/^['"]|['"]$/g, '');
}

function parseFrontmatter(source, filePath) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!match) throw new Error(`${relative(repositoryDirectory, filePath)}: frontmatter mancante`);
  const data = {};
  for (const line of match[1].split(/\r?\n/)) {
    const separator = line.indexOf(':');
    if (separator > 0) data[line.slice(0, separator).trim()] = parseValue(line.slice(separator + 1));
  }
  return data;
}

function assertGuide(data, key, state) {
  const missing = requiredFields.filter((field) => !(field in data) || data[field] === '' || (Array.isArray(data[field]) && data[field].length === 0));
  if (missing.length) throw new Error(`${key}: campi mancanti o vuoti: ${missing.join(', ')}`);
  if (!['it', 'en'].includes(data.locale)) throw new Error(`${key}: locale non ammesso ${data.locale}`);
  if (!key.startsWith(`${data.locale}/`)) throw new Error(`${key}: locale e percorso non coerenti`);
  if (!['guide', 'use_case', 'document', 'privacy'].includes(data.family)) throw new Error(`${key}: family non ammessa ${data.family}`);
  if (!['draft', 'review', 'published'].includes(data.status)) throw new Error(`${key}: status non ammesso ${data.status}`);
  if (data.indexing !== 'index') throw new Error(`${key}: questa guida pronta richiede indexing=index`);
  if (!['live', 'beta', 'roadmap'].includes(data.productStatus)) throw new Error(`${key}: productStatus non ammesso ${data.productStatus}`);
  if (!Number.isInteger(Number(data.order)) || Number(data.order) < 1) throw new Error(`${key}: order deve essere un intero positivo`);
  if (!/^\/.+\/$/.test(data.canonicalPath) || !/^\/.+\/$/.test(data.alternatePath)) throw new Error(`${key}: canonical/alternate devono essere route assolute con slash finale`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data.updatedAt)) throw new Error(`${key}: updatedAt deve essere YYYY-MM-DD`);
  if (state.canonicalPaths.has(data.canonicalPath)) throw new Error(`${key}: canonical duplicata ${data.canonicalPath}`);
  state.canonicalPaths.add(data.canonicalPath);
  if (!state.byTranslation.has(data.translationKey)) state.byTranslation.set(data.translationKey, []);
  state.byTranslation.get(data.translationKey).push({ key, ...data });
}

try {
  const files = await markdownFiles(guidesDirectory);
  const state = { canonicalPaths: new Set(), byTranslation: new Map() };
  const actualKeys = new Set();
  for (const filePath of files) {
    const key = relative(guidesDirectory, filePath).replace(/\\/g, '/').replace(/\.md$/, '');
    actualKeys.add(key);
    assertGuide(parseFrontmatter(await readFile(filePath, 'utf8'), filePath), key, state);
  }
  const missing = [...requiredKeys].filter((key) => !actualKeys.has(key));
  if (missing.length) throw new Error(`guide iniziali mancanti: ${missing.join(', ')}`);
  for (const [translationKey, variants] of state.byTranslation) {
    if (variants.length !== 2 || new Set(variants.map((variant) => variant.locale)).size !== 2) {
      throw new Error(`${translationKey}: servono esattamente una variante it e una en`);
    }
    const [first, second] = variants;
    if (first.alternatePath !== second.canonicalPath || second.alternatePath !== first.canonicalPath) {
      throw new Error(`${translationKey}: alternatePath non reciproci`);
    }
  }
  console.log(`SEO_GUIDES_GREEN ${files.length} guide editoriali, ${state.byTranslation.size} coppie IT/EN`);
} catch (error) {
  console.error(`SEO_GUIDES_RED ${error.message}`);
  process.exitCode = 1;
}
