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
