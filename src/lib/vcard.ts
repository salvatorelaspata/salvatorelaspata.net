import type { profile as defaultProfile } from '../data/profile'

type Profile = typeof defaultProfile
type Lang = 'it' | 'en'

const CRLF = '\r\n'

/** Escape dei valori testuali (RFC 2426 §4): backslash, virgola, punto e virgola, a capo. */
export const escapeText = (value: string) =>
  value.replace(/\\/g, '\\\\').replace(/,/g, '\\,').replace(/;/g, '\\;').replace(/\r?\n/g, '\\n')

/** Piega le righe oltre i 75 ottetti (RFC 2425 §5.8.1): CRLF + spazio, senza spezzare caratteri UTF-8. */
export const foldLine = (line: string) => {
  const encoder = new TextEncoder()
  if (encoder.encode(line).length <= 75) return line
  const parts: string[] = []
  let current = ''
  let size = 0
  for (const ch of line) {
    const len = encoder.encode(ch).length
    // dopo la prima riga lo spazio iniziale occupa un ottetto
    const limit = parts.length === 0 ? 75 : 74
    if (size + len > limit) {
      parts.push(current)
      current = ''
      size = 0
    }
    current += ch
    size += len
  }
  parts.push(current)
  return parts.join(`${CRLF} `)
}

const revStamp = (date: Date) => date.toISOString().replace(/\.\d{3}Z$/, 'Z')

/**
 * vCard 3.0 (la più compatibile con iOS e Android).
 * Contiene solo dati pubblici: niente telefono, indirizzo completo o data di nascita.
 */
export const buildVCard = (profile: Profile, lang: Lang, rev = new Date()) => {
  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `N:${escapeText(profile.lastName)};${escapeText(profile.firstName)};;;`,
    `FN:${escapeText(profile.fullName)}`,
    `ORG:${escapeText(profile.company)}`,
    `TITLE:${escapeText(profile.role[lang])}`,
    `EMAIL;TYPE=INTERNET:${profile.email}`,
    `URL:${profile.site}`,
    `X-SOCIALPROFILE;TYPE=github:${profile.github}`,
    `X-SOCIALPROFILE;TYPE=linkedin:${profile.linkedin}`,
    // fallback per le app che ignorano X-SOCIALPROFILE
    `URL:${profile.linkedin}`,
    `ADR;TYPE=WORK:;;;${escapeText(profile.city[lang])};;;`,
    `REV:${revStamp(rev)}`,
    'END:VCARD',
  ]
  return lines.map(foldLine).join(CRLF) + CRLF
}
