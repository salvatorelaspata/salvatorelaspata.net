#!/usr/bin/env node
// Verifica i contrasti WCAG 2.2 delle coppie di token in src/styles/tokens.css,
// nel tema chiaro (:root) e scuro (.dark). Esce con codice 1 se una coppia è sotto soglia.
// Uso: node scripts/contrast-check.mjs
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const css = readFileSync(fileURLToPath(new URL('../src/styles/tokens.css', import.meta.url)), 'utf8')

/** Estrae le custom properties esadecimali del primo blocco che inizia con `selector {`. */
const readTokens = selector => {
  const start = css.indexOf(`${selector} {`)
  if (start === -1) throw new Error(`Blocco ${selector} non trovato`)
  const body = css.slice(start, css.indexOf('\n}', start))
  return Object.fromEntries([...body.matchAll(/(--[\w-]+):\s*(#[0-9a-fA-F]{6})\b/g)].map(m => [m[1], m[2]]))
}

const light = readTokens(':root')
const dark = { ...light, ...readTokens('.dark') }

// Luminanza relativa e rapporto di contrasto (WCAG 2.2, definizioni "relative luminance" e "contrast ratio")
const channel = c => {
  const s = c / 255
  return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
}
const luminance = hex => {
  const n = parseInt(hex.slice(1), 16)
  return 0.2126 * channel((n >> 16) & 255) + 0.7152 * channel((n >> 8) & 255) + 0.0722 * channel(n & 255)
}
const ratio = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

// [testo/primo piano, sfondo, soglia, descrizione]
const PAIRS = [
  ['--text', '--bg', 4.5, 'testo su sfondo (1.4.3)'],
  ['--text', '--surface', 4.5, 'testo su card'],
  ['--text-muted', '--bg', 4.5, 'testo secondario su sfondo'],
  ['--text-muted', '--surface', 4.5, 'testo secondario su card'],
  ['--text-muted', '--surface-2', 4.5, 'testo secondario su fill tenue'],
  ['--link', '--bg', 4.5, 'link su sfondo'],
  ['--link', '--surface', 4.5, 'link su card'],
  ['--accent-fg', '--accent', 4.5, 'pulsante primario'],
  ['--accent-fg', '--accent-hover', 4.5, 'pulsante primario in hover'],
  ['--accent-ink', '--accent-soft', 4.5, 'testo su accent-soft (chip, callout)'],
  ['--link', '--accent-soft', 4.5, 'link su accent-soft'],
  ['--border', '--bg', 3, 'bordo dei controlli (1.4.11)'],
  ['--focus', '--bg', 3, 'anello di focus su sfondo (1.4.11)'],
  ['--focus', '--surface', 3, 'anello di focus su card'],
]

let failures = 0
for (const [theme, tokens] of [
  ['chiaro', light],
  ['scuro', dark],
]) {
  console.log(`\nTema ${theme}`)
  for (const [fg, bg, min, label] of PAIRS) {
    if (!tokens[fg] || !tokens[bg]) throw new Error(`Token mancante: ${fg} o ${bg}`)
    const r = ratio(tokens[fg], tokens[bg])
    // WCAG non ammette arrotondamenti: si confronta il valore esatto
    const ok = r >= min
    if (!ok) failures++
    console.log(`${ok ? '✓' : '✗'} ${r.toFixed(2).padStart(5)}:1  (min ${min})  ${fg} su ${bg}  ${label}`)
  }
}

if (failures) {
  console.error(`\n${failures} coppie sotto soglia.`)
  process.exit(1)
}
console.log('\nTutte le coppie rispettano WCAG 2.2 AA.')
