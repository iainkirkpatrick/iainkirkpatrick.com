import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

import tailwind from "@astrojs/tailwind";

// https://astro.build/config
// Now using static mode since we're deploying to Workers with static assets
// The /ask API route is handled by our Workers script
export default defineConfig({
  site: 'https://iainkirkpatrick.com',
  integrations: [mdx(), sitemap(), tailwind()],
  output: "static",
});
