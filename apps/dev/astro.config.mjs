import { defineConfig } from 'astro/config'
import sitemap from '@astrojs/sitemap'

const site = 'https://salvatorelaspata.dev'

// Progetti e articoli hanno il canonical su salvatorelaspata.net (stesso contenuto):
// nella sitemap restano solo le pagine proprie di questo sito.
const ownPage = (page) => !/\/(projects|blog)\/[^/]+\/$/.test(new URL(page).pathname)

// https://astro.build/config
export default defineConfig({
  site,
  integrations: [sitemap({ filter: ownPage })],
  markdown: {
    shikiConfig: {
      theme: 'github-dark-default',
      // CDS (SAP CAP) non ha una grammatica in Shiki: la sintassi è vicina a TypeScript
      langAlias: { cds: 'typescript' },
    },
  },
  i18n: {
    defaultLocale: 'it',
    locales: ['it', 'en'],
    routing: {
      prefixDefaultLocale: false, // '/' per italiano, '/en/' per inglese
    },
  },
})
