# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Monorepo (npm workspaces) for Salvatore La Spata's personal sites. Both are static Astro builds that share one content package:

- [apps/net/](apps/net/) — salvatorelaspata.net, the portfolio (design "Petrolio Tecnico"), Astro + Tailwind CSS + GSAP.
- [packages/content/](packages/content/) — `@salvatorelaspata/content`: profile, bio, projects, experiences, technologies, blog posts and their loaders/schemas. No UI.

The rule: what is true about Salvatore (facts, bio, skills, projects, posts) lives in `packages/content`; how a site shows it (labels, section copy, CTAs, layout, CSS, Markdown rendering) lives in that site's app. An app never imports from another app.

## Commands

Run from the repo root (they delegate to the workspaces), or inside a workspace with its own scripts.

### Development

- `npm run dev` - Start the salvatorelaspata.net dev server on localhost (`dev:host` to expose it on the network)
- `npm start` - Alias for `npm run dev`

### Checks

- `npm test` - vCard unit tests (`node:test`, `packages/content/test/*.test.mjs`)
- `npm run check:contrast` - WCAG contrast of the colour tokens in light and dark
- `npm run lint` / `npm run format` - ESLint / Prettier over `apps/*/src` and `packages/*/src`
- `npm run check -w @salvatorelaspata/content` - Type-check the content package (`tsc --noEmit`)

### Build & Preview

- `npm run build` - Type-check the content package, then build every app (each runs `astro check && astro build`)
- `npm run build:net` - Build salvatorelaspata.net only (output in `apps/net/dist/`)
- `npm run preview -w @salvatorelaspata/net` - Preview the production build locally

### Docker

- Build (from the repo root, the context must include `packages/`): `docker build -f apps/net/Dockerfile -t salvatorela/salvatorelaspata.net .`
- Run: `docker compose -f apps/net/docker-compose.yml up -d`
- Multi-stage build: Node.js for building, nginx for serving. Exposed port: 4321

### Cloudflare Workers

Run inside `apps/net` (or with `-w @salvatorelaspata/net`):

- `npm run cf:dev` - Build the site and run the Worker locally (`wrangler dev`, port 8787)
- `npm run cf:deploy` - Build and deploy with `wrangler deploy`
- `npm run cf:types` - Regenerate `worker/worker-configuration.d.ts` (gitignored) after changing `wrangler.jsonc`
- `npm run cf:check` - Regenerate types and type-check the Worker (`tsc -p worker`)

## Deployment Targets

The static build of salvatorelaspata.net (`apps/net/dist/`) is deployed to three targets, all kept on purpose:

- **Cloudflare Workers** (production): [apps/net/wrangler.jsonc](apps/net/wrangler.jsonc) serves `dist/` as static assets. The Worker script in [apps/net/worker/index.ts](apps/net/worker/index.ts) only runs for the routes in `assets.run_worker_first` (currently `/api/*`); everything else is served without invoking it. Static asset headers (CSP etc.) live in [apps/net/public/_headers](apps/net/public/_headers). Workers Builds settings: root directory `/`, build command `npm run build:net`, deploy command `npx wrangler deploy -c apps/net/wrangler.jsonc` (`npx wrangler versions upload -c apps/net/wrangler.jsonc` for non-production branches).
- **GitHub Pages**: [.github/workflows/deploy.yml](.github/workflows/deploy.yml), built with `BASE_PATH=/salvatorelaspata.net`.
- **Docker/nginx**: [.github/workflows/publish.yml](.github/workflows/publish.yml) pushes the image built from [apps/net/Dockerfile](apps/net/Dockerfile); headers are in [apps/net/nginx/nginx.conf](apps/net/nginx/nginx.conf).

Keep the Astro builds fully static (no Cloudflare adapter/SSR) so GitHub Pages and nginx keep working. Worker-only features go under `/api/*` in `worker/`, and the frontend must degrade gracefully when those endpoints are missing. The Worker has its own [apps/net/worker/tsconfig.json](apps/net/worker/tsconfig.json); wrangler requires Node >= 22 (see `.node-version`).

