import { getCollection, type CollectionEntry } from 'astro:content'
import { readingMinutes } from '@salvatorelaspata/content/blog'
import { href, type Lang } from '../i18n'

export type Post = CollectionEntry<'blog'>

/** Articoli pubblicati in una lingua, dal più recente. */
export const getPosts = async (lang: Lang) =>
  (await getCollection('blog', (e) => e.data.lang === lang && !e.data.draft)).sort(
    (a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime()
  )

export const readingTime = (post: Post) => readingMinutes(post.body)

export const postHref = (post: Post) => href(`/blog/${post.data.urlSlug}/`, post.data.lang)

/** Traduzione dell'articolo nell'altra lingua, se pubblicata. */
export const getTranslation = async (post: Post) => {
  const other: Lang = post.data.lang === 'it' ? 'en' : 'it'
  return (await getPosts(other)).find((p) => p.data.translationKey === post.data.translationKey)
}
