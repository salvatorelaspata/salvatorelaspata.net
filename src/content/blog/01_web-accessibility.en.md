---
title: "Accessible web applications for visually impaired and blind users"
description: "How to apply WCAG, ARIA and best practices to make interfaces fully usable with screen readers and assistive technologies"
pubDate: 2026-05-27
tags: ["accessibility", "wcag", "aria", "web", "screen reader"]
draft: false
lang: en
urlSlug: web-accessibility-wcag
---

Web accessibility is not optional: it is an ethical requirement and, in many contexts, a legal one. Building interfaces usable by visually impaired or blind people means ensuring every feature is reachable and understandable through screen readers and assistive technologies.

## WCAG Guidelines

The **Web Content Accessibility Guidelines (WCAG)** define three conformance levels: A, AA, and AAA. Level AA is the recommended minimum and is required by regulations such as the European Accessibility Directive (EN 301 549).

The four fundamental principles — **POUR** — are:

- **Perceivable**: information must be presented in ways users can perceive
- **Operable**: the interface must be navigable by keyboard without a mouse
- **Understandable**: content and behavior must be clear
- **Robust**: content must be interpretable by current and future assistive technologies

## ARIA Attributes

**WAI-ARIA** (Accessible Rich Internet Applications) provides HTML attributes to communicate the role, state, and properties of elements to assistive technologies.

```html
<!-- Landmark regions -->
<nav aria-label="Main navigation">...</nav>
<main aria-labelledby="page-title">...</main>

<!-- Interactive elements -->
<button aria-expanded="false" aria-controls="menu">Open menu</button>

<!-- Dynamic state -->
<div role="alert" aria-live="polite">Message sent successfully</div>

<!-- Decorative vs informative images -->
<img src="logo.png" alt="Company logo" />
<img src="divider.png" alt="" role="presentation" />
```

### ARIA Usage Rules

1. **Do not use ARIA if semantic HTML is sufficient** — `<button>` is always better than `<div role="button">`
2. **All interactive ARIA widgets must be keyboard navigable**
3. **Do not hide visible elements from screen readers without reason**
4. **Always label form controls** — with `<label>`, `aria-label`, or `aria-labelledby`

## Practical Best Practices

### Semantic Structure

Using semantic HTML tags is the foundation: `<header>`, `<nav>`, `<main>`, `<article>`, `<section>`, `<aside>`, `<footer>`. Screen readers use these landmarks to enable rapid navigation between sections.

### Logical DOM Order

Visual order and DOM order must match. Using CSS to reposition elements visually is fine, but the DOM must remain logically sequential.

### Focus Management

```css
/* Never remove the outline without an alternative */
:focus-visible {
  outline: 3px solid #005fcc;
  outline-offset: 2px;
}
```

For modals and dialogs, focus must be trapped inside while the window is open and returned to the triggering element on close.

### Alternative Text for Images

- **Informative images**: descriptive and concise `alt` text
- **Decorative images**: `alt=""` (empty string)
- **Complex images** (charts, diagrams): extended description via `aria-describedby` or contextual text

### Color Contrast

WCAG AA requires:
- **4.5:1** for normal text
- **3:1** for large text (18pt or 14pt bold)
- **3:1** for graphical elements and UI components

### Dynamic Content

For dynamic updates (notifications, errors, search results) use `aria-live`:

```html
<div aria-live="polite" aria-atomic="true" class="sr-only">
  <!-- Messages inserted here are announced by the screen reader -->
</div>
```

## Testing with Screen Readers

Testing with real tools is irreplaceable:

- **NVDA** (Windows, free) + Firefox
- **JAWS** (Windows, commercial) + Chrome/Edge
- **VoiceOver** (macOS/iOS, built-in) + Safari
- **TalkBack** (Android, built-in) + Chrome

### Quick Checklist

- [ ] Full keyboard navigation (Tab, Shift+Tab, Enter, Space, arrow keys)
- [ ] "Skip to main content" link visible on focus
- [ ] All form fields have associated labels
- [ ] Images have appropriate alt text
- [ ] Contrast meets AA
- [ ] Modals correctly implement focus trap
- [ ] Error messages are associated with fields via `aria-describedby`
- [ ] Dynamic content uses `aria-live`

## Resources

- [WCAG 2.2](https://www.w3.org/TR/WCAG22/) — official W3C specification
- [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/) — reference patterns
- [axe DevTools](https://www.deque.com/axe/) — browser extension for automated audit
- [WebAIM](https://webaim.org/) — practical resources and guides
