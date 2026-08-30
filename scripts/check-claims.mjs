#!/usr/bin/env node

/**
 * Contract test per il Public Evidence Registry.
 *
 * Il registry è intenzionalmente leggibile senza dipendenze esterne: viene
 * eseguito sia in CI sia prima del build Astro. Non certifica la verità di una
 * claim; verifica che ogni claim pubblicabile abbia un'identità, uno stato,
 * una revisione e riferimenti di evidenza espliciti.
 */

import { readdir, readFile } from 'node:fs/promises';
import { join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDirectory = resolve(fileURLToPath(new URL('.', import.meta.url)));
const repositoryDirectory = resolve(scriptDirectory, '..');
const claimsDirectory = join(repositoryDirectory, 'astro', 'src', 'content', 'claims');
const requiredFields = [
  'claimId',
  'status',
  'area',
  'evidenceRefs',
  'verifiedAt',
  'reviewer',
  'locales',
];
const allowedStatuses = new Set(['live', 'beta', 'roadmap', 'prohibited']);

async function markdownFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...await markdownFiles(path));
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      files.push(path);
    }
  }

  return files.sort();
}

function parseValue(rawValue) {
  const value = rawValue.trim();
  if (value.startsWith('[') && value.endsWith(']')) {
    const body = value.slice(1, -1).trim();
    if (!body) return [];
    return body.split(',').map((item) => item.trim().replace(/^['"]|['"]$/g, ''));
  }

  return value.replace(/^['"]|['"]$/g, '');
}

function parseFrontmatter(source, filePath) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!match) {
    throw new Error(`${relative(repositoryDirectory, filePath)}: frontmatter mancante`);
  }

  const data = {};
  for (const line of match[1].split(/\r?\n/)) {
    const separator = line.indexOf(':');
    if (separator <= 0) continue;
    const key = line.slice(0, separator).trim();
    data[key] = parseValue(line.slice(separator + 1));
  }
  return data;
}

function assertClaim(data, filePath, seenIds) {
  const label = relative(repositoryDirectory, filePath);
  const missing = requiredFields.filter((field) => !(field in data));
  if (missing.length) {
    throw new Error(`${label}: campi mancanti: ${missing.join(', ')}`);
  }

  if (typeof data.claimId !== 'string' || !data.claimId.trim()) {
    throw new Error(`${label}: claimId vuoto`);
  }
  if (seenIds.has(data.claimId)) {
    throw new Error(`${label}: claimId duplicato: ${data.claimId}`);
  }
  seenIds.add(data.claimId);

  if (!allowedStatuses.has(data.status)) {
    throw new Error(`${label}: status non ammesso: ${data.status}`);
  }
  if (!Array.isArray(data.evidenceRefs) || data.evidenceRefs.some((ref) => !ref)) {
    throw new Error(`${label}: evidenceRefs deve essere un array di riferimenti non vuoti`);
  }
  if ((data.status === 'live' || data.status === 'beta') && data.evidenceRefs.length === 0) {
    throw new Error(`${label}: ${data.status} richiede almeno una evidenceRef`);
  }
  if (!Array.isArray(data.locales) || data.locales.length === 0) {
    throw new Error(`${label}: locales deve contenere almeno una lingua`);
  }
  if (data.locales.includes('en') && (!data.titleEn || !data.descriptionEn)) {
    throw new Error(`${label}: una claim en deve avere titleEn e descriptionEn`);
  }
  if (typeof data.verifiedAt !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(data.verifiedAt)) {
    throw new Error(`${label}: verifiedAt deve essere YYYY-MM-DD`);
  }
  if (typeof data.reviewer !== 'string' || !data.reviewer.trim()) {
    throw new Error(`${label}: reviewer vuoto`);
  }
}

try {
  const files = await markdownFiles(claimsDirectory);
  const seenIds = new Set();
  for (const filePath of files) {
    const data = parseFrontmatter(await readFile(filePath, 'utf8'), filePath);
    assertClaim(data, filePath, seenIds);
  }

  // Verifica integrità referenziale delle guide verso le claims
  const guidesDirectory = join(repositoryDirectory, 'astro', 'src', 'content', 'guides');
  const guideFiles = await markdownFiles(guidesDirectory);
  let checkedRefs = 0;
  for (const filePath of guideFiles) {
    const data = parseFrontmatter(await readFile(filePath, 'utf8'), filePath);
    const label = relative(repositoryDirectory, filePath);
    if (!Array.isArray(data.claimRefs) || data.claimRefs.length === 0) {
      throw new Error(`${label}: claimRefs assente o vuoto`);
    }
    for (const ref of data.claimRefs) {
      if (!seenIds.has(ref)) {
        throw new Error(`${label}: claimRef sconosciuta o non registrata: ${ref}`);
      }
      checkedRefs += 1;
    }
  }

  console.log(`CLAIMS_GREEN ${files.length} claims e ${checkedRefs} riferimenti in ${guideFiles.length} guide verificati`);
} catch (error) {
  if (error?.code === 'ENOENT') {
    console.error('CLAIMS_RED registry_missing');
  } else {
    console.error(`CLAIMS_RED ${error.message}`);
  }
  process.exitCode = 1;
}
