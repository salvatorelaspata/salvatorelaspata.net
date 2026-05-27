---

Piano: Sezione Blog per salvatorelaspata.net

Contesto raccolto

- Nessun src/content.config.ts esistente — i progetti usano ancora import.meta.glob() da JSON+MD
- I18n strutturato per URL: / = IT, /en/ = EN (pattern già usato in src/pages/en/)
- I file bilingue esistenti usano suffisso: cube-analyst.it.json, cube-analyst.en.json → riuso stesso pattern
- Astro 5 con glob() loader + Zod schema è la best practice ufficiale

---

Approccio consigliato: Content Collections + glob() loader

La strategia più allineata al tuo progetto esistente e alle best practices Astro 2025.

---

Struttura file proposta

src/
├── content.config.ts ← NUOVO: definisce la collection "blog"
├── content/
│ └── blog/
│ ├── 01_primo-post.it.md ← post IT (frontmatter + contenuto)
│ ├── 01_primo-post.en.md ← versione EN
│ └── ...
├── pages/
│ ├── blog/
│ │ ├── index.astro ← lista post IT
│ │ └── [slug].astro ← dettaglio post IT
│ └── en/
│ └── blog/
│ ├── index.astro ← lista post EN
│ └── [slug].astro ← dettaglio post EN
├── landingpage/
│ └── Blog.astro ← sezione preview nella homepage (ultimi 3 post)
└── components/
└── CardBlog.astro ← card riusabile per preview post

---

Schema frontmatter (Zod)

// src/content.config.ts
const blog = defineCollection({
loader: glob({ base: './src/content/blog', pattern: '\*_/_.md' }),
schema: ({ image }) => z.object({
title: z.string(),
description: z.string(),
pubDate: z.coerce.date(),
updatedDate: z.coerce.date().optional(),
tags: z.array(z.string()).default([]),
draft: z.boolean().default(false),
cover: image().optional(),
lang: z.enum(['it', 'en']),
}),
})

---

Fasi di implementazione

┌──────┬─────────────────────────────────────────┬───────────────────────────────────────────┐
│ Fase │ Cosa │ Dove │
├──────┼─────────────────────────────────────────┼───────────────────────────────────────────┤
│ 1 │ content.config.ts + 2 post di esempio │ src/content.config.ts, src/content/blog/ │
├──────┼─────────────────────────────────────────┼───────────────────────────────────────────┤
│ 2 │ Pagina lista /blog e /en/blog │ src/pages/blog/index.astro + EN │
├──────┼─────────────────────────────────────────┼───────────────────────────────────────────┤
│ 3 │ Pagina dettaglio /blog/[slug] e EN │ src/pages/blog/[slug].astro + EN │
├──────┼─────────────────────────────────────────┼───────────────────────────────────────────┤
│ 4 │ Componenti CardBlog.astro + layout post │ src/components/ │
├──────┼─────────────────────────────────────────┼───────────────────────────────────────────┤
│ 5 │ Sezione preview nella homepage │ src/landingpage/Blog.astro in index.astro │
├──────┼─────────────────────────────────────────┼───────────────────────────────────────────┤
│ 6 │ Link "Blog" nel Footer/Nav │ src/landingpage/Footer.astro │
└──────┴─────────────────────────────────────────┴───────────────────────────────────────────┘

---

Scelte di design

- Filtro lingua: ogni .md ha lang: 'it'|'en' nel frontmatter → getCollection('blog', e => e.data.lang === 'it')
- Slug: generato automaticamente dal nome file (es. 01_primo-post → primo-post) oppure override con slug nel
  frontmatter
- Draft: i post con draft: true esclusi in produzione (!e.data.draft)
- Ordinamento: per pubDate decrescente (più recenti prima), coerente con i progetti

---

Trade-off principale

Unica collection con filtro lang (piano proposto) vs due collection separate (blog-it, blog-en):

- Con lang nel frontmatter → più semplice, un solo file config, pattern già usato nel progetto
- Due collection separate → più isolamento TypeScript, ma doppia configurazione
