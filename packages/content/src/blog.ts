import { z } from 'astro/zod'
import { BLOG_TAGS } from './blogTags'

/** Cartella degli articoli vista dalla root di un'app in apps/ (base del loader glob di Astro). */
export const POSTS_BASE = '../../packages/content/src/posts'

/** Frontmatter degli articoli: ogni app lo usa nella collection `blog` del suo content.config.ts. */
export const blogSchema = z.object({
  title: z.string(),
  // 140–160 caratteri: usata anche come meta description
  description: z.string(),
  pubDate: z.coerce.date(),
  updatedDate: z.coerce.date().optional(),
  tags: z.array(z.enum(BLOG_TAGS)).default([]),
  lang: z.enum(['it', 'en']),
  // uguale nelle due lingue: collega l'articolo alla sua traduzione
  translationKey: z.string(),
  // slug dell'URL nella lingua dell'articolo (mantiene gli URL esistenti)
  urlSlug: z.string(),
  cover: z.object({ icon: z.string() }).optional(),
  relatedProject: z.string().optional(),
  draft: z.boolean().default(false),
})

/** Minuti di lettura a ~200 parole al minuto (blocchi di codice inclusi). */
export const readingMinutes = (body = '') => {
  const words = body
    .replace(/^---[\s\S]*?---/, '')
    .replace(/[#>*_`[\]()|-]/g, ' ')
    .split(/\s+/)
    .filter(Boolean).length
  return Math.max(1, Math.round(words / 200))
}

/** Slug per i filtri: "SAP BTP" → "sap-btp", "Accessibilità" → "accessibilita". */
export const tagSlug = (tag: string) =>
  tag.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, '-')
