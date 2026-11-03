import { defineConfig } from 'astro/config';
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";
import {
  petrolioTheme,
  titleTransformer,
  rehypeCodeBlocks,
  rehypeCallouts,
  rehypeTables,
  rehypeBaseLinks,
} from './src/lib/markdown.mjs';

const base = process.env.BASE_PATH || '/';

// https://astro.build/config
export default defineConfig({
  site: 'https://salvatorelaspata.net',
  base,
  // applyBaseStyles: false → il base di Tailwind arriva da src/styles/global.css
  integrations: [tailwind({ applyBaseStyles: false }), sitemap()],
  markdown: {
    shikiConfig: {
      theme: petrolioTheme,
      // CDS (SAP CAP) non ha una grammatica in Shiki: la sintassi è vicina a TypeScript
      langAlias: { cds: 'typescript' },
      transformers: [titleTransformer],
    },
    rehypePlugins: [rehypeCodeBlocks, rehypeCallouts, rehypeTables, rehypeBaseLinks(base)],
  },
  i18n: {
    defaultLocale: 'it',
    locales: ['it', 'en'],
    routing: {
      prefixDefaultLocale: false  // '/' per italiano, '/en/' per inglese
    }
  }
});
