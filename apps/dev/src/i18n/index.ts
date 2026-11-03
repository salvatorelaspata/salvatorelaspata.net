import it from './it'
import en from './en'

export type Lang = 'it' | 'en'
export type Dict = typeof it

export const LANGS: Lang[] = ['it', 'en']
const dicts: Record<Lang, Dict> = { it, en }

export const toLang = (locale: string | undefined): Lang => (locale === 'en' ? 'en' : 'it')

export const useT = (locale: string | undefined): Dict => dicts[toLang(locale)]

/** Sostituisce i segnaposto `{nome}` in una stringa del dizionario. */
export const fmt = (str: string, vars: Record<string, string | number>) =>
  str.replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? `{${k}}`))

// ---------- URL ----------

const BASE = import.meta.env.BASE_URL.replace(/\/$/, '')

export const withBase = (path: string) => {
  if (/^(https?:|mailto:|tel:|#)/.test(path)) return path
  return `${BASE}${path.startsWith('/') ? path : `/${path}`}`
}

/** Percorso localizzato senza base: `/blog/` → `/en/blog/` per l'inglese. */
export const localePath = (path: string, lang: Lang) => {
  const clean = path.startsWith('/') ? path : `/${path}`
  return lang === 'en' ? `/en${clean === '/' ? '/' : clean}` : clean
}

/** Percorso localizzato con base, pronto per href. */
export const href = (path: string, lang: Lang) => withBase(localePath(path, lang))

/** Toglie base e prefisso di lingua da un pathname. */
export const stripLocale = (pathname: string) => {
  let p = pathname
  if (BASE && p.startsWith(BASE)) p = p.slice(BASE.length) || '/'
  if (p === '/en' || p.startsWith('/en/')) p = p.slice(3) || '/'
  return p
}

/** Ancora di una sezione della home nella lingua data, es. `/#progetti` o `/en/#projects`. */
export const sectionHref = (section: keyof Dict['ids'], lang: Lang) =>
  `${href('/', lang)}#${dicts[lang].ids[section]}`

/** Percorso "da shell" di una pagina: `/en/blog/x/` → `~/blog/x`. */
export const shellPath = (pathname: string) => {
  const p = stripLocale(pathname).replace(/\/$/, '')
  return p ? `~${p}` : '~'
}

// ---------- Date ----------

/** Data ISO (AAAA-MM-GG), come la stampa un terminale. */
export const isoDate = (date: Date) => date.toISOString().slice(0, 10)
