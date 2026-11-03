# salvatorelaspata

Source code for my personal websites, as an npm workspaces monorepo:

- [`apps/net`](apps/net) — [salvatorelaspata.net](https://salvatorelaspata.net), the portfolio.
- [`apps/dev`](apps/dev) — [salvatorelaspata.dev](https://salvatorelaspata.dev), the same content as a terminal.
- [`packages/content`](packages/content) — the content both sites share: profile, bio, projects, experiences, technologies and blog posts. How to update it: [packages/content/README.md](packages/content/README.md) (in Italian).

```bash
npm install
npm run dev        # salvatorelaspata.net on localhost:4321
npm run dev:dev    # salvatorelaspata.dev on localhost:4322
npm run build      # every site
```

## Technologies

- [Astro](https://astro.build)
- [Tailwind CSS](https://tailwindcss.com)

## Credits

- Svg icons from [simpleicons](https://simpleicons.org) and [svgrepo](https://www.svgrepo.com)
