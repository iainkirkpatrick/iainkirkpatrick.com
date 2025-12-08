import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import cloudflare from "@astrojs/cloudflare";

import tailwind from "@astrojs/tailwind";

// https://astro.build/config
export default defineConfig({
  site: 'https://iainkirkpatrick.com',
  integrations: [mdx(), sitemap(), tailwind()],
  output: "server",
  adapter: cloudflare({
    mode: 'directory',
    routes: {
      include: [
        '/ask',
        '/embed',
      ]
    },
    sessions: {
      enabled: false,
    }
  })
});
