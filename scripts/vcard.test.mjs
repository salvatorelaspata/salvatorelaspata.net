// Test della vCard e del QR code. Vitest non è nel progetto: si usa node:test.
// Node 22.18+/24 esegue direttamente i .ts con solo annotazioni di tipo (type stripping).
// Uso: node --test scripts/
import { test } from 'node:test'
import assert from 'node:assert/strict'
import QRCode from 'qrcode'
import { buildVCard, escapeText, foldLine } from '../src/lib/vcard.ts'
import { profile } from '../src/data/profile.ts'

const REV = new Date('2026-11-02T10:00:00Z')

for (const lang of /** @type {const} */ (['it', 'en'])) {
  test(`vCard ${lang}: campi obbligatori e struttura`, () => {
    const vcard = buildVCard(profile, lang, REV)
    const lines = vcard.split('\r\n')
    assert.equal(lines[0], 'BEGIN:VCARD')
    assert.equal(lines[1], 'VERSION:3.0')
    assert.equal(lines.at(-2), 'END:VCARD')
    assert.equal(lines.at(-1), '', 'termina con CRLF')
    // righe "srotolate" (RFC 2425: CRLF + spazio = continuazione)
    const unfolded = vcard.replace(/\r\n /g, '')
    for (const field of ['N:La Spata;Salvatore;;;', 'FN:', 'ORG:', 'TITLE:', 'EMAIL;TYPE=INTERNET:', 'URL:', 'ADR;TYPE=WORK:', 'REV:']) {
      assert.ok(unfolded.includes(`\r\n${field}`), `manca ${field}`)
    }
    assert.ok(unfolded.includes(`TITLE:${profile.role[lang]}`))
    assert.ok(unfolded.includes(`X-SOCIALPROFILE;TYPE=github:${profile.github}\r\n`))
    assert.ok(unfolded.includes(`X-SOCIALPROFILE;TYPE=linkedin:${profile.linkedin}\r\n`))
    assert.ok(unfolded.includes(`ADR;TYPE=WORK:;;;${profile.city[lang]};;;`))
    assert.ok(unfolded.includes('REV:2026-11-02T10:00:00Z'))
  })
}

test('usa solo CRLF come fine riga', () => {
  const vcard = buildVCard(profile, 'it', REV)
  assert.equal(vcard.replace(/\r\n/g, '').includes('\n'), false, 'nessun LF isolato')
  assert.equal(vcard.includes('\r\r'), false)
})

test('nessuna riga supera i 75 ottetti', () => {
  for (const line of buildVCard(profile, 'it', REV).split('\r\n')) {
    assert.ok(new TextEncoder().encode(line).length <= 75, `riga troppo lunga: ${line}`)
  }
})

test('escape di virgola, punto e virgola, backslash e a capo', () => {
  assert.equal(escapeText('a,b;c\\d\ne'), 'a\\,b\\;c\\\\d\\ne')
  const vcard = buildVCard({ ...profile, company: 'ACME, S.p.A.; Roma' }, 'it', REV)
  assert.ok(vcard.includes('ORG:ACME\\, S.p.A.\\; Roma\r\n'))
})

test('la piegatura non spezza i caratteri UTF-8', () => {
  const folded = foldLine(`NOTE:${'è'.repeat(60)}`)
  for (const part of folded.split('\r\n ')) assert.ok(!part.includes('�'))
  assert.equal(folded.replace(/\r\n /g, ''), `NOTE:${'è'.repeat(60)}`)
})

test('il QR code generato non è vuoto', async () => {
  const url = new URL(profile.vcardPath, profile.site).toString()
  const svg = await QRCode.toString(url, { type: 'svg', errorCorrectionLevel: 'M', margin: 2 })
  assert.match(svg, /^<svg[^>]*viewBox="0 0 (\d+) \1"/)
  assert.ok(/<path[^>]*d="M[^"]{100,}"/.test(svg), 'il QR contiene moduli')
  const qr = QRCode.create(url, { errorCorrectionLevel: 'M' })
  assert.ok(qr.modules.size <= 41, `QR troppo denso: ${qr.modules.size} moduli`)
})
