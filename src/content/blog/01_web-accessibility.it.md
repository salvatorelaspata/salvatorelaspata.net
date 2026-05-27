---
title: "Applicazioni web accessibili per ipovedenti e non vedenti"
description: "Come applicare WCAG, ARIA e best practice per rendere le interfacce fruibili con screen reader e tecnologie assistive"
pubDate: 2026-05-27
tags: ["accessibility", "wcag", "aria", "web", "screen reader"]
draft: false
lang: it
urlSlug: web-accessibility-wcag
---

L'accessibilità web non è un optional: è un requisito etico e, in molti contesti, legale. Realizzare interfacce utilizzabili da persone ipovedenti o non vedenti significa garantire che ogni funzionalità sia raggiungibile e comprensibile attraverso screen reader e tecnologie assistive.

## Linee guida WCAG

Le **Web Content Accessibility Guidelines (WCAG)** definiscono tre livelli di conformità: A, AA e AAA. Il livello AA è lo standard minimo raccomandato e richiesto da normative come la Direttiva Europea sull'Accessibilità (EN 301 549).

I quattro principi fondamentali — **POUR** — sono:

- **Perceivable** (Percepibile): le informazioni devono essere presentate in modi che l'utente possa percepire
- **Operable** (Utilizzabile): l'interfaccia deve essere navigabile da tastiera e senza mouse
- **Understandable** (Comprensibile): il contenuto e il funzionamento devono essere chiari
- **Robust** (Robusto): il contenuto deve essere interpretabile da tecnologie assistive attuali e future

## Attributi ARIA

**WAI-ARIA** (Accessible Rich Internet Applications) fornisce attributi HTML per comunicare ruolo, stato e proprietà degli elementi alle tecnologie assistive.

```html
<!-- Landmark regions -->
<nav aria-label="Menu principale">...</nav>
<main aria-labelledby="page-title">...</main>

<!-- Elementi interattivi -->
<button aria-expanded="false" aria-controls="menu">Apri menu</button>

<!-- Stato dinamico -->
<div role="alert" aria-live="polite">Messaggio inviato con successo</div>

<!-- Immagini decorative vs informative -->
<img src="logo.png" alt="Logo aziendale" />
<img src="divider.png" alt="" role="presentation" />
```

### Regole d'uso di ARIA

1. **Non usare ARIA se HTML semantico è sufficiente** — `<button>` è sempre meglio di `<div role="button">`
2. **Tutti i widget interattivi ARIA devono essere navigabili da tastiera**
3. **Non nascondere elementi visibili agli screen reader senza motivo**
4. **Etichettare sempre i controlli di form** — con `<label>`, `aria-label` o `aria-labelledby`

## Best practice operative

### Struttura semantica

Usare i tag HTML semantici è la base: `<header>`, `<nav>`, `<main>`, `<article>`, `<section>`, `<aside>`, `<footer>`. Gli screen reader usano questi landmark per permettere la navigazione rapida tra le sezioni.

### Ordine logico del DOM

L'ordine visivo e l'ordine del DOM devono coincidere. Usare CSS per riposizionare elementi visivamente è lecito, ma il DOM deve rimanere logicamente sequenziale.

### Gestione del focus

```css
/* Non rimuovere mai l'outline senza alternativa */
:focus-visible {
  outline: 3px solid #005fcc;
  outline-offset: 2px;
}
```

Per le modal e i dialog, il focus deve essere intrappolato all'interno finché la finestra è aperta e restituito all'elemento che l'ha aperta alla chiusura.

### Testo alternativo per le immagini

- **Immagini informative**: `alt` descrittivo e conciso
- **Immagini decorative**: `alt=""` (stringa vuota)
- **Immagini complesse** (grafici, diagrammi): descrizione estesa con `aria-describedby` o testo nel contesto

### Contrasto dei colori

WCAG AA richiede:
- **4.5:1** per testo normale
- **3:1** per testo grande (18pt o 14pt bold)
- **3:1** per elementi grafici e componenti UI

### Contenuto dinamico

Per gli aggiornamenti dinamici (notifiche, errori, risultati di ricerca) usare `aria-live`:

```html
<div aria-live="polite" aria-atomic="true" class="sr-only">
  <!-- I messaggi inseriti qui vengono annunciati dallo screen reader -->
</div>
```

## Test con screen reader

Testare con strumenti reali è insostituibile:

- **NVDA** (Windows, gratuito) + Firefox
- **JAWS** (Windows, commerciale) + Chrome/Edge
- **VoiceOver** (macOS/iOS, integrato) + Safari
- **TalkBack** (Android, integrato) + Chrome

### Checklist rapida

- [ ] Navigazione completa da tastiera (Tab, Shift+Tab, Enter, Spazio, frecce)
- [ ] Skip link "Vai al contenuto principale" visibile al focus
- [ ] Tutti i form hanno label associate
- [ ] Le immagini hanno alt appropriato
- [ ] Il contrasto soddisfa AA
- [ ] Le modal gestiscono correttamente il focus trap
- [ ] I messaggi di errore sono associati al campo tramite `aria-describedby`
- [ ] I contenuti dinamici usano `aria-live`

## Risorse

- [WCAG 2.2](https://www.w3.org/TR/WCAG22/) — specifica ufficiale W3C
- [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/) — pattern di riferimento
- [axe DevTools](https://www.deque.com/axe/) — estensione browser per audit automatico
- [WebAIM](https://webaim.org/) — risorse e guide pratiche
