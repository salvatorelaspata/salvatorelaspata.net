# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a personal portfolio website for salvatorelaspata.net, built with Astro, Tailwind CSS, and GSAP for animations. The site is a single-page application showcasing skills, technologies, projects, and professional experiences.

## Commands

### Development
- `npm run dev` - Start development server on localhost
- `npm run dev:host` - Start development server accessible on network
- `npm start` - Alias for `npm run dev`

### Build & Preview
- `npm run build` - Type check with `astro check` then build for production
- `npm run preview` - Preview production build locally

### Docker
- Build: `docker build -t salvatorela/salvatorelaspata.net .`
- Run: `docker-compose up -d`
- The Docker build creates a multi-stage build: Node.js for building, nginx for serving
- Exposed port: 4321

## Architecture

### Page Structure
The site uses a single-page layout architecture where [index.astro](src/pages/index.astro) imports and stacks all landing page sections vertically with gradient backgrounds:
- Main (hero section)
- About
- Skills
- Technologies
- Project (side projects)
- Experiences
- Footer

Each section receives `bgColor` and `textColor` props for theming with gradient transitions between sections.

Additional pages exist for specific blog-like content: [daily-notifications.astro](src/pages/daily-notifications.astro), [personal-chrome-extension.astro](src/pages/personal-chrome-extension.astro), [posti-sede.astro](src/pages/posti-sede.astro).

### Data-Driven Content
Content is stored as static data files, not in a CMS:

**Technologies** ([src/data/tech/](src/data/tech/)): Organized into subdirectories
- `languages/` - Programming languages (ABAP, CSS, HTML, JavaScript, Python, Rust, SQL, Swift, TypeScript)
- `frameworks/` - Frameworks (Astro, Lit, Next.js, Node.js, React, React Native, SAPUI5, Three.js)
- `sap/` - SAP technologies (BPA, BTP, CAP, HANA, NetWeaver, OData, Workflow)
- `nonsap/` - Non-SAP technologies (Fastify, MongoDB, PostgreSQL, RabbitMQ, Redis, Supabase)
- `inf/` - Infrastructure (AWS, Cloud Foundry, Docker, K8s, Netlify, Oracle, Vercel)
- `other/` - Other tools (Git, Jenkins, Linux, WDIO)

Each tech file exports a default object with: `id`, `title`, `subtitle`, `description`, `bgColorIcon`, `textColorIcon`, `svg` (inline SVG icon).

**Projects** ([src/data/projects/](src/data/projects/)): JSON files numbered by ID (01_*.json, 02_*.json, etc.)
- Schema: `id`, `title`, `subtitle`, `img`, `description`, `tecnologie`, optional `github`, `demo`, `npm`, `slides`
- Projects are sorted by ID in descending order (newest first) in [Project.astro](src/landingpage/Project.astro)

### Component Architecture

**Landing Page Sections** ([src/landingpage/](src/landingpage/)): Main content sections
- All wrapped in `SectionLayout` which provides consistent section structure
- [Technologies.astro](src/landingpage/Technologies.astro) uses `import.meta.glob()` to dynamically import all tech data, categorizes and sorts by ID
- [Project.astro](src/landingpage/Project.astro) uses `import.meta.glob()` to load project JSON files

**Reusable Components** ([src/components/](src/components/)):
- `Card.astro` - Generic card component
- `CardImage.astro` - Card with image (used for projects)
- `CardSimple.astro` - Simple card (used for technologies)
- `Panel.astro` - Section panel wrapper
- `SocialLinks.astro` - Social media links
- `Timeline.astro` - Timeline component for experiences
- `ui/BackToTop.astro` - Back to top button
- `ui/ToggleTheme.astro` - Dark/light theme toggle

**Layouts** ([src/layouts/](src/layouts/)):
- [Layout.astro](src/layouts/Layout.astro) - Root layout with SEO, theme switching, and global UI elements
- `HeaderSection.astro` - Header section wrapper
- `SectionLayout.astro` - Consistent wrapper for each landing page section

### Theming System
- Dark mode toggle implemented in [Layout.astro](src/layouts/Layout.astro) using localStorage and class-based approach
- Theme state persisted in `localStorage.theme`
- Dark mode uses custom Tailwind color palette (palette1-5) defined in [tailwind.config.mjs](tailwind.config.mjs)
- Light mode uses standard gray gradients
- Theme switcher script runs on DOMContentLoaded and applies saved theme

### Animations
- GSAP with ScrollTrigger plugin used for scroll-based animations
- Utility functions in [src/utils/animation.astro](src/utils/animation.astro):
  - `randomAnimation` - Random ease and duration animations
  - `randomChildAnimation` - Animates children with random effects
  - `animateSkills` - Horizontal scroll animation
- [Technologies.astro](src/landingpage/Technologies.astro) implements card animations with staggered delays on scroll

### Internationalization (i18n)
Basic i18n setup in [src/i18n/](src/i18n/) but currently minimal:
- Supported languages: English (`en`), Italian (`it`)
- Default language: Italian (`it`)
- Translation utilities in [utils.ts](src/i18n/utils.ts): `getLangFromUrl`, `useTranslations`
- Translation keys defined in [ui.ts](src/i18n/ui.ts)

## Configuration

### Astro Config ([astro.config.mjs](astro.config.mjs))
- Site URL: `https://salvatorelaspata.net`
- Integrations: Tailwind CSS, Sitemap
- No SSR - purely static site generation

### Tailwind Config ([tailwind.config.mjs](tailwind.config.mjs))
- Dark mode: `class` strategy
- Custom color palette: palette1 through palette5 (blue-green gradient)
- Content paths: All Astro, HTML, JS, JSX, MD, MDX, Svelte, TS, TSX, Vue files in src/

### TypeScript
- Uses Astro's strict TypeScript configuration (`astro/tsconfigs/strict`)

## Adding Content

### Adding a New Technology
1. Create a new `.js` file in the appropriate [src/data/tech/](src/data/tech/) subdirectory
2. Export default object with required fields: `id`, `title`, `subtitle`, `description`, `bgColorIcon`, `textColorIcon`, `svg`
3. Assign a unique ID (increment from highest existing ID in that category)
4. The component will automatically pick it up via `import.meta.glob()`

### Adding a New Project
1. Create a new JSON file in [src/data/projects/](src/data/projects/) with format `NN_project-name.json`
2. Use schema: `id`, `title`, `subtitle`, `img`, `description`, `tecnologie`, optional `github`/`demo`/`npm`/`slides`
3. Place project image in [public/](public/) directory
4. Higher ID numbers appear first (descending sort)

## Technical Notes

- All SVG icons are inline in the tech data files (from simpleicons.org and svgrepo.com)
- Images use `content-visibility: auto` CSS for performance optimization
- Site uses font-mono (monospace font) globally
- Responsive design with Tailwind breakpoints (sm, lg, xl)
- No build-time CMS - all content is static files in the repository
