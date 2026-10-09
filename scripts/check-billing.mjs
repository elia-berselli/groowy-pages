import { strict as assert } from 'node:assert';
import { readFile, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dir = resolve(root, 'billing');
const html = await readFile(resolve(dir, 'index.html'), 'utf8');
const home = html.match(/class="brand" href="([^"]+)"/)?.[1];
assert.equal(new URL(home, 'https://elia-berselli.github.io/groowy-pages/billing/').pathname, '/groowy-pages/');
assert.match(html, /name="robots" content="noindex,nofollow"/);
for (const match of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
  const path = match[1];
  if (path === '../' || path.startsWith('https://')) continue;
  await access(resolve(dir, path));
}
assert.match(html, /id="sign-in"[^>]*disabled/);
assert.match(html, /id="buy"[^>]*disabled/);
const page = await readFile(resolve(dir, 'page.mjs'), 'utf8');
assert.match(page, /config\.json/);
assert.match(page, /billing-checkout/);
assert.match(page, /get_billing_entitlement/);
const config = JSON.parse(await readFile(resolve(dir, 'config.example.json'), 'utf8'));
assert(!JSON.stringify(config).includes('service_role'));
assert(!JSON.stringify(config).includes('pdl_live_apikey'));
console.log('Billing hosting checks PASS: subpath, assets, noindex, disabled initial actions, server contracts, public config.');
