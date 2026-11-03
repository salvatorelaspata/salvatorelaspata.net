# Contenuti di salvatorelaspata.net e salvatorelaspata.dev

Tutto quello che i due siti dicono di me sta in questa cartella (`packages/content/src/`): profilo, bio, esperienze, progetti, tecnologie e articoli. Ogni push su `main` ricostruisce entrambi i siti, quindi una modifica qui arriva su .net e su .dev.

`apps/net` e `apps/dev` si toccano solo per cambiare **come** i contenuti appaiono (layout, etichette, stili), non **cosa** dicono.

## Dove si modifica cosa

Percorsi relativi a `packages/content/src/`.

| Cosa | File | Note |
|---|---|---|
| Email, link, città, numeri dell'hero, Cal.com | [`profile.ts`](src/profile.ts) | Usato anche dalla vCard e da `neofetch` su .dev |
| Bio, motto, fatti, competenze, stack, formati delle call | [`bio.ts`](src/bio.ts) | Italiano e inglese nello stesso file; TypeScript impone che abbiano la stessa forma |
| Esperienze | [`experiences/`](src/experiences/)`<nome>.it.json` + `.en.json` | `index` più alto = più recente; per il ruolo attuale `end: null` e `current: true`; date nel formato `MM/AAAA` |
| Progetti | [`projects/`](src/projects/)`NN_slug.json` + `.it.md` + `.en.md` | `NN` è l'id: il più alto va in cima. `featured: true` lo mette in evidenza su .net |
| Tecnologie | [`tech/`](src/tech/)`<categoria>/<nome>.js` | Esporta `id`, `title`, `link`, `svg`. Se il titolo finisce con `(learning)` diventa "in studio" |
| Articoli | [`posts/`](src/posts/)`<chiave>.it.md` + `.en.md` | Stesso `translationKey` nelle due lingue |

## Il giro di lavoro

1. Crea un branch e fai le modifiche.
2. Controlla in locale con `npm run dev` (.net, porta 4321) e `npm run dev:dev` (.dev, porta 4322).
3. Lancia `npm run build`, che verifica tipi, schemi e dizionari di entrambi i siti, e `npm test`.
4. Apri la PR. Se su Cloudflare le build sui branch sono attive, ogni PR ha un URL di anteprima per tutti e due i Worker.
5. Fai il merge: si aggiornano Cloudflare (.net e .dev), GitHub Pages e l'immagine Docker.

## Un articolo nuovo

Crea `posts/<chiave>.it.md` e `posts/<chiave>.en.md`:

```md
---
title: "Titolo dell'articolo"
description: "Tra 140 e 160 caratteri: è anche la meta description."
pubDate: 2026-11-10
tags: ["SAP BTP"]
lang: it
translationKey: mio-articolo
urlSlug: mio-articolo
cover:
  icon: code
relatedProject: odata-to-sql
draft: true
---
```

