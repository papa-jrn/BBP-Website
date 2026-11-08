// @ts-check
import { defineConfig, envField } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  // Needed for canonical URLs and for the generated sitemap. The previous
  // sitemap was hand-written and silently missed every case study page.
  site: 'https://beebalmproductions.com',

  // Astro 7 defaults this to 'jsx', which collapses whitespace at line
  // boundaries. On prose that silently eats the space before an inline link
  // whenever the tag starts a new source line — "Email<a>info@..." was one.
  compressHTML: true,

  // The site stays static. The adapter exists for one route — /api/contact —
  // which opts out of prerendering. Enquiries used to go through FormSubmit,
  // a free relay that accepted submissions and then silently failed to
  // deliver them for three weeks with no log to show for it.
  adapter: vercel(),

  integrations: [sitemap()],

  env: {
    schema: {
      // Read at runtime inside the function rather than inlined at build
      // time, so rotating a key does not require a rebuild.
      RESEND_API_KEY: envField.string({ context: 'server', access: 'secret', optional: true }),
      CONTACT_FROM_EMAIL: envField.string({ context: 'server', access: 'secret', optional: true }),
      CONTACT_TO_EMAIL: envField.string({ context: 'server', access: 'secret', optional: true }),

      // Optional. With no secret the challenge is skipped and the form keeps
      // working; see src/lib/contact.ts for why it fails open.
      TURNSTILE_SECRET_KEY: envField.string({ context: 'server', access: 'secret', optional: true }),
    },
  },

  vite: {
    plugins: [tailwindcss()]
  }
});
