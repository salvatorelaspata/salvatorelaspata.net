import { getPosts, postHref } from './blog'
import { useT, withBase, type Lang } from '../i18n'
import { profile } from '@salvatorelaspata/content/profile'

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/** Feed RSS 2.0 degli articoli pubblicati in una lingua (scritto a mano, senza dipendenze). */
export const rssResponse = async (lang: Lang, site: URL) => {
  const t = useT(lang)
  const abs = (path: string) => new URL(path, site).toString()
  const posts = await getPosts(lang)
  const items = posts
    .map(
      p => `    <item>
      <title>${esc(p.data.title)}</title>
      <link>${abs(postHref(p))}</link>
      <guid isPermaLink="true">${abs(postHref(p))}</guid>
      <description>${esc(p.data.description)}</description>
      <pubDate>${p.data.pubDate.toUTCString()}</pubDate>
${p.data.tags.map(tag => `      <category>${esc(t.blog.tags[tag])}</category>`).join('\n')}
    </item>`,
    )
    .join('\n')
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${esc(`${profile.fullName} · Blog`)}</title>
    <link>${abs(withBase(lang === 'en' ? '/en/blog/' : '/blog/'))}</link>
    <atom:link href="${abs(withBase(lang === 'en' ? '/en/rss.xml' : '/rss.xml'))}" rel="self" type="application/rss+xml" />
    <description>${esc(t.blogPage.lead)}</description>
    <language>${lang}</language>
${items}
  </channel>
</rss>
`
  return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } })
}