- **Bozze:** con `draft: true` l'articolo è nascosto ovunque, anche in locale. Per vederlo impaginato metti `false` sul branch e controlla l'anteprima della PR.
- **Tag:** solo quelli in [`blogTags.ts`](src/blogTags.ts).
- **`urlSlug`:** può essere diverso tra le due lingue, ma dopo la pubblicazione non va più cambiato, perché è l'URL dell'articolo (e .dev punta a quello di .net come canonical).
- **`cover.icon`** (facoltativo): il nome di un'icona di [`apps/net/src/lib/icons.ts`](../../apps/net/src/lib/icons.ts), per esempio `code`, `blocks`, `access`, `book`.
- **`relatedProject`** (facoltativo): lo slug di un progetto esistente.
- **Immagini:** mettile in `posts/images/` e richiamale con `![testo alternativo](./images/foto.webp)`. Astro le ottimizza e compaiono su entrambi i siti. Non metterle in `apps/*/public`, altrimenti esistono su un sito solo.
- **Titoli:** niente H1 nel testo; si parte da `##`.
- **Callout:** un blockquote che inizia con `**Nota.**` o `**Da provare.**` (`**Note.**` / `**Try it.**` in inglese) diventa un riquadro su .net; su .dev resta un blockquote.
- **Blocchi di codice:** ```` ```js title="file.js" ```` mostra il nome del file su .net.

## Un progetto nuovo

- Copia un JSON esistente in `projects/`, alza l'`id` e scrivi i due `.md` (italiano e inglese) senza H1.
- `kind` e `filters` accettano solo i valori in [`types.ts`](src/types.ts) (`PROJECT_KINDS`, `PROJECT_FILTERS`).
- `summary` compare negli elenchi. `description` compare su .dev quando manca il `.md`.
- I testi inglesi di `subtitle`, `summary` e `description` vanno nel blocco `en` del JSON.
- `img` è opzionale ed è un percorso dentro `apps/net/public`: la mostra solo .net. Senza immagine, .net genera una copertina dallo slug.

## Quando cambia ruolo, team o anni di esperienza

È il punto più fragile. Alcuni fatti sono sia nei dati sia scritti nel testo:

- [`profile.ts`](src/profile.ts): `role`, `company`, `experienceYears`, `teamSize` (i numeri dell'hero, `neofetch` e la vCard).
- [`bio.ts`](src/bio.ts), in entrambe le lingue:
  - `kicker`, `intro` e `summary` dicono "12 anni";
  - il fatto "Ruolo attuale" dice "16 persone".
- [`experiences/gotonext.*.json`](src/experiences/): `summary` e `details` dicono "16 persone".
- `apps/net/src/i18n/{it,en}.ts`: `meta.description` e `article.authorText` citano il ruolo e GOTONEXT.

Prima di aggiornare, una ricerca dalla root del repo te li trova tutti:

```bash
grep -rnE "16 persone|16 people|16-person|12 anni|12 years|Practice Leader" packages/content/src apps/*/src/i18n
```

## Cosa blocca la build e cosa no

**Blocca** (`npm run build` fallisce, quindi te ne accorgi prima del deploy):

- un JSON di progetto non valido o con un `kind`/`filter` sconosciuto;
- un frontmatter sbagliato o un tag non ammesso;
- un'etichetta mancante in un dizionario (vedi sotto);
- `bio.ts` con forme diverse tra italiano e inglese.

**Non blocca** (passa senza avvisi, va controllato a mano):

- un'esperienza scritta in una sola lingua: compare solo su quella versione. Ogni file `.it.json` deve avere il suo `.en.json`;
- un `relatedProject` con uno slug sbagliato: su .dev il link sparisce, .net non lo usa;
- il `.md` di un progetto mancante in una lingua: la pagina resta senza testo;
- due tecnologie con lo stesso `id` nella stessa categoria: l'ordine tra le due dipende dal nome del file;
- i numeri della sezione precedente non allineati tra dati e testo.

Per trovare le esperienze presenti in una sola lingua (nessun output = tutto a posto):

```bash
ls packages/content/src/experiences | sed -E 's/\.(it|en)\.json$//' | sort | uniq -u
```

## Quando serve toccare anche le app

Alcune aggiunte richiedono un'etichetta tradotta in ciascun sito. Se manca, la build fallisce e indica il file.

- **Nuovo tag del blog:** aggiungilo in [`blogTags.ts`](src/blogTags.ts) e in `blog.tags` dei quattro dizionari: `apps/net/src/i18n/{it,en}.ts` e `apps/dev/src/i18n/{it,en}.ts`.
- **Nuovo tipo o filtro di progetto:** aggiungilo in [`types.ts`](src/types.ts), in `KIND_ICONS` di [`util.ts`](src/util.ts) (solo per i tipi) e in `projects.kinds` / `projects.filters` dei quattro dizionari.
- **Nuova categoria di tecnologie:** cartella in `tech/`, `TechnologyCategory` in [`types.ts`](src/types.ts), `TECH_CATEGORIES` e `techModules` in [`util.ts`](src/util.ts), più l'etichetta in `stack.categories` (net) e `home.toolCategories` (dev).
