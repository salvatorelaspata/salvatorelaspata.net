#!/usr/bin/env node
// Verifica i contrasti WCAG 2.2 delle coppie di token in src/styles/global.css
// per i tre temi (green = :root, amber, mono). Esce con codice 1 se una coppia è sotto soglia.
// Uso: node scripts/contrast-check.mjs
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const css = readFileSync(
  fileURLToPath(new URL('../src/styles/global.css', import.meta.url)),
  'utf8'
)

/** Estrae le custom properties esadecimali del primo blocco che inizia con `selector {`. */
const readTokens = (selector) => {
  const start = css.indexOf(`${selector} {`)
  if (start === -1) throw new Error(`Blocco ${selector} non trovato`)
  const body = css.slice(start, css.indexOf('\n}', start))
  return Object.fromEntries(
    [...body.matchAll(/(--[\w-]+):\s*(#[0-9a-fA-F]{6})\b/g)].map((m) => [m[1], m[2]])
  )
}

const channel = (c) => {
  const s = c / 255
  return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
}
const luminance = (hex) => {
  const n = parseInt(hex.slice(1), 16)
  return (
    0.2126 * channel((n >> 16) & 255) + 0.7152 * channel((n >> 8) & 255) + 0.0722 * channel(n & 255)
  )
}
const ratio = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

// [testo/primo piano, sfondo, soglia, descrizione]
const PAIRS = [
  ['--fg', '--bg', 4.5, 'testo'],
  ['--fg', '--bg-2', 4.5, 'testo su barra/blocchi'],
  ['--dim', '--bg', 4.5, 'testo secondario'],
  ['--dim', '--bg-2', 4.5, 'testo secondario su barra/blocchi'],
  ['--accent', '--bg', 4.5, 'link e prompt'],
  ['--accent', '--bg-2', 4.5, 'link su blocchi'],
  ['--bg', '--accent', 4.5, 'barra di stato (testo scuro su accent)'],
  ['--path', '--bg', 4.5, 'percorsi'],
  ['--path', '--bg-2', 4.5, 'percorsi su blocchi'],
  ['--warn', '--bg', 4.5, 'hash e codice inline'],
  ['--err', '--bg', 4.5, 'errori'],
  ['--focus', '--bg', 3, 'anello di focus (1.4.11)'],
  ['--focus', '--bg-2', 3, 'anello di focus su blocchi'],
]

const green = readTokens(':root')
let failures = 0
for (const [theme, tokens] of [
  ['green', green],
  ['amber', { ...green, ...readTokens("[data-theme='amber']") }],
  ['mono', { ...green, ...readTokens("[data-theme='mono']") }],
]) {
  console.log(`\nTema ${theme}`)
  for (const [fg, bg, min, label] of PAIRS) {
    if (!tokens[fg] || !tokens[bg]) throw new Error(`Token mancante: ${fg} o ${bg}`)
    const r = ratio(tokens[fg], tokens[bg])
    const ok = r >= min
    if (!ok) failures++
    console.log(
      `${ok ? '  ok ' : 'FAIL '} ${r.toFixed(2).padStart(5)}:1 (min ${min}) ${fg} su ${bg} · ${label}`
    )
  }
}
if (failures) {
  console.error(`\n${failures} coppie sotto soglia`)
  process.exit(1)
}
console.log('\nTutti i contrasti sono a norma.')
