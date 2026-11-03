# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Monorepo (npm workspaces) for Salvatore La Spata's personal sites. Both are static Astro builds that share one content package:

- [apps/net/](apps/net/) — salvatorelaspata.net, the portfolio (design "Petrolio Tecnico"), Astro + Tailwind CSS + GSAP.
- [apps/dev/](apps/dev/) — salvatorelaspata.dev, the same content as a terminal (plain CSS, no framework on the client).
- [packages/content/](packages/content/) — `@salvatorelaspata/content`: profile, bio, projects, experiences, technologies, blog posts and their loaders/schemas. No UI.

The rule: what is true about Salvatore (facts, bio, skills, projects, posts) lives in `packages/content`; how a site shows it (labels, section copy, CTAs, layout, CSS, Markdown rendering) lives in that site's app. An app never imports from another app.

## Commands

Run from the repo root (they delegate to the workspaces), or inside a workspace with its own scripts.

### Development

- `npm run dev` - Start the salvatorelaspata.net dev server on localhost:4321 (`dev:host` to expose it on the network)
- `npm run dev:dev` - Start the salvatorelaspata.dev dev server on localhost:4322
- `npm start` - Alias for `npm run dev`

### Checks

- `npm test` - vCard unit tests (`node:test`, `packages/content/test/*.test.mjs`)
- `npm run check:contrast` - WCAG contrast of the colour tokens (net: light and dark; dev: green, amber, mono)
- `npm run lint` / `npm run format` - ESLint / Prettier over `apps/*/src` and `packages/*/src`
- `npm run check -w @salvatorelaspata/content` - Type-check the content package (`tsc --noEmit`)

### Build & Preview

- `npm run build` - Type-check the content package, then build every app (each runs `astro check && astro build`)
- `npm run build:net` / `npm run build:dev` - Build one site (output in `apps/<name>/dist/`)
- `npm run preview -w @salvatorelaspata/net` - Preview the production build locally

### Docker

One [Dockerfile](Dockerfile) for both sites, chosen with the `APP` build arg (`net` by default, or `dev`), and one shared [nginx/nginx.conf](nginx/nginx.conf). The context is the repo root (it must include `packages/`).

- Build: `docker build -t salvatorela/salvatorelaspata.net .` and `docker build --build-arg APP=dev -t salvatorela/salvatorelaspata.dev .`
- Run both: `docker compose up -d` ([docker-compose.yml](docker-compose.yml): .net on port 4321, .dev on 4322)
- Multi-stage build: Node.js for building, nginx for serving. The container listens on port 4321

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
- **Docker/nginx**: [.github/workflows/publish.yml](.github/workflows/publish.yml) builds the [Dockerfile](Dockerfile) once per site (matrix `net`, `dev`) and pushes `salvatorela/salvatorelaspata.net` and `salvatorela/salvatorelaspata.dev`; headers are in [nginx/nginx.conf](nginx/nginx.conf).

salvatorelaspata.dev is deployed to Cloudflare Workers and to Docker Hub (same workflow as above), not to GitHub Pages (one Pages site per repository). On Cloudflare it is a second Worker (`salvatorelaspata-dev`, assets only, no script): [apps/dev/wrangler.jsonc](apps/dev/wrangler.jsonc), headers in [apps/dev/public/_headers](apps/dev/public/_headers). Workers Builds settings: root directory `/`, build command `npm run build:dev`, deploy command `npx wrangler deploy -c apps/dev/wrangler.jsonc`, build watch paths `apps/dev/*` and `packages/content/*`. The domain is attached in the dashboard (Custom Domains).

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

## salvatorelaspata.dev (`apps/dev`)

A terminal: every section is a command and its output, every page is a "window" of a tmux-like status bar. Paths below are relative to `apps/dev/`.

