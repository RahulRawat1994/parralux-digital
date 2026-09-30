import 'dotenv/config';
import node from '@astrojs/node';
import { defineConfig, passthroughImageService } from 'astro/config';

export default defineConfig({
  // Replace this with your production origin before deployment.
  site: process.env.SITE_URL || 'https://example.com',
  output: 'static',
  // Existing public images are served unchanged; no runtime image optimizer is needed.
  image: {service: passthroughImageService()},
  adapter: node({mode: 'standalone'}),
});