## Content package (`packages/content`)

Imported as `@salvatorelaspata/content/<file>` (the `exports` map points `./*` to `./src/*.ts`; no build step, Vite compiles it as source). Files under [packages/content/src/](packages/content/src/):

- [profile.ts](packages/content/src/profile.ts): single source for personal data (header, footer, hero, JSON-LD, vCard, Cal.com links).
- [bio.ts](packages/content/src/bio.ts): bio texts in both languages via `getBio(locale)`: tagline, kicker, headline, short/intro/summary bios, motto, about facts, skills, the layered stack and the booking formats (keys match `profile.cal`).
- Projects: [projects/](packages/content/src/projects/) `NN_slug.json` + `NN_slug.{it,en}.md`, loaded and validated (Zod) in [util.ts](packages/content/src/util.ts) (`getProjects`, `getRelatedProjects`). Fields: `id`, `slug`, `title`, `subtitle`, `kind`, `featured`, `filters`, `description`, `summary`, `technologies[]`, optional `github`/`demo`/`npm`/`slides`/`img`/`icon`, and `en: { subtitle, summary, description }`. Types in [types.ts](packages/content/src/types.ts).
- Technologies: [tech/](packages/content/src/tech/) (`sap`, `languages`, `frameworks`, `nonsap`, `inf`, `other`), loaded by `getTechnologies`; a title ending in `(learning)` is flagged `learning`.
- Experiences: [experiences/](packages/content/src/experiences/) `*.{it,en}.json`, loaded by `getExperiences`.
- Blog: posts in [posts/](packages/content/src/posts/); [blog.ts](packages/content/src/blog.ts) exports `blogSchema` and `POSTS_BASE`, which each app's `src/content.config.ts` uses for its `blog` collection. Tags are limited to [blogTags.ts](packages/content/src/blogTags.ts). `translationKey` links the two languages, `urlSlug` is the URL in each language, `draft: true` hides a post.
- [vcard.ts](packages/content/src/vcard.ts): vCard 3.0 builder used by the `.vcf` endpoints.

Content files are not scanned by Tailwind: never put class names meant for rendering in them.

## salvatorelaspata.net (`apps/net`)

Design "Petrolio Tecnico": the approved prototype and design board live in [apps/net/design/salvatorelaspata-redesign/](apps/net/design/salvatorelaspata-redesign/) (README, `design-system.html`, page prototypes). [tokens.css](apps/net/src/styles/tokens.css) comes from that package and is used as is; fixes go in [global.css](apps/net/src/styles/global.css). Paths below are relative to `apps/net/`.

### Pages

- `/` and `/en/` render [HomePage.astro](apps/net/src/components/HomePage.astro): Hero (+ StackDiagram), About (with skills), TechList, projects (featured ProjectCard + filterable ProjectRow list), Timeline, latest BlogCard, Contact (BookingCard + VCard).
- `/projects/[slug]` and `/en/projects/[slug]` use [ProjectLayout.astro](apps/net/src/layouts/ProjectLayout.astro). Without `img`, [ProjectCover.astro](apps/net/src/components/ProjectCover.astro) generates a deterministic SVG cover from the slug hash. Filter counts are computed at build time.
- `/blog/`, `/blog/[urlSlug]` (and `/en/…`) use [BlogIndex.astro](apps/net/src/components/BlogIndex.astro) and [ArticlePage.astro](apps/net/src/components/ArticlePage.astro). Reading time and post helpers are in [src/lib/blog.ts](apps/net/src/lib/blog.ts).
- `/rss.xml`, `/en/rss.xml`, `/salvatore-la-spata.vcf`, `/en/salvatore-la-spata.vcf` are static endpoints.
- Privacy (`/privacy/n8n`, data in `src/data/privacy/`) and 404 use the same layout. `daily-notifications`, `dam-refresh`, `personal-chrome-extension`, `posti-sede`, `sapui5-explorer-extension` are standalone HTML pages outside the design system.

