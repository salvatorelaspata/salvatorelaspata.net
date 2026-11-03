---
title: "OData non è REST (e va bene così)"
description: "$metadata, query option, $batch, ETag e deep insert: cosa cambia per un team abituato a REST che incontra OData in SAP, e quando basta un endpoint semplice."
pubDate: 2026-09-02
tags: ["SAP BTP"]
lang: it
translationKey: odata-non-e-rest
urlSlug: odata-non-e-rest
cover:
  icon: code
relatedProject: http-like-restfull-vs-odata
draft: false
---

Un team che ha sempre scritto API REST entra in un progetto SAP. Apre il tab Network di un'app Fiori e trova richieste a `$batch`, URL pieni di dollari, risposte che iniziano con `@odata.context` o, peggio, avvolte in un misterioso oggetto `d`. La prima reazione è cercare lo Swagger. La seconda è proporre un wrapper REST "più pulito" sopra il servizio.

Reazioni comprensibili, ma partono da un equivoco: trattare OData come una API REST con qualche convenzione strana. Ne avevo parlato anche nelle slide [HTTP like RESTful vs OData](/projects/http-like-restfull-vs-odata).

OData usa HTTP, URL e verbi come una API REST. Ma è un protocollo standard, oggi alla versione 4.01 in OASIS, con un modello dati, un linguaggio di query e regole precise su batch e concorrenza. Quello che in REST decidi tu, progetto per progetto, in OData è già deciso. È un vincolo. È anche il motivo per cui conviene.

## Il contratto viene prima: `$metadata`

Ogni servizio OData espone un documento all'URL radice seguito da `$metadata`. La [specifica](https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html) lo definisce come la descrizione di tipi, entity set, funzioni e azioni che il servizio capisce. Il linguaggio è il CSDL, che descrive un modello EDM (Entity Data Model):

- **entity type**, con chiave e proprietà tipizzate (`Edm.String`, `Edm.Int32`, `Edm.DateTimeOffset`…);
- **navigation property**, cioè le relazioni tra entità;
- **entity set**, le collezioni che si possono interrogare;
- **action** e **function**, le operazioni che non sono CRUD.

Il formato di default è XML. Dalla 4.01 esiste anche una rappresentazione JSON del CSDL.

La differenza con REST non è che OData abbia un contratto e REST no: OpenAPI esiste. La differenza è che `$metadata` non è documentazione scritta a parte. È il servizio che descrive se stesso. In CAP, per esempio, viene generato dallo stesso modello CDS che risponde alle richieste, quindi non può restare indietro.

