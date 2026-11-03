// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  // Needed for canonical URLs and for the generated sitemap. The previous
  // sitemap was hand-written and silently missed every case study page.
  site: 'https://beebalmproductions.com',

  // Astro 7 defaults this to 'jsx', which collapses whitespace at line
  // boundaries. On prose that silently eats the space before an inline link
  // whenever the tag starts a new source line — "Email<a>info@..." was one.
  compressHTML: true,
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()]
  }
});