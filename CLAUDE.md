# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a personal portfolio website for salvatorelaspata.net, built with Astro, Tailwind CSS, and GSAP for animations. The site is a single-page application showcasing skills, technologies, projects, and professional experiences.

## Commands

### Development

- `npm run dev` - Start development server on localhost
- `npm run dev:host` - Start development server accessible on network
- `npm start` - Alias for `npm run dev`

### Checks

- `npm test` - vCard unit tests (`node:test`, `scripts/*.test.mjs`)
- `npm run check:contrast` - WCAG contrast of the colour tokens in light and dark

### Build & Preview

- `npm run build` - Type check with `astro check` then build for production
- `npm run preview` - Preview production build locally

### Docker

- Build: `docker build -t salvatorela/salvatorelaspata.net .`
- Run: `docker-compose up -d`
- The Docker build creates a multi-stage build: Node.js for building, nginx for serving
- Exposed port: 4321

### Cloudflare Workers

- `npm run cf:dev` - Build the site and run the Worker locally (`wrangler dev`, port 8787)
- `npm run cf:deploy` - Build and deploy with `wrangler deploy`
- `npm run cf:types` - Regenerate `worker/worker-configuration.d.ts` (gitignored) after changing `wrangler.jsonc`
- `npm run cf:check` - Regenerate types and type-check the Worker (`tsc -p worker`)

## Deployment Targets

The same static build (`dist/`) is deployed to three targets, all kept on purpose:

- **Cloudflare Workers** (production, salvatorelaspata.net): [wrangler.jsonc](wrangler.jsonc) serves `dist/` as static assets. The Worker script in [worker/index.ts](worker/index.ts) only runs for the routes in `assets.run_worker_first` (currently `/api/*`); everything else is served without invoking it. Static asset headers (CSP etc.) live in [public/_headers](public/_headers).
- **GitHub Pages**: [.github/workflows/deploy.yml](.github/workflows/deploy.yml), built with `BASE_PATH=/salvatorelaspata.net`.
- **Docker/nginx**: [.github/workflows/publish.yml](.github/workflows/publish.yml) pushes the image; headers are in [nginx/nginx.conf](nginx/nginx.conf).

Keep the Astro build fully static (no Cloudflare adapter/SSR) so GitHub Pages and nginx keep working. Worker-only features go under `/api/*` in `worker/`, and the frontend must degrade gracefully when those endpoints are missing. The Worker has its own [worker/tsconfig.json](worker/tsconfig.json); wrangler requires Node >= 22 (see `.node-version`).

## Architecture

Design "Petrolio Tecnico": the approved prototype and design board live in [design/salvatorelaspata-redesign/](design/salvatorelaspata-redesign/) (README, `design-system.html`, page prototypes). [src/styles/tokens.css](src/styles/tokens.css) comes from that package and is used as is; fixes go in [src/styles/global.css](src/styles/global.css).

### Pages

- `/` and `/en/` render [HomePage.astro](src/components/HomePage.astro): Hero (+ StackDiagram), About (with skills), TechList, projects (featured ProjectCard + filterable ProjectRow list), Timeline, latest BlogCard, Contact (BookingCard + VCard).
- `/projects/[slug]` and `/en/projects/[slug]` use [ProjectLayout.astro](src/layouts/ProjectLayout.astro).
- `/blog/`, `/blog/[urlSlug]` (and `/en/…`) use [BlogIndex.astro](src/components/BlogIndex.astro) and [ArticlePage.astro](src/components/ArticlePage.astro).
- `/rss.xml`, `/en/rss.xml`, `/salvatore-la-spata.vcf`, `/en/salvatore-la-spata.vcf` are static endpoints.
- Privacy (`/privacy/n8n`) and 404 use the same layout. `daily-notifications`, `dam-refresh`, `personal-chrome-extension`, `posti-sede`, `sapui5-explorer-extension` are standalone HTML pages outside the design system.

Every page goes through [BaseLayout.astro](src/layouts/BaseLayout.astro): meta, hreflang alternates, self-hosted fonts (latin subset only), anti-FOUC theme script, skip link, `<main id="main" tabindex="-1">`, Header/MobileNav/Footer/BackToTop/Spark/Motion. Pages whose translation has a different URL pass `alternates`.

### i18n

- Astro routing: Italian without prefix, English under `/en/`.
- All UI strings are in [src/i18n/it.ts](src/i18n/it.ts) and [src/i18n/en.ts](src/i18n/en.ts) (same shape, typed by `Dict`). No hard-coded text in components.
- Helpers in [src/i18n/index.ts](src/i18n/index.ts): `useT`, `fmt`, `href`/`withBase` (respect `BASE_PATH` for GitHub Pages), `sectionHref`, `mainNav`, `formatDate`.

