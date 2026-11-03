import { defineCollection, z } from 'astro:content'
import { glob } from 'astro/loaders'
import { BLOG_TAGS } from './data/blogTags'


const blog = defineCollection({
  loader: glob({ base: './src/content/blog', pattern: '**/*.md' }),
  schema: z.object({
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
  }),
})

export const collections = { blog }
