import type { APIRoute } from 'astro'
import { buildVCard } from '@salvatorelaspata/content/vcard'
import { profile } from '@salvatorelaspata/content/profile'

export const prerender = true

// In build diventa dist/en/salvatore-la-spata.vcf (il MIME lo decide il server: vedi _headers e nginx.conf)
export const GET: APIRoute = () =>
  new Response(buildVCard(profile, 'en'), {
    headers: { 'Content-Type': 'text/vcard; charset=utf-8' },
  })
