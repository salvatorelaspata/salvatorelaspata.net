---
title: "Un portfolio accessibile: cosa ho cambiato per WCAG 2.2"
description: "Contrasti calcolati in due temi, focus sempre visibile, target da 44 px, filtri che si fanno sentire e motion opzionale: il mio sito rifatto per WCAG 2.2 AA."
pubDate: 2026-09-28
tags: ["Accessibilità", "Frontend"]
lang: it
translationKey: portfolio-accessibile
urlSlug: portfolio-accessibile
cover:
  icon: access
draft: false
---

## Perché un portfolio è un banco di prova

Ai clienti chiedo di trattare l'accessibilità come un requisito, non come una rifinitura. Parte del mio lavoro sono proprio [applicazioni web per persone ipovedenti e non vedenti](/blog/web-accessibility-wcag). Il mio sito, però, raccontava un'altra storia.

Il testo secondario era ottenuto con `opacity-60` e `opacity-80`: il contrasto dipendeva da cosa c'era sotto e nessuno l'aveva mai misurato. Non c'era uno skip link. Le competenze comparivano con un'animazione che ignorava `prefers-reduced-motion` e, per buona misura, le faceva sparire quando le superavi scrollando. La card dell'hero perdeva padding mentre scorrevi: scenografico, ma spostava il layout senza dire nulla.

