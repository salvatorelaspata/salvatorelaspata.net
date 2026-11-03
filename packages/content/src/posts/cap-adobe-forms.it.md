---
title: "CAP e Adobe Forms: generare PDF da un plugin riutilizzabile"
description: "Da un'integrazione copiata in ogni progetto a un plugin CAP: destination BTP al posto dei segreti, dati convertiti in XML e PDF da SAP Forms service by Adobe."
pubDate: 2026-10-14
tags: ["CAP", "SAP BTP"]
lang: it
translationKey: cap-adobe-forms
urlSlug: cap-adobe-forms
cover:
  icon: package
relatedProject: cap-plugin-adobe-forms
draft: true
---

Ogni applicazione CAP, prima o poi, chiede un PDF. Una fattura, un verbale, una delibera. Su SAP BTP la risposta standard si chiama [SAP Forms service by Adobe](https://help.sap.com/docs/forms-service-by-adobe/sap-forms-service-cf/sap-forms-service-by-adobe): template disegnati con Adobe LiveCycle Designer, dati in XML, una REST API che restituisce il documento.

Il problema non era il servizio. Era il codice intorno. La stessa integrazione viveva copiata in più progetti: richiesta del token OAuth2, conversione dei dati in XML, chiamata di rendering, decodifica della risposta. Ogni copia aveva la sua piccola variante e il suo bug personale. [[DA COMPLETARE: in quanti progetti era copiata l'integrazione e un esempio concreto di bug nelle copie]]

Copiare codice tra progetti è un modo efficientissimo di moltiplicare i bug. Così ho preso la versione meno peggio e l'ho trasformata in un pacchetto npm: [`@salvatorela/cap-plugin-adobe-forms`](/projects/cap-plugin-adobe-forms).

## Cosa deve fare l'integrazione

Per generare un PDF servono quattro passaggi:

1. **Un token.** La REST API è protetta da OAuth2 con client credentials: client ID e secret arrivano dalla service key dell'istanza.
2. **Il template.** Se i form stanno nel template store del servizio, `GET /v1/forms/{nome}` restituisce i template XDP disponibili e lo schema XSD dei dati.
3. **I dati.** Un documento XML conforme allo schema, codificato in base64.
4. **Il rendering.** `POST /v1/adsRender/pdf` con template e dati nel body JSON. Il PDF torna indietro, anche lui in base64, nel campo `fileContent` della risposta.

Niente di difficile, ma sono quattro punti in cui sbagliare, moltiplicati per il numero di progetti. Gli endpoint sono documentati nella sezione [REST API Endpoints](https://help.sap.com/docs/forms-service-by-adobe/sap-forms-service-cf/rest-api-endpoints) del Help Portal.

## Come funziona un plugin CAP

CAP ha un meccanismo di plugin semplice e un po' sottovalutato. La [documentazione su Capire](https://cap.cloud.sap/docs/node.js/cds-plugins) lo riassume così: basta un file `cds-plugin.js` accanto al `package.json` del pacchetto, e CAP lo rileva e lo carica da solo quando il server parte con `cds serve`, `cds watch` e gli altri comandi della CLI.

In pratica CAP scorre `dependencies` e `devDependencies`, seleziona i pacchetti con un `cds-plugin.js` nella root, aggiunge a `cds.env` la sezione `cds` del loro `package.json` e solo dopo carica i plugin. Il punto interessante è il terzo: un plugin si porta dietro la sua configurazione di default. Il mio dichiara un servizio richiesto, `adobeForms`:

```json title="cap-plugin-adobe-forms/package.json"
{
  "main": "cds-plugin.js",
  "cds": {
    "requires": {
      "adobeForms": {
        "kind": "rest",
        "impl": "./lib/adobe-service",
        "destination": "ADOBE_FORMS_API",
        "credentials": {
          "baseUrl": "",
          "tokenUrl": "",
          "clientId": "",
          "clientSecret": ""
        }
      }
    }
  }
}
```

C'è però un dettaglio. Per `cds.connect.to`, un `impl` che inizia con `./` è [relativo alla root del progetto](https://cap.cloud.sap/docs/node.js/cds-connect). Del progetto che installa il plugin, non del plugin. Senza correzioni, CAP cercherebbe `lib/adobe-service` nella tua applicazione. Il `cds-plugin.js` serve proprio a questo:

```js title="cap-plugin-adobe-forms/cds-plugin.js"
const cds = require('@sap/cds')

cds.on('bootstrap', () => {
  const requires = cds.env.requires
  if (requires?.adobeForms) {
    requires.adobeForms.impl = require.resolve('./lib/adobe-service')
  }
})

cds.on('served', () => {
  cds.log('adobe-forms-plugin').info('CAP Adobe Forms plugin loaded')
})
```

`bootstrap` è un [evento di `cds.server`](https://cap.cloud.sap/docs/node.js/cds-server) emesso una sola volta, subito dopo la creazione dell'app Express e prima che vengano aggiunti middleware e servizi. In quel momento `require.resolve` trasforma il percorso in uno assoluto, calcolato a partire dal plugin. È il genere di dettaglio che scopri solo installando il pacchetto in un progetto vero.

Il servizio è una classe che estende `cds.Service` e delega a un piccolo client HTTP. `cds.connect.to('adobeForms')` restituisce un oggetto con sei metodi: `renderPDF`, `listForms`, `getFormDetails`, `getFormSchema`, `health` e `remoteHealth`.

## Installazione e configurazione

Il plugin richiede Node.js 20 o superiore e ha `@sap/cds` `^9.1.0` come peer dependency. Si installa come qualsiasi pacchetto:

```bash title="terminale"
npm install @salvatorela/cap-plugin-adobe-forms
```

Le modalità di autenticazione sono due, e la scelta è automatica: se in `credentials` sono valorizzati tutti e quattro i campi (`baseUrl`, `tokenUrl`, `clientId`, `clientSecret`) il plugin usa le credenziali dirette, altrimenti passa dalla destination.

### In produzione: una destination BTP

Nel cockpit BTP si crea una destination HTTP con autenticazione `OAuth2ClientCredentials`:

| Campo | Valore |
| --- | --- |
| Name | `ADOBE_FORMS_API` |
| Type | `HTTP` |
| Proxy Type | `Internet` |
| Authentication | `OAuth2ClientCredentials` |
| URL | URL base della REST API, dalla service key |
| Client ID | `uaa.clientid` dalla service key |
| Client Secret | `uaa.clientsecret` dalla service key |
| Token Service URL | `uaa.url` + `/oauth/token` |

Nell'applicazione basta il nome, che peraltro è già il default:

```json title="package.json"
{
  "cds": {
    "requires": {
      "adobeForms": {
        "destination": "ADOBE_FORMS_API"
      }
    }
  }
}
```

Il plugin risolve la destination con `getDestination` e la chiama con `executeHttpRequest` della [SAP Cloud SDK](https://sap.github.io/cloud-sdk/docs/js/features/connectivity/destinations), che gestisce anche il flusso OAuth2. Nel codice non c'è un segreto, e nel `package.json` nemmeno. Se la destination non si trova, l'errore ha un codice preciso: `ADOBE_FORMS_DESTINATION_NOT_FOUND`.

### In locale: credenziali dirette

Per sviluppare in locale una destination è spesso scomoda. Qui il plugin chiede il token da solo, con `grant_type=client_credentials`, e lo tiene in cache fino a 30 secondi prima della scadenza.

Capire è esplicito: [mai segreti in `package.json` o `.cdsrc.json`](https://cap.cloud.sap/docs/node.js/cds-connect). Il posto giusto è `.cdsrc-private.json`, che è per definizione personale e [non va committato](https://cap.cloud.sap/docs/node.js/cds-env):

```json title=".cdsrc-private.json"
{
  "requires": {
    "adobeForms": {
      "credentials": {
        "baseUrl": "https://<host-della-rest-api>",
        "tokenUrl": "https://<host-xsuaa>/oauth/token",
        "clientId": "<uaa.clientid>",
        "clientSecret": "<uaa.clientsecret>"
      }
    }
  }
}
```

> **Nota.** La scelta della modalità è implicita, e questo ha un rovescio. Se dimentichi uno dei quattro campi non ottieni un errore sulle credenziali: il plugin prova la destination, e l'errore che vedi parla di quella. Quando in locale qualcosa non torna, controlla prima `credentials`.

## Dai dati CDS all'XML

Il servizio di Adobe vuole XML. CAP ragiona in oggetti. In mezzo c'è il plugin, che accetta un oggetto JavaScript e lo serializza con poche regole: la radice è sempre `FormData`, gli oggetti annidati diventano elementi annidati, gli array diventano elementi fratelli con lo stesso nome. Se passi una stringa, la considera XML già pronto e la invia così com'è.

Il mapping, però, resta tuo. I nomi degli elementi li decide lo schema XSD del template, non il modello CDS. Per questo c'è `getFormSchema(formId)`: legge i dettagli del form, decodifica lo schema da base64 e restituisce l'XSD in chiaro.

> **Da provare.** Prima di scrivere il mapping, chiama `getFormSchema` sul tuo template e leggi l'XSD. Nomi degli elementi e cardinalità delle tabelle sono tutti lì. Poi chiama `remoteHealth()`: fa una vera chiamata al servizio (per default `GET /v1/forms`) e ti dice se destination e autenticazione funzionano.

C'è anche un passaggio che il plugin fa per te: la lingua. `renderPDF` legge i template disponibili per il form e sceglie quello la cui `language` corrisponde al locale richiesto, altrimenti usa il primo. Il locale viene normalizzato nel formato che l'API si aspetta: `it` diventa `it_IT`, `it-IT` diventa `it_IT`, nessun locale diventa `en_US`.

Infine, cosa non fa. La serializzazione è minimale: niente escape di `&`, `<` e `>` nei valori, nessuna validazione contro l'XSD. Se i dati arrivano da campi liberi, come una ragione sociale con la "&", l'escape va fatto prima, oppure si passa direttamente una stringa XML. Sono le due cose che oggi mancano di più.

## Il PDF: Buffer o base64

L'API restituisce il PDF in base64 dentro un JSON. `renderPDF` può restituirlo così com'è, con `options: { base64: true }`, utile se finisce in un altro JSON o in un'email. Con `options: { base64: false }` restituisce un `Buffer`.

Il default di `options.base64` è cambiato tra una versione e l'altra del plugin. Io lo passo sempre esplicito: costa una riga e toglie un dubbio.

Va detto anche cosa non è: uno stream. Il PDF arriva intero in memoria, decodificato. Se però lo vuoi servire come download da un servizio CAP, puoi avvolgere il `Buffer` in un `Readable` e restituirlo da una funzione con `@Core.MediaType`. È lo [streaming custom di CAP Node.js](https://cap.cloud.sap/docs/node.js/best-practices), che Capire indica ancora come beta.

Con `Invoices` e `InvoiceItems`, collegati da un'associazione `invoice`, il servizio espone una funzione legata alla fattura:

```cds title="srv/invoice-service.cds"
using { my.billing as db } from '../db/schema';

service InvoiceService {
  @Core.MediaType: 'application/pdf'
  type PDF : LargeBinary;

  entity Invoices as projection on db.Invoices actions {
    function print() returns PDF;
  };
  entity InvoiceItems as projection on db.InvoiceItems;
}
```

E l'handler collega i pezzi:

```js title="srv/invoice-service.js"
const cds = require('@sap/cds')
const { Readable } = require('node:stream')

module.exports = class InvoiceService extends cds.ApplicationService {
  async init() {
    const adobeForms = await cds.connect.to('adobeForms')
    const { Invoices, InvoiceItems } = this.entities

    this.on('print', Invoices, async (req) => {
      const invoice = await SELECT.one.from(req.subject)
      if (!invoice) return req.reject(404, 'Fattura non trovata')
      const items = await SELECT.from(InvoiceItems).where({ invoice_ID: invoice.ID })

      const pdf = await adobeForms.renderPDF({
        templateName: 'INVOICE',
        locale: req.locale,
        payload: {
          Header: { Number: invoice.number, Date: invoice.date, Customer: invoice.customer },
          Items: { Row: items.map(i => ({ Description: i.description, Amount: i.amount })) }
        },
        options: { base64: false }
      })

      return Object.assign(Readable.from(pdf), {
        mimetype: 'application/pdf',
        filename: `fattura-${invoice.number}.pdf`
      })
    })

    return super.init()
  }
}
```

`Header`, `Items` e `Row` sono i nomi del mio template di esempio. I tuoi li trovi nell'XSD. L'array `Row` diventa una sequenza di elementi `<Row>` fratelli, uno per riga.

## I test

I test unitari usano `node:test` e `node:assert`, con un mock di `global.fetch`. Nessuna credenziale, nessuna connessione a BTP. Verificano i punti in cui un'integrazione del genere si rompe senza far rumore: i percorsi chiamati, gli header, la normalizzazione del locale, la presenza degli elementi attesi nell'XML generato, i codici di errore.

Poi c'è `test/integration.js`, che usa una vera service key letta da `.env` con `node --env-file=.env`. Chiama in sequenza `remoteHealth`, `listForms`, `getFormDetails`, `getFormSchema` e `renderPDF`, e salva il PDF su disco. Non è elegante, ma risponde all'unica domanda che conta: il documento esce?

Una precisazione onesta: i test controllano la forma dell'XML, non lo validano contro lo schema del template. Test e script vivono nel [repository](https://github.com/salvatorelaspata/cap-plugin-adobe-forms), non nel pacchetto npm.

## Cosa ho imparato

**Un plugin CAP è soprattutto configurazione.** Il codice è poco. Il valore sta nel default dichiarato in `cds.requires`, che ogni progetto eredita senza copiarlo. E nel percorso di `impl`, che va risolto dal plugin e non dall'applicazione.

**I segreti hanno un posto preciso.** In produzione una destination, in locale `.cdsrc-private.json`, nel repository niente. Sembra ovvio, ma è la prima cosa da controllare quando un'integrazione passa di progetto in progetto.

**Esplicito batte implicito.** La scelta automatica tra credenziali e destination è comoda finché funziona. Il default di `base64` è comodo finché qualcuno non lo cambia. Quando un parametro decide il tipo di ritorno, va passato.

**Un plugin non dovrebbe decidere cosa è pubblico.** Le prime versioni nel repository esponevano anche un servizio OData su `/adobe/forms`, con le azioni di rendering e di health check. L'ho tolto: oggi il plugin è solo un client. Quali endpoint esporre, e con quali autorizzazioni, lo decide l'applicazione.

Se il team arriva da REST e si chiede perché un PDF esca da una funzione OData, ho scritto anche perché [OData non è REST (e va bene così)](/blog/odata-non-e-rest).
