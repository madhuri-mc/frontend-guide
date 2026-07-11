import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://frontendguide-dev.vercel.app/', // your real live URL
  integrations: [sitemap()],
});