Il restyling "Petrolio Tecnico" è partito da una lista di regole, prima ancora dei colori: [WCAG 2.2](https://www.w3.org/TR/WCAG22/) livello AA in entrambi i temi, nessuna informazione affidata solo al colore, nessuna animazione obbligatoria, contenuto completo anche senza JavaScript.

## Contrasti in due temi, calcolati

Ogni token di colore ha una coppia di riferimento e un rapporto calcolato con la formula di WCAG: luminanza relativa in sRGB, poi `(L1 + 0.05) / (L2 + 0.05)`, con L1 il colore più chiaro. Il tema scuro non è l'inversione del chiaro: lo sfondo è un nero petrolio, non un grigio neutro, e il link diventa un teal più luminoso.

Le soglie AA sono due. Per il testo, [1.4.3 Contrast (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html) chiede 4,5:1. Per i componenti dell'interfaccia e l'indicatore di focus, [1.4.11 Non-text Contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html) chiede 3:1 rispetto ai colori adiacenti.

| Coppia di token | Dove si vede | Chiaro | Scuro | Soglia AA |
|---|---|---|---|---|
| `--text` su `--bg` | testo | 15,9:1 | 15,2:1 | 4,5:1 (1.4.3) |
| `--text-muted` su `--bg` | testo secondario, date | 6,8:1 | 8,3:1 | 4,5:1 (1.4.3) |
| `--link` su `--bg` | link | 5,7:1 | 9,6:1 | 4,5:1 (1.4.3) |
| `--accent-fg` su `--accent` | pulsante primario, skip link | 9,9:1 | 6,1:1 | 4,5:1 (1.4.3) |
| `--accent-ink` su `--accent-soft` | tag, chip in hover, callout | 10,2:1 | 9,0:1 | 4,5:1 (1.4.3) |
| `--border` su `--bg` | bordo di pulsanti e card | 15,9:1 | 7,0:1 | 3:1 (1.4.11) |
| `--focus` su `--bg` | anello di focus | 5,7:1 | 12,1:1 | 3:1 (1.4.11) |

`--border-subtle` (1,4:1 in chiaro, 1,6:1 in scuro) è volutamente sotto soglia: separa le sezioni, ma non disegna mai da solo il confine di un controllo. Quel lavoro spetta a `--border`.

Ho ricalcolato tutto con uno script invece di copiare i valori dalla documentazione di design. Un numero era diverso: il testo secondario in chiaro vale 6,75:1, cioè 6,8 e non 6,7. Il verdetto non cambia, ma vale la regola scritta nella guida Understanding di 1.4.3: per decidere se si passa, non si arrotonda. 4,499:1 non è 4,5:1.

## Focus sempre visibile

[2.4.7 Focus Visible](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html) (AA) chiede che chi usa la tastiera veda sempre dove si trova. L'anello ha un token dedicato, 3 px di spessore e un offset che lo stacca dai bordi scuri di pulsanti e card.

```css title="tokens.css"
/* Focus: sempre visibile, mai rimosso */
:focus-visible {
  outline: 3px solid var(--focus);
  outline-offset: 3px;
  border-radius: var(--radius-sm);
}
```

`:focus-visible`, non `:focus`: il browser mostra l'anello con la tastiera e, di norma, non dopo un clic su un pulsante. Sul fondo delle card (`--surface`) `--focus` fa 6,2:1 in chiaro e 10,8:1 in scuro. Il criterio AAA [2.4.13 Focus Appearance](https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance.html) chiede di più; non dichiaro AAA, ma un anello pieno da 3 px parte avvantaggiato.

### Il focus non deve finire sotto l'header

L'header è sticky, e WCAG 2.2 ha introdotto [2.4.11 Focus Not Obscured (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html) (AA): l'elemento con il focus non può essere nascosto del tutto da contenuto dell'autore. La risposta è una riga su `html`: `scroll-padding-top: calc(var(--header-h) + var(--space-5))`. Quando il browser porta qualcosa in vista (un'ancora, una voce dell'indice, l'elemento che riceve il focus da tastiera) lascia libero lo spazio dell'header. È la stessa idea della tecnica [C43](https://www.w3.org/WAI/WCAG22/Techniques/css/C43), che la applica a un banner fissato in basso.

## Lo skip link: il primo Tab della pagina

Logo, sei voci di menu, i due link della lingua, tema, "Prenota una call": su desktop sono undici Tab prima del contenuto. [2.4.1 Bypass Blocks](https://www.w3.org/WAI/WCAG22/Understanding/bypass-blocks.html) (livello A) chiede un modo per saltarli, e la tecnica [G1](https://www.w3.org/WAI/WCAG22/Techniques/general/G1) descrive il più semplice: un link al contenuto principale come primo elemento interattivo, visibile anche solo quando riceve il focus.

```html title="BaseLayout.astro"
<body>
  <a class="skip-link" href="#main">Vai al contenuto</a>
  <header class="site-header">…</header>
  <main id="main" tabindex="-1">…</main>
</body>
```

Il link non è `display: none`, che lo toglierebbe dalla tabulazione: sta fuori schermo e con `:focus` scende in vista. Il `tabindex="-1"` rende `main` focalizzabile da script senza aggiungerlo all'ordine di tabulazione. Serve due volte: dopo lo skip link il focus atterra sul contenuto e il Tab successivo riparte da lì; il pulsante "Torna su" chiama `main.focus({ preventScroll: true })`, altrimenti la vista tornerebbe in cima con il focus ancora sull'ultimo elemento della pagina.

## Card cliccabili, un link solo

Le card dei progetti sono cliccabili per intero. Avvolgerle in un `<a>` sarebbe la scorciatoia, ma lo screen reader leggerebbe titolo, descrizione e tecnologie come un unico nome di link. E il link a GitHub non ci potrebbe stare: l'HTML non ammette un link dentro un link.

Ho usato lo "stretched link": un solo link, sul titolo, con uno pseudo-elemento che copre la card. I link secondari salgono sopra con `z-index`.

```html title="ProjectCard.astro"
<li class="card-interactive">
  <h3><a class="stretched-link" href="/projects/sap-docker-labs">SAP Docker Labs</a></h3>
  <p>Esperimenti Docker per automatizzare il setup di sistemi SAP in locale.</p>
  <a class="btn btn-ghost above-link" href="https://github.com/…" target="_blank" rel="noopener">
    GitHub<span class="sr-only"> (si apre in una nuova scheda)</span>
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

Nell'elenco dei link dello screen reader ogni card è una voce sola dal nome breve: [SAP Docker Labs](/projects/sap-docker-labs), non un paragrafo. Il focus si ferma sul titolo, ma con `:has()` l'anello disegna tutta la card. Il prezzo: selezionare col mouse il testo della card diventa scomodo, perché lo pseudo-elemento ci sta sopra. Lo accetto.

## Filtri che si fanno sentire

Progetti e articoli si filtrano per argomento. Ogni filtro è un `<button>` con `aria-pressed`, il toggle button del [pattern Button della ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/patterns/button/). Come raccomanda la guida, l'etichetta non cambia con lo stato: lo screen reader annuncia il nome e se il pulsante è premuto. E lo stato non è affidato solo al colore ([1.4.1 Use of Color](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html)): il chip attivo ha anche un pallino.

Poi c'è il conteggio. Un filtro nasconde elementi: chi guarda lo schermo se ne accorge, chi ascolta no. Il numero dei risultati sta in un paragrafo con `aria-live="polite"`, annunciato senza spostare il focus. È il caso tipico di [4.1.3 Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html) (AA); il `role="status"` della tecnica [ARIA22](https://www.w3.org/WAI/WCAG22/Techniques/aria/ARIA22) è l'equivalente.

```html title="Filter.astro"
<p data-filter-status="projects" data-template="{n} progetti" aria-live="polite">26 progetti</p>
<div role="group" aria-label="Filtra per tipo" data-filter-group="projects">
  <button type="button" class="chip" data-filter="all" aria-pressed="true">Tutti</button>
  <button type="button" class="chip" data-filter="sap" aria-pressed="false">SAP</button>
</div>
```

Il JavaScript, in sostanza, fa tre cose: mette `hidden` sugli elementi esclusi, che così escono anche dall'albero di accessibilità; aggiorna `aria-pressed`; riscrive il testo della regione live. La regione esiste già nell'HTML generato a build-time: una regione creata al volo rischia di non essere annunciata. Senza JavaScript si vede tutto, con i conteggi calcolati in fase di build.

## Target da 44 px

[2.5.8 Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html), nuovo in WCAG 2.2 al livello AA, chiede target di almeno 24×24 px CSS. Le eccezioni sono cinque; la più interessante è la spaziatura: un target più piccolo passa se un cerchio di 24 px centrato su di esso non interseca altri target né i cerchi degli altri target piccoli. Un'altra esclude i link dentro una frase.

Ho scelto 44 px, la misura del criterio AAA [2.5.5 Target Size (Enhanced)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced.html): pulsanti, chip, voci di menu e dell'indice, breadcrumb, link del footer. Una regola sola si rispetta meglio di cinque eccezioni valutate caso per caso.

Quasi tutto, a essere onesti. Lo switch di lingua misura almeno 44×40, e il pulsante "Copia" dei blocchi di codice è alto 36 px: sopra il minimo AA, sotto la mia regola. I link nel testo restano alti quanto la riga, come prevede l'eccezione.

## Motion che si fa da parte

[2.3.3 Animation from Interactions](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html) è AAA, fuori dal perimetro AA. L'ho seguito lo stesso: le animazioni non essenziali legate allo scroll rientrano nel suo ambito e, per chi ha disturbi vestibolari, significano vertigini, nausea e mal di testa.

Tutto il motion passa da [`gsap.matchMedia()`](https://gsap.com/docs/v3/GSAP/gsap.matchMedia()/). Con `prefers-reduced-motion: reduce` la funzione non gira e non nasce nessun tween. Se la preferenza cambia a pagina aperta, GSAP annulla da solo animazioni e ScrollTrigger creati lì dentro.

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

`gsap.from()` non è casuale: lo stato finale è quello scritto nell'HTML, e l'opacità a zero esiste solo durante l'animazione. Senza JavaScript, o con reduced motion, niente parte invisibile. Ogni reveal avviene una volta sola e niente sparisce quando lo superi. In CSS la stessa preferenza azzera di fatto transizioni e spostamenti al passaggio del mouse. L'effetto dell'hero che perdeva padding è stato rimosso, non ammorbidito.

> **Da provare.** Attiva "Riduci movimento" nelle impostazioni di accessibilità del sistema operativo, oppure emula `prefers-reduced-motion: reduce` dal pannello Rendering dei DevTools di Chrome, e ricarica la [home](/). È già tutto al suo posto, senza entrate in scena.

## Forced colors: quando i colori li sceglie il sistema

Con i temi a contrasto di Windows la media query `forced-colors: active` diventa vera e il browser sostituisce i colori della pagina con quelli di sistema. Per la specifica [CSS Color Adjustment](https://www.w3.org/TR/css-color-adjust-1/), in questa modalità `box-shadow` vale `none`: l'ombra piena sfalsata, la firma neo-brutalista, sparisce. Restano i bordi, e lì intervengo.

```css title="tokens.css"
@media (forced-colors: active) {
  .btn, .card-interactive, .chip { border-color: ButtonText; }
  .chip[aria-pressed="true"] { forced-color-adjust: none; background: Highlight; color: HighlightText; }
}
```

Pulsanti, card e chip prendono il colore di sistema dei controlli. Il chip premuto è il caso delicato: il suo stato è disegnato dal fondo pieno, e in forced colors anche lo sfondo viene sostituito. Con `forced-color-adjust: none` riprendo il controllo solo su quel chip e uso `Highlight`/`HighlightText`, che arrivano dal tema scelto dall'utente. L'anello di focus resta: cambia solo colore.

## Cosa ho imparato

- **Le regole vengono prima della palette.** Fissare soglie e comportamenti prima del look rende ogni scelta verificabile, non una questione di gusto.
- **I numeri si calcolano, non si copiano.** Anche quando arrivano da una documentazione curata.
- **WCAG è il minimo.** Una regola semplice si applica meglio di un minimo con cinque eccezioni.
- **Il progressive enhancement previene molti problemi.** Se il contenuto è completo senza JavaScript, motion e filtri possono solo aggiungere.

## Cosa resta da fare

- **Un giro completo con screen reader** su tutte le pagine: NVDA su Windows, VoiceOver su macOS e iOS. Le regole sono verificate; l'esperienza d'uso va ascoltata.
- **Un fallback per `:has()`.** Il link della card delega l'anello alla card: un browser senza `:has()` non mostrerebbe nessun focus. Basta spostare `outline: none` dentro `@supports selector(:has(*))`.
- **La semantica dei filtri.** Sono mutuamente esclusivi e premere un chip già attivo non lo disattiva, cosa che da un toggle button non ti aspetti. Voglio valutare un gruppo di radio.
- **44 px anche per i ritardatari:** switch di lingua e pulsante "Copia".
- **Il tema dei blocchi di codice.** I colori del prototipo passano (il più debole, quello dei commenti, fa 6,4:1), ma il tema Shiki definitivo va ricontrollato.
- **Una [dichiarazione di accessibilità](https://www.w3.org/WAI/planning/statements/)** pubblica, con i limiti noti scritti nero su bianco.

Se trovi un problema, scrivimi dalla [sezione contatti](/#contatti). È il tipo di bug report che preferisco.
