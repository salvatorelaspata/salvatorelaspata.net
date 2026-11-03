import { defineCollection } from 'astro:content'
import { glob } from 'astro/loaders'
import { POSTS_BASE, blogSchema } from '@salvatorelaspata/content/blog'

// Stessi articoli di salvatorelaspata.net: posts e schema stanno in packages/content
const blog = defineCollection({
  loader: glob({ base: POSTS_BASE, pattern: '**/*.md' }),
  schema: blogSchema,
})

export const collections = { blog }
