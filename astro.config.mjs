import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwind from "@astrojs/tailwind";
// import cloudflare from '@astrojs/cloudflare';

// TODO: cloudflare adapter not building, can use advanced mode when it does (so that worker can be run locally)
// https://astro.build/config
export default defineConfig({
  site: 'https://iainkirkpatrick.com',
  integrations: [mdx(), sitemap(), tailwind()],
  // output: 'server',
  // adapter: cloudflare()
});