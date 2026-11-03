// Dati del terminale interattivo: generati in build come /terminal.json e /en/terminal.json,
// scaricati dal browser solo quando si usa il prompt.
import { profile, mailto, calUrl } from '@salvatorelaspata/content/profile'
import { getBio } from '@salvatorelaspata/content/bio'
import { getProjects, getExperiences } from '@salvatorelaspata/content/util'
import { PROJECT_FILTERS } from '@salvatorelaspata/content/types'
import { useT, fmt, href, sectionHref, withBase, localePath, isoDate, type Lang } from '../i18n'
import { getPosts, postHref, readingTime } from './blog'
import { shortHash } from './hash'

/** Righe della scheda neofetch, condivise dalla home e dal comando `neofetch`. */
export const systemInfo = (
  lang: Lang,
  projectCount: number,
  postCount: number
): [string, string][] => {
  const t = useT(lang)
  const nf = t.home.neofetch
  // Il layer cloud e quello on-premise dello stack fanno da "sistema operativo"
  const os = getBio(lang)
    .stack.slice(1)
    .map((layer) => layer.name)
    .join(' / ')
  return [
    [nf.os, os],
    [nf.host, profile.company],
    [nf.role, profile.role[lang]],
    [nf.uptime, fmt(nf.uptimeValue, { years: profile.experienceYears })],
    [nf.location, fmt(nf.locationValue, { city: profile.city[lang], since: profile.inRomeSince })],
    [nf.team, fmt(nf.teamValue, { n: profile.teamSize })],
    [nf.shell, 'zsh'],
    [nf.projects, String(projectCount)],
    [nf.posts, String(postCount)],
    [nf.locales, 'it_IT, en_US'],
  ]
}

export const buildTerminalData = async (lang: Lang) => {
  const t = useT(lang)
  const bio = getBio(lang)
  const projects = getProjects(lang)
  const posts = await getPosts(lang)
  const other: Lang = lang === 'it' ? 'en' : 'it'

  return {
    lang,
    user: profile.firstName.toLowerCase(),
    name: profile.fullName,
    tagline: bio.tagline,
    headline: `${bio.headline.before}${bio.headline.code}${bio.headline.after}`,
    intro: bio.intro,
    motto: bio.motto,
    summary: bio.summary,
    facts: bio.facts.map(({ title, text }) => ({ title, text })),
    skills: bio.skills.map((group) => ({
      dir: group.title.toLowerCase().replace(/\s+/g, '-'),
      items: group.items.map(({ name, text }) => ({ name, text })),
    })),
    stack: bio.stack,
    system: systemInfo(lang, projects.length, posts.length),
    urls: {
      home: href('/', lang),
      blog: href('/blog/', lang),
      otherHome: href('/', other),
      about: sectionHref('about', lang),
      stack: sectionHref('stack', lang),
      projects: sectionHref('projects', lang),
      experience: sectionHref('experience', lang),
      contact: sectionHref('contact', lang),
    },
    projects: projects.map((p) => ({
      slug: p.slug,
      title: p.title,
      summary: p.summary,
      kind: t.projects.kinds[p.kind],
      filters: p.filters as string[],
      technologies: p.technologies,
      href: href(`/projects/${p.slug}/`, lang),
    })),
    filters: [...PROJECT_FILTERS] as string[],
    posts: posts.map((post) => ({
      slug: post.data.urlSlug,
      title: post.data.title,
      description: post.data.description,
      date: isoDate(post.data.pubDate),
      minutes: readingTime(post),
      tags: post.data.tags.map((tag) => t.blog.tags[tag]),
      href: postHref(post),
    })),
    experience: getExperiences(lang).map((exp) => ({
      hash: shortHash(`${exp.company}${exp.start}`),
      title: exp.title,
      company: exp.company,
      period: `${exp.start} – ${exp.end ?? t.home.now}`,
      summary: exp.summary,
    })),
    contact: {
      email: profile.email,
      mailto: mailto(),
      github: profile.github,
      linkedin: profile.linkedin,
      vcard: withBase(localePath(profile.vcardPath, lang)),
      bookings: bio.bookings.map((b) => ({
        title: b.title,
        duration: b.duration,
        audience: b.audience,
        url: calUrl(b.key as 'coffee' | 'roundtable', lang),
      })),
    },
    strings: {
      ...t.term,
      bookTitle: t.home.bookTitle,
      channels: t.home.channels,
      minRead: t.common.minRead,
    },
  }
}

export type TerminalData = Awaited<ReturnType<typeof buildTerminalData>>
