import { defineCollection } from 'astro:content'
import { glob } from 'astro/loaders'
import { POSTS_BASE, blogSchema } from '@salvatorelaspata/content/blog'

// Gli articoli e il loro schema stanno in packages/content, condivisi con salvatorelaspata.dev
const blog = defineCollection({
  loader: glob({ base: POSTS_BASE, pattern: '**/*.md' }),
  schema: blogSchema,
})

export const collections = { blog }