Every page goes through [BaseLayout.astro](apps/net/src/layouts/BaseLayout.astro): meta, hreflang alternates, self-hosted fonts (latin subset only), anti-FOUC theme script, skip link, `<main id="main" tabindex="-1">`, Header/MobileNav/Footer/BackToTop/Spark/Motion. Pages whose translation has a different URL pass `alternates`.

### i18n

- Astro routing: Italian without prefix, English under `/en/`.
- All UI strings are in [src/i18n/it.ts](apps/net/src/i18n/it.ts) and [src/i18n/en.ts](apps/net/src/i18n/en.ts) (same shape, typed by `Dict`). No hard-coded text in components.
- UI strings are labels, section titles/intros, CTAs and accessibility text for this design. Text about Salvatore (bio, skills, booking formats) is content and goes in `packages/content`.
- Helpers in [src/i18n/index.ts](apps/net/src/i18n/index.ts): `useT`, `fmt`, `href`/`withBase` (respect `BASE_PATH` for GitHub Pages), `sectionHref`, `mainNav`, `formatDate`.

### Markdown

[src/lib/markdown.mjs](apps/net/src/lib/markdown.mjs) (wired in `astro.config.mjs`): Shiki theme with the `.code-block` colours, code blocks wrapped with file name (```` ```js title="file.js" ````) and Copy button, callouts from blockquotes starting with `**Nota.**`/`**Da provare.**`/`**Note.**`/`**Try it.**`, scrollable focusable tables, base-aware internal links. Shiki runs before these rehype plugins. No H1 in Markdown bodies. Tailwind scans `.mjs` files so the classes these plugins emit are generated.

### Theming, motion, accessibility

- Dark mode: `.dark` on `<html>`, colours from CSS custom properties in tokens.css mapped in [tailwind.config.mjs](apps/net/tailwind.config.mjs) (`bg`, `surface`, `ink`, `muted`, `line`, `accent`…). Opacity modifiers (`bg-accent/50`) don't work with these tokens. Colours, font sizes (`text-step-*`), radii, shadows (`shadow-brut*`) and spacing map to tokens.css custom properties.
- Fonts: Schibsted Grotesk (text) and JetBrains Mono (labels, code) via Fontsource.
- Motion: [Motion.astro](apps/net/src/components/Motion.astro), everything inside `gsap.matchMedia('(prefers-reduced-motion: no-preference)')`. Nothing starts hidden in the markup.
- WCAG 2.2 AA: one H1 per page, visible focus, targets ≥44px, `aria-pressed` on filters and theme toggle, `aria-expanded` on the mobile menu, live region for filter counts. Run `npm run check:contrast` after changing colour tokens.

### Configuration

- [astro.config.mjs](apps/net/astro.config.mjs): site `https://salvatorelaspata.net`, Tailwind (`applyBaseStyles: false`, the base comes from global.css), Sitemap, Shiki theme and rehype plugins from `src/lib/markdown.mjs`, i18n routing. No SSR.
- TypeScript: Astro's strict configuration (`astro/tsconfigs/strict`) in every workspace.

## Adding Content

All in `packages/content/src/`; every app picks it up on its next build.

- **Technology:** new `.js` file in the right `tech/` folder exporting `id`, `title`, `link`, `svg`.
- **Project:** `projects/NN_slug.json` (schema above, with `kind`, `filters`, `summary` and the `en` block) plus `NN_slug.it.md` and `NN_slug.en.md` without H1. Higher IDs appear first.
- **Blog post:** `posts/<key>.it.md` and `<key>.en.md` with the same `translationKey`.
- **Bio, skills, booking formats:** [bio.ts](packages/content/src/bio.ts), both languages.

## Technical Notes

- The Cloudflare CSP is in [apps/net/public/_headers](apps/net/public/_headers) and must stay aligned with [apps/net/nginx/nginx.conf](apps/net/nginx/nginx.conf). There are no third-party scripts: Cal.com bookings are plain links.
- The contact QR code is generated at build time and points to the `.vcf` URL. The full vCard text would need a version 17 QR code (85 modules), which is unreadable at 144px.
