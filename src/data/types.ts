export type Locale = 'en' | 'it'
import type { AstroComponentFactory } from 'astro/runtime/server/index.js'
// ============ Projects ============

export interface Project {
  default: {
    id: number
    slug: string
    title: string
    subtitle: string
    img: string
    description: string
    technologies: string
    github?: string
    demo?: string
    npm?: string
    slides?: string
    Content: AstroComponentFactory
  }
}

// ============ Skills ============

export interface Skill {
  name: string
  icon: string
}
// ============ Technologies ============

export interface Technology {
  default: {
    id: number
    title: string
    link: string
    subtitle: string
    description: string
    bgColorIcon: string
    textColorIcon: string
    svg?: string
  }
}

export type TechnologyCategory =
  | 'languages'
  | 'frameworks'
  | 'sap'
  | 'nonsap'
  | 'inf'
  | 'other'

// ============ Experiences ============

export interface Experience {
  index: number
  title: string
  subtitle: string
  date: string
  current: boolean
  descriptions: string[]
}

// unused but maybe useful later
// ============ Education ============

export interface Education {
  title: string
  subtitle: string
  date: string
  descriptions: string[]
}

// ============ About ============

interface AboutFooterImg {
  type: 'img'
  src: string
  alt: string
}

interface AboutFooterChip {
  type: 'chip'
  items: string[]
}

interface AboutFooterTextWithIcon {
  type: 'textWithIcon'
  icon: string
  text: string
}

interface AboutItem {
  icon: string
  title: string
  description: string
  footer: AboutFooterImg | AboutFooterChip | AboutFooterTextWithIcon
}

export interface About {
  title: string
  description: string
  items: AboutItem[]
}
