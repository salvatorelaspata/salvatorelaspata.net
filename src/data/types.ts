import type { AstroComponentFactory } from 'astro/runtime/server/index.js'

export type Locale = 'en' | 'it'

// ============ Projects ============

export const PROJECT_KINDS = ['npm', 'chrome', 'slide', 'docker', 'bot', 'prototype', 'project', 'learning'] as const
export type ProjectKind = (typeof PROJECT_KINDS)[number]

export const PROJECT_FILTERS = ['sap', 'npm', 'chrome', '3d', 'slide', 'learning', 'altro'] as const
export type ProjectFilter = (typeof PROJECT_FILTERS)[number]

/** Progetto già localizzato nella lingua richiesta. */
export interface Project {
  id: number
  slug: string
  title: string
  subtitle: string
  kind: ProjectKind
  featured: boolean
  filters: ProjectFilter[]
  /** Immagine reale; se manca si usa la copertina generata (ProjectCover). */
  img?: string
  /** Icona del tipo di progetto (nome di Icon.astro). */
  icon: string
  description: string
  summary: string
  technologies: string[]
  github?: string
  demo?: string
  npm?: string
  slides?: string
  Content?: AstroComponentFactory
}

// ============ Technologies ============

export interface Technology {
  id: number
  title: string
  link: string
  svg?: string
  /** "in studio": dal suffisso "(learning)" nel titolo del file dati */
  learning: boolean
}

export type TechnologyCategory = 'sap' | 'languages' | 'frameworks' | 'nonsap' | 'inf' | 'other'

// ============ Experiences ============

export interface Experience {
  index: number
  title: string
  company: string
  location: string
  start: string
  end: string | null
  current: boolean
  summary: string
  tags: string[]
  details: string[]
}
