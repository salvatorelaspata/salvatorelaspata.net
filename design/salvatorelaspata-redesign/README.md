# salvatorelaspata.net — Restyling "Petrolio Tecnico"

Prototipo HTML + Tailwind da portare in componenti **Astro 5** (statico) con **Tailwind CSS 3** e **GSAP**.
Questo file è pensato per essere passato a Claude Code come brief di implementazione.

## Contenuto del pacchetto

| File | Cosa contiene |
|---|---|
| `design-system.html` | Board: 3 direzioni, token, tipografia, stati, componenti, mockup desktop/mobile, motion, checklist a11y, mappa handoff |
| `index.html` | Home one-page ristrutturata |
| `progetto.html` | Dettaglio progetto (esempio: CAP Plugin Adobe Forms) |
| `blog.html` | Indice del blog con filtro per argomento |
| `articolo.html` | Articolo con indice sticky, codice, tabella, callout, barra di lettura |
| `tokens.css` | **Unico file di token**: colori light/dark, tipografia, spazi, raggi, ombre, motion + primitive (`.btn`, `.chip`, `.tag`, `.card-interactive`, `.prose-site`, `.timeline`…) |
| `tailwind.config.mjs` | Config Tailwind per Astro, mappa i token |
| `assets/tw-config.js` | Stessa config per il Play CDN del prototipo |
| `assets/app.js` | Interazioni, divise per blocco = componente Astro |

Per aprire il prototipo: servi la cartella (`npx serve .`) e apri `design-system.html`.
Il prototipo usa il Play CDN di Tailwind solo per comodità: in Astro si usa la build normale.

## Direzione scelta: Petrolio Tecnico

- Teal/petrolio e carta restano. La firma neo-brutalista (bordo 2px + ombra piena sfalsata) ora si usa **solo su ciò che è cliccabile**: pulsanti, card-link, chip. Le superfici statiche hanno filetti sottili (`--border-subtle`).
- **Schibsted Grotesk** per titoli e testo, **JetBrains Mono** solo per etichette, percorsi (`~/progetti`), date, durate, numeri e codice. Massimo 2 famiglie.
- Hero: proposta di valore + 2 CTA + diagramma "stack" a 3 layer (on-premise → BTP → side project).

## Implementazione in Astro

### Setup
```bash
npm i -D @astrojs/tailwind tailwindcss@3
npm i gsap @fontsource-variable/schibsted-grotesk @fontsource-variable/jetbrains-mono
```
`src/styles/global.css`:
```css
@tailwind base;
@import "./tokens.css";   /* dopo base, prima di components: le utility vincono sulle primitive */
@tailwind components;
@tailwind utilities;
```
In `BaseLayout.astro` importa i font (`import '@fontsource-variable/schibsted-grotesk'; import '@fontsource-variable/jetbrains-mono';`), preload del solo file latin 400 del sans, e copia lo script anti-FOUC che trovi inline nel `<head>` dei prototipi (con `is:inline`).
In `tailwind.config.mjs` i nomi delle famiglie hanno il suffisso `Variable` di Fontsource: in `tokens.css` aggiorna `--font-sans`/`--font-mono` di conseguenza.

### Nota sui colori Tailwind
I colori puntano a `var(--…)` in esadecimale, quindi i modificatori di opacità (`bg-accent/50`) non funzionano. Se servono, converti i token in canali RGB (`--bg: 245 245 240`) e usa `rgb(var(--bg) / <alpha-value>)`.

### Mappa componenti

| Prototipo | Astro |
|---|---|
| header + `#mobile-menu` | `Header.astro`, `MobileNav.astro`, `ThemeToggle.astro`, `LangSwitch.astro` |
| hero | `Hero.astro`, `StackDiagram.astro` |
| `#chi-sono` | `About.astro` (card + gruppi competenze: le skills sono fuse qui) |
| `#stack` | `TechList.astro` — dati da `src/data/tech.ts`, loghi SVG inline a 20px con `fill="currentColor"` al posto dei monogrammi del mockup |
| `#progetti` | `ProjectCard.astro` (featured), `ProjectRow.astro`, `Filter.astro` |
| `#esperienze` | `Timeline.astro` |
| `#blog` | `BlogCard.astro` |
| `#contatti` | `Contact.astro`, `BookingCard.astro`, `VCard.astro` |
| footer | `Footer.astro`, `BackToTop.astro`, `Spark.astro` |
| `progetto.html` | `src/pages/[lang]/progetti/[slug].astro` + `ProjectLayout.astro` |
| `blog.html`, `articolo.html` | `src/pages/[lang]/blog/index.astro`, `[slug].astro`, `Toc.astro`, `CodeBlock` (Shiki con tema che usa i colori di `.code-block`) |

### Content Collections
`projects`: aggiungi al frontmatter `featured: boolean`, `type: 'npm' | 'chrome' | 'slide' | …`, `filters: string[]`, `icon` (per `ProjectCover` se manca l'immagine). I filtri e i conteggi si calcolano a build-time; il JS filtra solo elementi già nel DOM (funziona anche senza JS: si vede tutto).
Le liste di tecnologie di alcuni progetti nel mockup (Config Reality, Cubo Pazzesco, Mediapipe…) sono plausibili ma vanno verificate sui contenuti reali. Gli articoli del blog sono di esempio.

### i18n
Nessun testo nei layout ha larghezza fissa; titoli con `text-wrap: balance`, sillabazione solo sotto 640px. Il toggle lingua è fatto di link reali con `hreflang` (niente JS). Tieni le stringhe UI in `src/i18n/{it,en}.ts`.

## Motion
Tutto in `assets/app.js` dentro `gsap.matchMedia('(prefers-reduced-motion: no-preference)')`. Con reduced-motion non viene creato nessun tween; i CSS azzerano le transizioni. Nessun elemento parte da `opacity: 0` senza JS. Catalogo completo nella board, sezione Motion. L'effetto attuale "la card dell'hero perde padding allo scroll" viene rimosso.

## Accessibilità (WCAG 2.2 AA)
Contrasti misurati (rapporto sul fondo):

| Token | Chiaro | Scuro |
|---|---|---|
| `--text` | 15.9 | 15.2 |
| `--text-muted` | 6.7 | 8.3 |
| `--link` | 5.7 | 9.6 |
| `--accent-fg` su `--accent` | 9.9 | 6.1 |
| `--accent-ink` su `--accent-soft` | 10.2 | 9.0 |
| `--border` (UI) | 15.9 | 7.0 |
| `--focus` (≥3:1) | 5.7 | 12.1 |

`--border-subtle` è solo decorativo: mai unico confine di un controllo. Altri punti: skip link, un H1 per pagina, target ≥44px, `aria-pressed` su filtri e tema, `aria-expanded` sul menu con Esc, regioni `aria-live` per i conteggi, `<pre>` e tabelle scrollabili con `tabindex="0"`, `forced-colors` gestito.

## Performance
- 2 famiglie variabili self-hosted, subset latin, `font-display: swap`.
- Copertine progetto generate in SVG (~1 KB) quando non c'è un'immagine.
- QR della vCard generato a build-time (es. `qrcode` → SVG inline); quello del mockup è finto.
- GSAP + ScrollTrigger caricati con `<script>` di Astro (bundle, defer); nessun framework UI.
