import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

const staticPaths = [
  '/',
  '/about/',
  '/security/',
  '/privacy/',
  '/terms/',
  '/delete-account/',
  '/partners/open-banking/',
  '/support/',
  '/en/',
  '/en/about/',
  '/en/security/',
  '/en/partners/open-banking/',
  '/en/support/',
];

export const GET: APIRoute = async () => {
  const guidePaths = (await getCollection('guides', ({ data }) => data.indexing === 'index'))
    .map((guide) => guide.data.canonicalPath);
  const paths = [...new Set([...staticPaths, ...guidePaths])];
  const urls = paths.map((path) => `<url><loc>https://groowy.app${path}</loc></url>`).join('');
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
