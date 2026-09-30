import 'dotenv/config';
import node from '@astrojs/node';
import vercel from '@astrojs/vercel';
import { defineConfig, passthroughImageService } from 'astro/config';

export default defineConfig({
  site: process.env.SITE_URL || 'https://parralux-digital.vercel.app',
  output: 'static',
  // Existing public images are served unchanged; no runtime image optimizer is needed.
  image: {service: passthroughImageService()},
  // Vercel needs Build Output API artifacts; keep standalone output for local hosting.
  adapter: process.env.VERCEL === '1'
    ? vercel({maxDuration: 60})
    : node({mode: 'standalone'}),
});
