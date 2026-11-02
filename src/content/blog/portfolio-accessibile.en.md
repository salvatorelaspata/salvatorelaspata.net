---
title: "An accessible portfolio: what I changed for WCAG 2.2"
description: "Contrast computed for two themes, a focus ring that never hides, 44 px targets, filters that speak up and opt-out motion: my site, rebuilt for WCAG 2.2 AA."
pubDate: 2026-09-28
tags: ["Accessibilità", "Frontend"]
lang: en
translationKey: portfolio-accessibile
urlSlug: accessible-portfolio
cover:
  icon: access
draft: false
---

## Why a portfolio is a test bench

I ask clients to treat accessibility as a requirement, not as a finishing touch. Part of my job is building [web apps for low-vision and blind users](/en/blog/web-accessibility-wcag). My own site, however, told a different story.

Secondary text was made with `opacity-60` and `opacity-80`, so its contrast depended on whatever sat underneath, and nobody had ever measured it. There was no skip link. The skills section faded in with an animation that ignored `prefers-reduced-motion` and, for good measure, faded the items out again once you scrolled past them. The hero card lost its padding as you scrolled: theatrical, but it shifted the layout without saying anything.

The "Petrolio Tecnico" redesign started from a list of rules, before any color was picked: [WCAG 2.2](https://www.w3.org/TR/WCAG22/) level AA in both themes, no information conveyed by color alone, no mandatory animation, full content without JavaScript.

## Contrast in two themes, computed

Every color token has a reference pair and a ratio computed with the WCAG formula: relative luminance in sRGB, then `(L1 + 0.05) / (L2 + 0.05)`, where L1 is the lighter color. The dark theme is not the light one inverted: the background is a petrol black rather than a neutral gray, and links turn into a brighter teal.

AA has two thresholds. For text, [1.4.3 Contrast (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html) asks for 4.5:1. For UI components and focus indicators, [1.4.11 Non-text Contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html) asks for 3:1 against adjacent colors.

| Token pair | Where you see it | Light | Dark | AA threshold |
|---|---|---|---|---|
| `--text` on `--bg` | body text | 15.9:1 | 15.2:1 | 4.5:1 (1.4.3) |
| `--text-muted` on `--bg` | secondary text, dates | 6.8:1 | 8.3:1 | 4.5:1 (1.4.3) |
| `--link` on `--bg` | links | 5.7:1 | 9.6:1 | 4.5:1 (1.4.3) |
| `--accent-fg` on `--accent` | primary button, skip link | 9.9:1 | 6.1:1 | 4.5:1 (1.4.3) |
| `--accent-ink` on `--accent-soft` | tags, hovered chips, callouts | 10.2:1 | 9.0:1 | 4.5:1 (1.4.3) |
| `--border` on `--bg` | button and card borders | 15.9:1 | 7.0:1 | 3:1 (1.4.11) |
| `--focus` on `--bg` | focus ring | 5.7:1 | 12.1:1 | 3:1 (1.4.11) |

`--border-subtle` (1.4:1 light, 1.6:1 dark) sits below the threshold on purpose: it separates sections but is never the only boundary of a control. That job belongs to `--border`.

I recomputed everything with a script instead of copying the values from the design docs. One number came out different: secondary text in the light theme is 6.75:1, which rounds to 6.8, not 6.7. The verdict doesn't change, but the rule from Understanding 1.4.3 applies: when deciding pass or fail, you don't round. 4.499:1 is not 4.5:1.

## A focus ring that never hides

[2.4.7 Focus Visible](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html) (AA) asks that keyboard users can always see where they are. The ring has its own token, a 3 px stroke and an offset that keeps it clear of the dark borders on buttons and cards.

```css title="tokens.css"
/* Focus: always visible, never removed */
:focus-visible {
  outline: 3px solid var(--focus);
  outline-offset: 3px;
  border-radius: var(--radius-sm);
}
```

`:focus-visible`, not `:focus`: the browser shows the ring for keyboard users and, as a rule, not after a mouse click on a button. On the card surface (`--surface`), `--focus` is 6.2:1 in light and 10.8:1 in dark. The AAA criterion [2.4.13 Focus Appearance](https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance.html) asks for more; I'm not claiming AAA, but a solid 3 px ring starts with an advantage.

### Keep focus out from under the header

The header is sticky, and WCAG 2.2 added [2.4.11 Focus Not Obscured (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html) (AA): the focused element must not be entirely hidden by author-created content. The fix is one line on `html`: `scroll-padding-top: calc(var(--header-h) + var(--space-5))`. Whenever the browser scrolls something into view (an anchor, a table of contents entry, the element receiving keyboard focus) it keeps the header's space clear. Technique [C43](https://www.w3.org/WAI/WCAG22/Techniques/css/C43) uses the same idea for a banner fixed at the bottom.

## The skip link: the page's first Tab

Logo, six menu items, the two language links, theme, "Book a call": on desktop that's eleven Tab stops before the content. [2.4.1 Bypass Blocks](https://www.w3.org/WAI/WCAG22/Understanding/bypass-blocks.html) (level A) asks for a way to skip them, and technique [G1](https://www.w3.org/WAI/WCAG22/Techniques/general/G1) describes the simplest one: a link to the main content as the first interactive element, which may stay hidden until it receives focus.

```html title="BaseLayout.astro"
<body>
  <a class="skip-link" href="#main">Skip to content</a>
  <header class="site-header">…</header>
  <main id="main" tabindex="-1">…</main>
</body>
```

The link isn't `display: none`, which would take it out of the tab order: it sits off-screen and slides into view on `:focus`. The `tabindex="-1"` makes `main` focusable from script without adding it to the tab order. It earns its keep twice. After the skip link, focus lands on the content and the next Tab starts from there. And the "Back to top" button calls `main.focus({ preventScroll: true })`; without it the view would jump to the top while focus stayed on the last element of the page.

## Clickable cards, one link each

Project cards are clickable as a whole. Wrapping each card in an `<a>` would be the shortcut, but a screen reader would read title, description and technologies as one long link name. And the GitHub link wouldn't fit: HTML doesn't allow a link inside a link.

I went with the "stretched link": a single link, on the title, with a pseudo-element that stretches over the card. Secondary links sit on top with `z-index`.

```html title="ProjectCard.astro"
<li class="card-interactive">
  <h3><a class="stretched-link" href="/en/projects/sap-docker-labs">SAP Docker Labs</a></h3>
  <p>Docker experiments to automate local SAP system setups.</p>
  <a class="btn btn-ghost above-link" href="https://github.com/…" target="_blank" rel="noopener">
    GitHub<span class="sr-only"> (opens in a new tab)</span>
  </a>
</li>
```

```css title="tokens.css"
.card-interactive { position: relative; }
.stretched-link::after { content: ""; position: absolute; inset: 0; z-index: 1; border-radius: inherit; }
.card-interactive .above-link { position: relative; z-index: 2; }
.stretched-link:focus-visible { outline: none; }
.card-interactive:has(.stretched-link:focus-visible) { outline: 3px solid var(--focus); outline-offset: 4px; }
```

In a screen reader's links list, each card is a single entry with a short name: [SAP Docker Labs](/en/projects/sap-docker-labs), not a paragraph. Focus stops on the title, but thanks to `:has()` the ring outlines the whole card. The price: selecting card text with the mouse gets awkward, because the pseudo-element sits on top of it. I can live with that.

## Filters that speak up

Projects and posts can be filtered by topic. Each filter is a `<button>` with `aria-pressed`, the toggle button from the [ARIA Authoring Practices Guide Button pattern](https://www.w3.org/WAI/ARIA/apg/patterns/button/). As the guide recommends, the label stays the same when the state changes: the screen reader announces the name and whether the button is pressed. The state doesn't rely on color alone either ([1.4.1 Use of Color](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html)): the active chip also gets a dot.

Then there's the count. A filter hides items: people looking at the screen notice, people listening don't. The number of results lives in a paragraph with `aria-live="polite"`, announced without moving focus. It's a textbook case for [4.1.3 Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html) (AA); `role="status"` from technique [ARIA22](https://www.w3.org/WAI/WCAG22/Techniques/aria/ARIA22) is the equivalent.

```html title="Filter.astro"
<p data-filter-status="projects" data-template="{n} projects" aria-live="polite">26 projects</p>
<div role="group" aria-label="Filter by type" data-filter-group="projects">
  <button type="button" class="chip" data-filter="all" aria-pressed="true">All</button>
  <button type="button" class="chip" data-filter="sap" aria-pressed="false">SAP</button>
</div>
```

In essence, the JavaScript does three things: it sets `hidden` on the excluded items, which also removes them from the accessibility tree; it updates `aria-pressed`; it rewrites the live region's text. The region already exists in the HTML generated at build time: a region created on the fly may not get announced. Without JavaScript everything is visible, and the counts are computed at build time.

## 44 px targets

[2.5.8 Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html), new in WCAG 2.2 at level AA, asks for targets of at least 24×24 CSS pixels. There are five exceptions; the most interesting is spacing: a smaller target passes if a 24 px circle centered on it doesn't intersect another target or another small target's circle. Another one exempts links inside a sentence.

I went for 44 px, the size of the AAA criterion [2.5.5 Target Size (Enhanced)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced.html): buttons, chips, menu and table of contents entries, breadcrumbs, footer links. One rule is easier to keep than five exceptions weighed case by case.

Almost everything, to be honest. The language switch is at least 44×40, and the "Copy" button on code blocks is 36 px tall: above the AA minimum, below my own rule. Links inside running text stay as tall as the line, as the exception allows.

## Motion that steps aside

[2.3.3 Animation from Interactions](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html) is AAA, outside the AA scope. I followed it anyway: non-essential scroll-triggered animation falls within it and, for people with vestibular disorders, means dizziness, nausea and headaches.

All motion goes through [`gsap.matchMedia()`](https://gsap.com/docs/v3/GSAP/gsap.matchMedia()/). With `prefers-reduced-motion: reduce` the function never runs and no tween is created. If the preference changes while the page is open, GSAP automatically reverts the animations and ScrollTriggers created inside it.

```js title="Motion.astro"
const mm = gsap.matchMedia();

mm.add('(prefers-reduced-motion: no-preference)', () => {
  gsap.utils.toArray('[data-reveal]').forEach((el) => {
    gsap.from(el, {
      y: 20, autoAlpha: 0, duration: 0.55, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 88%', once: true },
    });
  });
});
```

`gsap.from()` is deliberate: the final state is the one written in the HTML, and zero opacity only exists while the animation runs. Without JavaScript, or with reduced motion, nothing starts invisible. Each reveal happens once, and nothing disappears when you scroll past it. In CSS the same preference effectively zeroes out transitions and the hover offsets. The hero effect that ate its own padding was removed, not toned down.

> **Try it.** Turn on "Reduce motion" in your operating system's accessibility settings, or emulate `prefers-reduced-motion: reduce` from the Rendering panel in Chrome DevTools, then reload the [home page](/en/). Everything is already in place, no entrances.

## Forced colors: when the system picks the palette

With Windows contrast themes, the `forced-colors: active` media query matches and the browser swaps the page colors for system colors. According to the [CSS Color Adjustment](https://www.w3.org/TR/css-color-adjust-1/) spec, in this mode `box-shadow` computes to `none`: the solid offset shadow, the neo-brutalist signature, is gone. The borders remain, so that's where I step in.

```css title="tokens.css"
@media (forced-colors: active) {
  .btn, .card-interactive, .chip { border-color: ButtonText; }
  .chip[aria-pressed="true"] { forced-color-adjust: none; background: Highlight; color: HighlightText; }
}
```

Buttons, cards and chips take the system color for controls. The pressed chip is the tricky one: its state is drawn by the solid background, and in forced colors mode backgrounds get replaced too. With `forced-color-adjust: none` I take back control of that chip only and use `Highlight`/`HighlightText`, which come from the theme the user picked. The focus ring stays; only its color changes.

## What I learned

- **Rules come before the palette.** Setting thresholds and behavior before the look makes every choice verifiable rather than a matter of taste.
- **Numbers are computed, not copied.** Even when they come from well-kept documentation.
- **WCAG is the floor.** A simple rule is easier to apply than a minimum with five exceptions.
- **Progressive enhancement heads off a lot of problems.** If the content is complete without JavaScript, motion and filters can only add to it.

## What's left to do

- **A full screen reader pass** on every page: NVDA on Windows, VoiceOver on macOS and iOS. The rules are verified; the experience still needs listening to.
- **A fallback for `:has()`.** The card link hands its focus ring over to the card: a browser without `:has()` would show no focus at all. Moving `outline: none` inside `@supports selector(:has(*))` fixes it.
- **Filter semantics.** The filters are mutually exclusive, and pressing an active chip doesn't release it, which is not what you'd expect from a toggle button. I want to evaluate a radio group instead.
- **44 px for the stragglers:** the language switch and the "Copy" button.
- **The code block theme.** The prototype's colors pass (the weakest, comments, is 6.4:1), but the final Shiki theme needs checking again.
- **A public [accessibility statement](https://www.w3.org/WAI/planning/statements/)**, with the known limitations in black and white.

If you find a problem, drop me a line from the [contact section](/en/#contact). It's my favorite kind of bug report.
