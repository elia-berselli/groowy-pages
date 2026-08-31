import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const claims = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/claims' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    titleEn: z.string().optional(),
    descriptionEn: z.string().optional(),
    claimId: z.string(),
    status: z.enum(['live', 'beta', 'roadmap', 'prohibited']),
    area: z.enum(['product', 'security', 'privacy', 'legal', 'partner']),
    evidenceRefs: z.array(z.string()),
    verifiedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    reviewer: z.string(),
    locales: z.array(z.string()).min(1),
  }),
});

const guides = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/guides' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    h1: z.string(),
    eyebrow: z.string(),
    locale: z.enum(['it', 'en']),
    translationKey: z.string().min(1),
    canonicalPath: z.string().regex(/^\/.+\/$/),
    alternatePath: z.string().regex(/^\/.+\/$/),
    searchIntent: z.string().min(1),
    family: z.enum(['guide', 'use_case', 'document', 'privacy']),
    status: z.enum(['draft', 'review', 'published']),
    indexing: z.enum(['index', 'noindex']),
    productStatus: z.enum(['live', 'beta', 'roadmap']),
    order: z.number().int().positive(),
    claimRefs: z.array(z.string()).min(1),
    evidenceRefs: z.array(z.string()).min(1),
    author: z.string().min(1),
    reviewer: z.string().min(1),
    updatedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  }),
});

export const collections = { claims, guides };
