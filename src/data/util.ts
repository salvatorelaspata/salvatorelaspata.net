import { z } from 'zod'
import {
  PROJECT_FILTERS,
  PROJECT_KINDS,
  type Experience,
  type Locale,
  type Project,
  type ProjectKind,
  type Technology,
  type TechnologyCategory,
} from './types'

// ============ Projects ============

const RawProjectSchema = z.object({
  id: z.number(),
  slug: z.string(),
  title: z.string(),
  subtitle: z.string(),
  kind: z.enum(PROJECT_KINDS),
  featured: z.boolean().default(false),
  filters: z.array(z.enum(PROJECT_FILTERS)).min(1),
  img: z.string().optional(),
  icon: z.string().optional(),
  description: z.string(),
  summary: z.string(),
  technologies: z.array(z.string()).default([]),
  github: z.string().url().optional(),
  demo: z.string().url().optional(),
  npm: z.string().url().optional(),
  slides: z.string().url().optional(),
  en: z.object({
    subtitle: z.string(),
    summary: z.string(),
    description: z.string(),
  }),
})

/** Icona predefinita per tipo di progetto (copertina generata e righe). */
export const KIND_ICONS: Record<ProjectKind, string> = {
  npm: 'package',
  chrome: 'browser',
  slide: 'slides',
  docker: 'server',
  bot: 'chat',
  prototype: 'flask',
  project: 'blocks',
  learning: 'book',
}

const projectModules = import.meta.glob('../data/projects/*.json', { eager: true })
const markdownModules = import.meta.glob('../data/projects/*.md', { eager: true })

/** Tutti i progetti nella lingua richiesta, dal più recente (id più alto). */
export const getProjects = (locale: Locale): Project[] => {
  const projects: Project[] = []
  for (const path in projectModules) {
    const parsed = RawProjectSchema.safeParse((projectModules[path] as { default: unknown }).default)
    if (!parsed.success) {
      throw new Error(`Invalid project data at ${path}: ${JSON.stringify(parsed.error.flatten())}`)
    }
    const { en, icon, ...raw } = parsed.data
    const md = markdownModules[path.replace('.json', `.${locale}.md`)] as
      | { Content: Project['Content'] }
      | undefined
    projects.push({
      ...raw,
      ...(locale === 'en' ? en : {}),
      icon: icon ?? KIND_ICONS[raw.kind],
      Content: md?.Content,
    })
  }
  return projects.sort((a, b) => b.id - a.id)
}

/** Fino a `n` progetti che condividono almeno un filtro, i più affini per primi. */
export const getRelatedProjects = (project: Project, all: Project[], n = 3) =>
  all
    .filter(p => p.slug !== project.slug)
    .map(p => ({ p, score: p.filters.filter(f => project.filters.includes(f)).length }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || b.p.id - a.p.id)
    .slice(0, n)
    .map(({ p }) => p)

// ============ Technologies ============

export const TECH_CATEGORIES: TechnologyCategory[] = ['sap', 'languages', 'frameworks', 'nonsap', 'inf', 'other']

export const defaultSvg = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M0 6.064v11.872h12.13L24 6.064zm3.264 2.208h.005c.863.001 1.915.245 2.676.633l-.82 1.43c-.835-.404-1.255-.442-1.73-.467-.708-.038-1.064.215-1.069.488-.007.332.669.633 1.305.838.964.306 2.19.715 2.377 1.9L7.77 8.437h2.046l2.064 5.576-.007-5.575h2.37c2.257 0 3.318.764 3.318 2.519 0 1.575-1.09 2.514-2.936 2.514h-.763l-.01 2.094-3.588-.003-.25-.908c-.37.122-.787.189-1.23.189-.456 0-.885-.071-1.263-.2l-.358.919-2 .006.09-.462c-.029.025-.057.05-.087.074-.535.43-1.208.629-2.037.644l-.213.002a5.075 5.075 0 0 1-2.581-.675l.73-1.448c.79.467 1.286.572 1.956.558.347-.007.598-.07.761-.239a.557.557 0 0 0 .156-.369c.007-.376-.53-.553-1.185-.756-.531-.164-1.135-.389-1.606-.735-.559-.41-.825-.924-.812-1.65a1.99 1.99 0 0 1 .566-1.377c.519-.537 1.357-.863 2.363-.863zm10.597 1.67v1.904h.521c.694 0 1.247-.23 1.248-.964 0-.709-.554-.94-1.248-.94zm-5.087.767l-.748 2.362c.223.085.481.133.757.133.268 0 .52-.047.742-.126l-.736-2.37z"/></svg>`

/** Rende un logo monocromatico a 20px: niente title/class/size, fill = currentColor. */
export const monoSvg = (svg: string, size = 20) =>
  svg
    .replace(/<title>.*?<\/title>/gs, '')
    .replace(/\s(class|width|height|fill|stroke|style|xmlns:xlink)="[^"]*"/g, '')
    .replace(/<svg/, `<svg width="${size}" height="${size}" fill="currentColor" aria-hidden="true" focusable="false"`)

const techModules: Record<TechnologyCategory, Record<string, unknown>> = {
  sap: import.meta.glob('./tech/sap/*.js', { eager: true }),
  languages: import.meta.glob('./tech/languages/*.js', { eager: true }),
  frameworks: import.meta.glob('./tech/frameworks/*.js', { eager: true }),
  nonsap: import.meta.glob('./tech/nonsap/*.js', { eager: true }),
  inf: import.meta.glob('./tech/inf/*.js', { eager: true }),
  other: import.meta.glob('./tech/other/*.js', { eager: true }),
}

type RawTech = { id: number; title: string; link: string; svg?: string }

export const getTechnologies = (): Record<TechnologyCategory, Technology[]> =>
  Object.fromEntries(
    TECH_CATEGORIES.map(category => {
      const techs = Object.values(techModules[category])
        .map(m => (m as { default: RawTech }).default)
        .map(({ id, title, link, svg }) => {
          const learning = /\(learning\)/i.test(title)
          return { id, link, svg, learning, title: title.replace(/\s*\(learning\)\s*/i, '').trim() }
        })
        // prima le tecnologie in uso, poi quelle in studio
        .sort((a, b) => Number(a.learning) - Number(b.learning) || a.id - b.id)
      return [category, techs]
    }),
  ) as Record<TechnologyCategory, Technology[]>

// ============ Experiences ============

const experienceModules = import.meta.glob('../data/experiences/*.json', { eager: true })

export const getExperiences = (locale: Locale): Experience[] =>
  Object.entries(experienceModules)
    .filter(([path]) => path.endsWith(`.${locale}.json`))
    .map(([, m]) => (m as { default: Experience }).default)
    .sort((a, b) => b.index - a.index)
