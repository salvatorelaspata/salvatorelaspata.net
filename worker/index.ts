// Entry point del Worker Cloudflare.
// Gira solo per le rotte elencate in assets.run_worker_first (wrangler.jsonc);
// tutto il resto è servito direttamente dagli asset statici di Astro (dist/).

const json = (body: unknown, status = 200) =>
  Response.json(body, {
    status,
    headers: {
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  })

export default {
  async fetch(request, env) {
    const url = new URL(request.url)

    if (url.pathname === '/api/health') {
      return json({
        status: 'ok',
        runtime: 'cloudflare-workers',
        colo: request.cf?.colo ?? null,
        timestamp: new Date().toISOString(),
      })
    }

    if (url.pathname.startsWith('/api/')) {
      return json({ error: 'Not found' }, 404)
    }

    return env.ASSETS.fetch(request)
  },
} satisfies ExportedHandler<Env>
