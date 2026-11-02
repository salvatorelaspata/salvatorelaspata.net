import { defineConfig } from 'astro/config';
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  site: 'https://salvatorelaspata.net',
  base: process.env.BASE_PATH || '/',
  // applyBaseStyles: false → il base di Tailwind arriva da src/styles/global.css
  integrations: [tailwind({ applyBaseStyles: false }), sitemap()],
  i18n: {
    defaultLocale: 'it',
    locales: ['it', 'en'],
    routing: {
      prefixDefaultLocale: false  // '/' per italiano, '/en/' per inglese
    }
  }
});