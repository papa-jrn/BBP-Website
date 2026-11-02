import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/**
 * Case studies are the page RFP evaluators actually read. Each one is a
 * Markdown file in src/content/case-studies/ — the filename becomes the URL.
 */
const caseStudies = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/case-studies' }),
  schema: z.object({
    title: z.string(),
    client: z.string(),
    sector: z.string(),
    /** One sentence, used on cards and in search results. */
    summary: z.string(),
    year: z.string(),
    /** Live URL, when the site is still up. */
    url: z.string().optional(),
    /** What Bee Balm was responsible for. */
    role: z.array(z.string()).default([]),
    /** Hard numbers shown as a stat row. Keep these verifiable. */
    metrics: z.array(z.object({ value: z.string(), label: z.string() })).default([]),
    image: z.string().optional(),
    /** Private working note. Never rendered — safe for reminders to self. */
    editorNote: z.string().optional(),
    /** Lower sorts first. */
    order: z.number().default(50),
    draft: z.boolean().default(false),
  }),
});

export const collections = { caseStudies };
