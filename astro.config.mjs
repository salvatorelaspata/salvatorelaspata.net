import { defineConfig } from 'astro/config';
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  site: 'https://salvatorelaspata.net',
  base: process.env.BASE_PATH || '/',
  integrations: [tailwind(), sitemap()]
});