### Data

- [src/data/profile.ts](src/data/profile.ts): single source for personal data (header, footer, hero, JSON-LD, vCard, Cal.com links).
- Projects: [src/data/projects/](src/data/projects/) `NN_slug.json` + `NN_slug.{it,en}.md`, loaded and validated (Zod) in [src/data/util.ts](src/data/util.ts). Fields: `id`, `slug`, `title`, `subtitle`, `kind`, `featured`, `filters`, `description`, `summary`, `technologies[]`, optional `github`/`demo`/`npm`/`slides`/`img`/`icon`, and `en: { subtitle, summary, description }`. Without `img`, [ProjectCover.astro](src/components/ProjectCover.astro) generates a deterministic SVG cover from the slug hash. Filter counts are computed at build time.
- Technologies: [src/data/tech/](src/data/tech/) (`sap`, `languages`, `frameworks`, `nonsap`, `inf`, `other`); a title ending in `(learning)` is shown as "in studio". Logos are rendered monochrome at 20px.
- Experiences: [src/data/experiences/](src/data/experiences/) `*.{it,en}.json`.
- Blog: content collection in [src/content.config.ts](src/content.config.ts); tags are limited to [src/data/blogTags.ts](src/data/blogTags.ts). `translationKey` links the two languages, `urlSlug` is the URL in each language, `draft: true` hides a post. Reading time is computed in [src/lib/blog.ts](src/lib/blog.ts).

### Markdown

[src/lib/markdown.mjs](src/lib/markdown.mjs) (wired in `astro.config.mjs`): Shiki theme with the `.code-block` colours, code blocks wrapped with file name (```` ```js title="file.js" ````) and Copy button, callouts from blockquotes starting with `**Nota.**`/`**Da provare.**`/`**Note.**`/`**Try it.**`, scrollable focusable tables, base-aware internal links. Shiki runs before these rehype plugins. No H1 in Markdown bodies.

### Theming, motion, accessibility

- Dark mode: `.dark` on `<html>`, colours from CSS custom properties in tokens.css mapped in [tailwind.config.mjs](tailwind.config.mjs) (`bg`, `surface`, `ink`, `muted`, `line`, `accent`…). Opacity modifiers (`bg-accent/50`) don't work with these tokens.
- Motion: [Motion.astro](src/components/Motion.astro), everything inside `gsap.matchMedia('(prefers-reduced-motion: no-preference)')`. Nothing starts hidden in the markup.
- WCAG 2.2 AA: one H1 per page, visible focus, targets ≥44px, `aria-pressed` on filters and theme toggle, `aria-expanded` on the mobile menu, live region for filter counts. Run `npm run check:contrast` after changing colour tokens.

## Configuration

### Astro Config ([astro.config.mjs](astro.config.mjs))

- Site URL: `https://salvatorelaspata.net`
- Integrations: Tailwind CSS (`applyBaseStyles: false`, the base comes from global.css), Sitemap
- Markdown: Shiki theme and rehype plugins from `src/lib/markdown.mjs`
- No SSR - purely static site generation (dynamic endpoints live in the Cloudflare Worker, see Deployment Targets)

### Tailwind Config ([tailwind.config.mjs](tailwind.config.mjs))

- Dark mode: `class` strategy
- Colours, font sizes (`text-step-*`), radii, shadows (`shadow-brut*`) and spacing map to tokens.css custom properties
- Fonts: Schibsted Grotesk (text) and JetBrains Mono (labels, code) via Fontsource

### TypeScript

- Uses Astro's strict TypeScript configuration (`astro/tsconfigs/strict`)

## Adding Content

- **Technology:** new `.js` file in the right `src/data/tech/` folder exporting `id`, `title`, `link`, `svg`.
- **Project:** `NN_slug.json` (schema above, with `kind`, `filters`, `summary` and the `en` block) plus `NN_slug.it.md` and `NN_slug.en.md` without H1. Higher IDs appear first.
- **Blog post:** `src/content/blog/<key>.it.md` and `<key>.en.md` with the same `translationKey`.

## Technical Notes

- The Cloudflare CSP is in [public/_headers](public/_headers) and must stay aligned with [nginx/nginx.conf](nginx/nginx.conf). There are no third-party scripts: Cal.com bookings are plain links.
- The contact QR code is generated at build time and points to the `.vcf` URL. The full vCard text would need a version 17 QR code (85 modules), which is unreadable at 144px.