In SAP questo conta più che altrove. Le app Fiori elements sono frontend generici: [costruiscono pagine e controlli](https://cap.cloud.sap/docs/guides/uis/fiori) leggendo il `$metadata` e le annotazioni. Niente `$metadata`, niente UI.

## Le query fanno parte del protocollo

In una API REST classica ogni team inventa i suoi parametri: `?status=open`, `?page=2&size=20`, `?include=items`. In OData le opzioni di query sono definite dalla specifica e valgono per ogni servizio:

| Opzione | A cosa serve | Esempio |
| --- | --- | --- |
| `$filter` | filtra con un'espressione booleana | `$filter=status eq 'open' and total gt 100` |
| `$select` | sceglie le proprietà restituite | `$select=ID,customer,total` |
| `$expand` | include le entità collegate | `$expand=items` |
| `$orderby` | ordina | `$orderby=createdAt desc` |
| `$top` / `$skip` | paginazione | `$top=20&$skip=40` |
| `$count` | conteggio totale | `$count=true` |

Combinate, diventano una richiesta che in REST richiederebbe un endpoint dedicato:

```http title="richiesta HTTP"
GET /odata/v4/order/Orders?$filter=status eq 'open' and total gt 100
    &$select=ID,customer,total
    &$expand=items($select=product,quantity;$orderby=quantity desc)
    &$orderby=createdAt desc
    &$top=20
    &$count=true
```

A capo e spazi sono lì solo per leggibilità: in una richiesta vera vanno tolti o codificati. In v4 `$expand` accetta opzioni annidate tra parentesi, separate da punto e virgola. Qui le righe di ogni ordine arrivano con due soli campi e già ordinate. Una richiesta, un round trip, nessun `/orders/{id}/items` da progettare.

La grammatica è abbastanza regolare da poterla tradurre a macchina. [odata-to-sql](/projects/odata-to-sql) è un piccolo parser che trasforma un URL OData v2 in clausole SQL. [sql-odata](/projects/sql-odata) è il prototipo del percorso inverso: esporre in OData v2 le entità di un database relazionale.

## `$batch` e changeset

Un'app Fiori fa molte richieste. OData le può impacchettare: una sola `POST` all'endpoint `$batch`, con dentro più richieste in formato `multipart/mixed`. Le modifiche si raggruppano in **changeset**, unità atomiche: o passano tutte o non passa nessuna. In v2 un changeset non può contenere letture.

La 4.01 aggiunge un [formato JSON alternativo](https://docs.oasis-open.org/odata/new-in-odata/v4.01/new-in-odata-v4.01.html) per batch, con gruppi di atomicità e dipendenze tra richieste. Se una richiesta fallisce, quelle che dipendono da lei rispondono `424 Failed Dependency`.

Non è un dettaglio accademico. Il modello OData v4 di UI5 usa per default il gruppo `$auto`, che raccoglie le richieste in un batch, e la documentazione UI5 sconsiglia di andare in produzione senza batch: non tutte le funzionalità del modello funzionano senza. Ecco perché il tab Network di un'app Fiori mostra quasi solo `$batch`.

> **Da provare.** Per fare debug di un'app UI5 con modello v4, imposta temporaneamente il group ID a `$direct`. Le richieste partono una per una e nel tab Network tornano leggibili. Poi rimetti `$auto`, prima che qualcuno se ne accorga.

## ETag e concorrenza ottimistica

Due utenti aprono lo stesso ordine. Il primo salva. Il secondo salva un minuto dopo e sovrascrive senza saperlo. In REST lo risolvi a mano, se te ne ricordi. In OData è nel protocollo: l'entità ha un ETag, il client lo rimanda nell'header `If-Match` quando aggiorna o cancella, e se nel frattempo il record è cambiato la risposta è `412 Precondition Failed`.

In CAP basta annotare un elemento con `@odata.etag`. [Capire](https://cap.cloud.sap/docs/guides/services/served-ootb) suggerisce `modifiedAt` dell'aspect `managed`, che si aggiorna da solo. La stessa logica vale in lettura con `If-None-Match`: se il record non è cambiato, `304 Not Modified`.

> **Nota.** Sull'header `If-Match` mancante v2 e v4 non dicono la stessa cosa. La specifica v2 indica che il server dovrebbe rifiutare la richiesta con `412`. La 4.01 prevede `428 Precondition Required`. Se il tuo client parla con servizi di entrambe le versioni, gestisci tutti e due i codici.

## Deep insert

Un ordine con le sue righe, in REST, sono spesso più chiamate e una consistenza da garantire a mano. In OData è un deep insert: una `POST` dell'entità con le entità collegate inline. La specifica v4 è netta: o vengono create tutte, o nessuna.

```http title="richiesta HTTP"
POST /odata/v4/order/Orders
Content-Type: application/json

{
  "customer": "ACME",
  "status": "open",
  "items": [
    { "product": "Bulloni M8", "quantity": 100 },
    { "product": "Dadi M8", "quantity": 100 }
  ]
}
```

In v2 il deep insert esiste già: un albero di entry in una sola `POST`. La 4.01 aggiunge il deep update. In CAP vale per le composizioni: il runtime crea o aggiorna in profondità le entità figlie. Per le associazioni, invece, si limita a valorizzare le chiavi esterne verso record esistenti.

## v2 e v4: le differenze che contano

In SAP si incontrano ancora entrambe le versioni. CAP serve v4 di default; v2 passa dal pacchetto `@cap-js-community/odata-v2-adapter`, e [Capire](https://cap.cloud.sap/docs/guides/protocols/odata) dichiara OData V2 deprecato, da usare per UI esistenti o per controlli che non funzionano ancora con v4. Le differenze su cui si inciampa:

| Tema | OData v2 | OData v4 |
| --- | --- | --- |
| Conteggio inline | `$inlinecount=allpages` | `$count=true` |
| Risposta JSON | `{"d": {"results": [...]}}` con `__metadata` e `__count` (stringa) | `value`, `@odata.context`, `@odata.count`; dalla 4.01 senza prefisso `odata.` |
| Date | `/Date(<millisecondi>)/` | ISO 8601 |
| Ricerca in stringhe | `substringof('x', Campo) eq true` | `contains(Campo, 'x')` |
| Filtri su collezioni | non previsti | `any` / `all` |
| `$expand` | solo percorsi di navigazione | opzioni annidate tra parentesi |
| Aggiornamento parziale | `MERGE` | `PATCH` |
| `If-Match` mancante | `412` | `428` |
| `$batch` | `multipart/mixed` | `multipart/mixed`, dalla 4.01 anche JSON |
| `$metadata` | CSDL XML | CSDL XML, dalla 4.01 anche JSON |

La riga che fa perdere più tempo è la seconda. Un client scritto per v2 che legge `d.results` da un servizio v4 si ferma su un `TypeError`: `d` non esiste, e l'errore non dice perché.

## REST classico vs OData

| | REST classico | OData |
| --- | --- | --- |
| Contratto | OpenAPI, se qualcuno lo scrive e lo aggiorna | `$metadata`, esposto dal servizio stesso |
| Filtri e paginazione | parametri diversi per ogni API | `$filter`, `$orderby`, `$top`, `$skip`, `$count`, uguali ovunque |
| Relazioni | endpoint dedicati o più chiamate | `$expand`, annidabile in v4 |
| Batch | da progettare, se serve | `$batch` con changeset atomici |
| Concorrenza | a mano, quando c'è | ETag e `If-Match` nel protocollo |
| Tooling | qualunque client HTTP | client generici, Fiori elements, modelli OData di UI5, CAP |

## Lo stesso servizio in CAP

Tutto quello visto finora, in CAP, sta in due file CDS. Il modello:

```cds title="db/schema.cds"
namespace my.orders;
using { cuid, managed } from '@sap/cds/common';

entity Orders : cuid, managed {
  customer : String(100);
  status   : String(20);
  total    : Decimal(10,2);
  items    : Composition of many OrderItems on items.order = $self;
}

entity OrderItems : cuid {
  order    : Association to Orders;
  product  : String(100);
  quantity : Integer;
}
```

E il servizio, con l'ETag:

```cds title="srv/order-service.cds"
using { my.orders as db } from '../db/schema';

service OrderService {
  entity Orders     as projection on db.Orders;
  entity OrderItems as projection on db.OrderItems;
}

annotate OrderService.Orders with { modifiedAt @odata.etag }
```

Con `cds watch`, il servizio risponde su `/odata/v4/order`: CAP toglie il suffisso `Service` dal nome. Risponde alla `GET` con `$filter` e `$expand`, alla deep insert grazie alla composizione, agli aggiornamenti con `If-Match`. Senza una riga di JavaScript.

Due dettagli. Primo: per default i READ generici troncano i risultati a 1.000 record, e il limite si regola con `@cds.query.limit`. Secondo: se serve anche REST, non occorre un altro servizio. Con `@protocol: ['odata', 'rest']` lo stesso `OrderService` risponde su `/odata/v4/order` e su `/rest/order`, come descritto in [Capire](https://cap.cloud.sap/docs/node.js/cds-serve).

## Quando OData conviene (e quando no)

OData conviene quando:

- il consumatore è una UI Fiori elements o UI5 con modello OData, che parla quel protocollo e vive di `$metadata` e annotazioni;
- il servizio è CAP e orientato ai dati: il protocollo arriva gratis dal modello;
- servono liste, filtri, paginazione e relazioni, cioè esattamente il caso per cui le query option sono state pensate.

Un endpoint REST semplice è meglio quando:

- devi ricevere webhook o callback, e il formato lo decide qualcun altro;
- l'operazione non riguarda entità, e un'action OData sarebbe solo cerimonia;
- il client è esterno e non deve poter comporre query arbitrarie. Esporre `$filter` ed `$expand` significa accettare anche le query che non avevi previsto.

Un criterio semplice: se chi consuma lavora su entità, OData; se chiama un'operazione, REST.

## Cosa ho imparato

**Il contratto è il punto.** OData non è REST: è REST con un contratto. Query option, batch, ETag e deep insert discendono tutti da lì. Chi arriva da REST capisce OData più in fretta partendo da `$metadata` che da Postman.

**Non combattere il protocollo.** Parametri custom accanto alle query option, wrapper REST sopra servizi OData: ogni scorciatoia del genere toglie ai client generici, Fiori elements in testa, proprio quello che li fa funzionare.

**v2 è deprecato, non sparito.** I servizi nuovi nascono v4. Quelli esistenti resteranno v2 ancora a lungo, e conviene conoscere la tabella delle differenze prima che sia lei a presentarsi.