- Pages: `/` and `/en/` ([HomePage.astro](apps/dev/src/components/HomePage.astro): `neofetch` with the H1, `cat ~/.plan`, `cat about.md` + `tree ~/skills`, `cat stack.txt` + `ls ~/.tools/*`, `ls -l ~/projects`, `git log` of the experiences, latest posts, `cat contact.txt`), `/blog/`, `/blog/[urlSlug]` (opened with `less`, frontmatter header), `/projects/[slug]` (metadata as package.json), 404, `.vcf`. Same URLs as salvatorelaspata.net, so internal links in the Markdown work on both sites.
- SEO: project and article pages set `canonical` to the same URL on salvatorelaspata.net and are left out of the sitemap (filter in [astro.config.mjs](apps/dev/astro.config.mjs)); home and blog index are canonical on .dev. RSS and the n8n privacy policy are linked from the footer on .net.
- Sections use [Section.astro](apps/dev/src/components/Section.astro): the heading is the section name (screen-reader only) plus the command; the `user@host:~$` prompt is `aria-hidden`.
- Interactive prompt: [Terminal.astro](apps/dev/src/components/Terminal.astro) + [src/scripts/terminal.ts](apps/dev/src/scripts/terminal.ts). It starts `hidden` and the script reveals it, so without JS the page is plain links. Data comes from `/terminal.json` and `/en/terminal.json` ([src/lib/terminal-data.ts](apps/dev/src/lib/terminal-data.ts)), fetched when the browser is idle or on first focus. Output is built with DOM nodes, never `innerHTML`. Commands: `help`, `whoami`, `neofetch`, `about`, `skills`, `stack`, `ls`, `cd`, `cat`, `open`, `projects [filter]`, `blog`, `grep`, `experience`/`git log`, `contact`, `lang`, `theme`, `clear`, `history` and a few easter eggs (`sudo`, `rm`, `vim`, `make coffee`). Tab completes, ↑↓ history (sessionStorage), Ctrl+L clears.
- i18n: same pattern as net ([src/i18n/](apps/dev/src/i18n/), `Dict`, no hard-coded text); command names stay in English in both languages, their help text is translated.
- Styles: plain CSS in [src/styles/global.css](apps/dev/src/styles/global.css), tokens on `:root` (theme green) and `[data-theme='amber'|'mono']`, all dark. The `theme` command stores the choice in localStorage (`term-theme`), applied by an inline script before first paint. Run `npm run check:contrast` after changing tokens. Box-drawing glyphs are not in the font subset, so decorative art is SVG (the neofetch logo) or CSS (tree and git log lines).
- Prettier: `.astro` files here are formatted with `--jsx-single-quote` to match net's single-quoted attributes. Keep links on one line or build them in an expression: Prettier line breaks inside an `<a>` become spaces.

## Adding Content

All in `packages/content/src/`; every app picks it up on its next build. The maintainer's guide is [packages/content/README.md](packages/content/README.md) (Italian): where each piece lives, post and project templates, facts repeated in prose (role, team size, years), what the build catches and what it doesn't. Keep it in sync when the content structure changes.

- **Technology:** new `.js` file in the right `tech/` folder exporting `id`, `title`, `link`, `svg`.
- **Project:** `projects/NN_slug.json` (schema above, with `kind`, `filters`, `summary` and the `en` block) plus `NN_slug.it.md` and `NN_slug.en.md` without H1. Higher IDs appear first.
- **Blog post:** `posts/<key>.it.md` and `<key>.en.md` with the same `translationKey`.
- **Bio, skills, booking formats:** [bio.ts](packages/content/src/bio.ts), both languages.

## Technical Notes

- The CSP is identical on both sites and lives in three places that must stay aligned: [apps/net/public/_headers](apps/net/public/_headers) and [apps/dev/public/_headers](apps/dev/public/_headers) (Cloudflare) and [nginx/nginx.conf](nginx/nginx.conf) (Docker). There are no third-party scripts: Cal.com bookings are plain links.
- The contact QR code is generated at build time and points to the `.vcf` URL. The full vCard text would need a version 17 QR code (85 modules), which is unreadable at 144px.
