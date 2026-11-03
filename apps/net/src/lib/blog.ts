import { getCollection, type CollectionEntry } from 'astro:content'
import { readingMinutes, tagSlug } from '@salvatorelaspata/content/blog'
import { href, type Lang } from '../i18n'

export type Post = CollectionEntry<'blog'>

/** Articoli pubblicati in una lingua, dal più recente. */
export const getPosts = async (lang: Lang) =>
  (await getCollection('blog', e => e.data.lang === lang && !e.data.draft)).sort(
    (a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime(),
  )

/** Minuti di lettura dell'articolo (calcolo in packages/content). */
export const readingTime = (post: Post) => readingMinutes(post.body)

export const postHref = (post: Post) => href(`/blog/${post.data.urlSlug}`, post.data.lang)

export { tagSlug }

/** Traduzione dell'articolo nell'altra lingua, se pubblicata. */
export const getTranslation = async (post: Post) => {
  const other: Lang = post.data.lang === 'it' ? 'en' : 'it'
  return (await getPosts(other)).find(p => p.data.translationKey === post.data.translationKey)
}

/** Fino a `n` articoli correlati: prima quelli con tag in comune, poi i più recenti. */
export const getRelatedPosts = (post: Post, all: Post[], n = 3) =>
  all
    .filter(p => p.id !== post.id)
    .map(p => ({ p, score: p.data.tags.filter(t => post.data.tags.includes(t)).length }))
    .sort((a, b) => b.score - a.score || b.p.data.pubDate.getTime() - a.p.data.pubDate.getTime())
    .slice(0, n)
    .map(({ p }) => p)
