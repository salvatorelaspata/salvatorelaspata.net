import type { APIRoute } from 'astro'
import { buildVCard } from '@salvatorelaspata/content/vcard'
import { profile } from '@salvatorelaspata/content/profile'

// Stessa vCard di salvatorelaspata.net (il MIME lo decide il server: vedi public/_headers)
export const GET: APIRoute = () =>
  new Response(buildVCard(profile, 'it'), {
    headers: { 'Content-Type': 'text/vcard; charset=utf-8' },
  })
