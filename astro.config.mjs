// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  // Needed for canonical URLs and for the generated sitemap. The previous
  // sitemap was hand-written and silently missed every case study page.
  site: 'https://beebalmproductions.com',
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()]
  }
});