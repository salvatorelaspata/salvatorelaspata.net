---
title: "CAP and Adobe Forms: generating PDFs from a reusable plugin"
description: "From an integration copied into every project to a CAP plugin: a BTP destination instead of secrets, data as XML, PDFs from SAP Forms service by Adobe."
pubDate: 2026-10-14
tags: ["CAP", "SAP BTP"]
lang: en
translationKey: cap-adobe-forms
urlSlug: cap-adobe-forms
cover:
  icon: package
relatedProject: cap-plugin-adobe-forms
draft: true
---

Sooner or later, every CAP application asks for a PDF. An invoice, meeting minutes, a council resolution. On SAP BTP the standard answer is [SAP Forms service by Adobe](https://help.sap.com/docs/forms-service-by-adobe/sap-forms-service-cf/sap-forms-service-by-adobe): templates designed in Adobe LiveCycle Designer, data in XML, a REST API that hands back the document.

The service was never the problem. The code around it was. The same integration lived, copy-pasted, in several projects: fetch an OAuth2 token, convert the data to XML, call the rendering endpoint, decode the response. Every copy had its own little variation and its own personal bug. [[DA COMPLETARE: in quanti progetti era copiata l'integrazione e un esempio concreto di bug nelle copie]]

Copying code between projects is a remarkably efficient way to multiply bugs. So I took the least bad version and turned it into an npm package: [`@salvatorela/cap-plugin-adobe-forms`](/en/projects/cap-plugin-adobe-forms).

## What the integration has to do

Generating a PDF takes four steps:

1. **A token.** The REST API is protected by OAuth2 with client credentials: client ID and secret come from the instance's service key.
2. **The template.** If the forms live in the service's template store, `GET /v1/forms/{name}` returns the available XDP templates and the XSD schema for the data.
3. **The data.** An XML document that matches the schema, base64-encoded.
4. **The rendering.** `POST /v1/adsRender/pdf` with template and data in a JSON body. The PDF comes back, base64-encoded as well, in the `fileContent` field of the response.

Nothing hard, but that's four places to get it wrong, multiplied by the number of projects. The endpoints are documented under [REST API Endpoints](https://help.sap.com/docs/forms-service-by-adobe/sap-forms-service-cf/rest-api-endpoints) on the Help Portal.

## How a CAP plugin works

CAP's plugin mechanism is simple and underrated. The [Capire documentation](https://cap.cloud.sap/docs/node.js/cds-plugins) sums it up: put a `cds-plugin.js` file next to your package's `package.json`, and CAP detects and loads it automatically when the server starts through `cds serve`, `cds watch` and the other CLI commands.

In practice, CAP walks through `dependencies` and `devDependencies`, picks the packages with a `cds-plugin.js` at their root, adds the `cds` section of their `package.json` to `cds.env`, and only then loads the plugins. The third step is the interesting one: a plugin ships with its own default configuration. Mine declares a required service, `adobeForms`:

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

One catch. For `cds.connect.to`, an `impl` starting with `./` is [relative to the project root](https://cap.cloud.sap/docs/node.js/cds-connect). The project installing the plugin, not the plugin itself. Left alone, CAP would look for `lib/adobe-service` inside your application. That is exactly what `cds-plugin.js` is for:

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

`bootstrap` is a [`cds.server` event](https://cap.cloud.sap/docs/node.js/cds-server) emitted once, right after the Express app is created and before any middleware or service is added. At that point `require.resolve` turns the path into an absolute one, computed from the plugin's location. You only find that out by installing the package in a real project.

The service itself is a class extending `cds.Service` that delegates to a small HTTP client. `cds.connect.to('adobeForms')` gives you an object with six methods: `renderPDF`, `listForms`, `getFormDetails`, `getFormSchema`, `health` and `remoteHealth`.

## Installation and configuration

The plugin requires Node.js 20 or later and has `@sap/cds` `^9.1.0` as a peer dependency. It installs like any other package:

```bash title="terminal"
npm install @salvatorela/cap-plugin-adobe-forms
```

Two authentication modes, chosen automatically: if all four `credentials` fields (`baseUrl`, `tokenUrl`, `clientId`, `clientSecret`) have a value, the plugin uses direct credentials; otherwise it goes through the destination.

### In production: a BTP destination

In the BTP cockpit, create an HTTP destination with `OAuth2ClientCredentials` authentication:

| Field | Value |
| --- | --- |
| Name | `ADOBE_FORMS_API` |
| Type | `HTTP` |
| Proxy Type | `Internet` |
| Authentication | `OAuth2ClientCredentials` |
| URL | REST API base URL, from the service key |
| Client ID | `uaa.clientid` from the service key |
| Client Secret | `uaa.clientsecret` from the service key |
| Token Service URL | `uaa.url` + `/oauth/token` |

In the application you only need the name, which is already the default:

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

The plugin resolves the destination with `getDestination` and calls it with `executeHttpRequest` from the [SAP Cloud SDK](https://sap.github.io/cloud-sdk/docs/js/features/connectivity/destinations), which also takes care of the OAuth2 flow. No secret in the code, and none in `package.json` either. If the destination can't be found, the error has a specific code: `ADOBE_FORMS_DESTINATION_NOT_FOUND`.

### Locally: direct credentials

Locally, a destination is often a hassle. Here the plugin requests the token itself, with `grant_type=client_credentials`, and caches it until 30 seconds before it expires.

Capire is explicit: [never put secrets in `package.json` or `.cdsrc.json`](https://cap.cloud.sap/docs/node.js/cds-connect). The right place is `.cdsrc-private.json`, which is personal by definition and [must not be committed](https://cap.cloud.sap/docs/node.js/cds-env):

```json title=".cdsrc-private.json"
{
  "requires": {
    "adobeForms": {
      "credentials": {
        "baseUrl": "https://<rest-api-host>",
        "tokenUrl": "https://<xsuaa-host>/oauth/token",
        "clientId": "<uaa.clientid>",
        "clientSecret": "<uaa.clientsecret>"
      }
    }
  }
}
```

> **Note.** The mode is chosen implicitly, and that has a downside. Forget one of the four fields and you won't get a credentials error: the plugin falls back to the destination, and the error you see is about that. When something is off locally, check `credentials` first.

## From CDS data to XML

Adobe's service wants XML. CAP thinks in objects. The plugin sits in between: it takes a JavaScript object and serializes it with a few rules. The root is always `FormData`, nested objects become nested elements, arrays become sibling elements with the same name. Pass a string instead and it's treated as ready-made XML and sent as is.

The mapping is still on you. Element names are dictated by the template's XSD schema, not by the CDS model. That's what `getFormSchema(formId)` is for: it reads the form details, decodes the schema from base64 and returns the XSD as plain text.

> **Try it.** Before writing the mapping, call `getFormSchema` on your template and read the XSD. Element names and table cardinality are all in there. Then call `remoteHealth()`: it makes a real call to the service (`GET /v1/forms` by default) and tells you whether destination and authentication work.

The plugin also handles language. `renderPDF` reads the templates available for the form and picks the one whose `language` matches the requested locale, falling back to the first. The locale is normalized to the format the API expects: `it` becomes `it_IT`, `it-IT` becomes `it_IT`, and no locale at all becomes `en_US`.

Finally, what it doesn't do. Serialization is minimal: no escaping of `&`, `<` and `>` in values, no validation against the XSD. If the data comes from free-text fields, like a company name with an "&" in it, escape it first or pass an XML string directly. Those are the two things I miss most today.

## The PDF: Buffer or base64

The API returns the PDF as base64 inside a JSON payload. `renderPDF` can hand it back as is with `options: { base64: true }`, handy when it ends up in another JSON or in an email. With `options: { base64: false }` you get a `Buffer`.

The `options.base64` default has changed between plugin versions. I always pass it explicitly: it costs one line and removes a doubt.

What it isn't: a stream. The whole PDF lands in memory, decoded. To serve it as a download from a CAP service, wrap the `Buffer` in a `Readable` and return it from a function annotated with `@Core.MediaType`. That's [custom streaming in CAP Node.js](https://cap.cloud.sap/docs/node.js/best-practices), still marked as beta in Capire.

With `Invoices` and `InvoiceItems` linked by an `invoice` association, the service exposes a function bound to the invoice:

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

And the handler wires the pieces together:

```js title="srv/invoice-service.js"
const cds = require('@sap/cds')
const { Readable } = require('node:stream')

module.exports = class InvoiceService extends cds.ApplicationService {
  async init() {
    const adobeForms = await cds.connect.to('adobeForms')
    const { Invoices, InvoiceItems } = this.entities

    this.on('print', Invoices, async (req) => {
      const invoice = await SELECT.one.from(req.subject)
      if (!invoice) return req.reject(404, 'Invoice not found')
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
        filename: `invoice-${invoice.number}.pdf`
      })
    })

    return super.init()
  }
}
```

`Header`, `Items` and `Row` are the names from my sample template. Yours are in the XSD. The `Row` array becomes a sequence of sibling `<Row>` elements, one per line item.

## Tests

The unit tests use `node:test` and `node:assert`, with a mocked `global.fetch`. No credentials, no connection to BTP. They cover the spots where an integration like this breaks quietly: the paths being called, the headers, locale normalization, the expected elements in the generated XML, the error codes.

Then there's `test/integration.js`, which uses a real service key read from `.env` via `node --env-file=.env`. It calls `remoteHealth`, `listForms`, `getFormDetails`, `getFormSchema` and `renderPDF` in sequence and saves the PDF to disk. Not elegant, but it answers the only question that matters: does the document come out?

Honestly: the tests check the shape of the XML, they don't validate it against the template's schema. Tests and scripts live in the [repository](https://github.com/salvatorelaspata/cap-plugin-adobe-forms), not in the npm package.

## What I learned

**A CAP plugin is mostly configuration.** There's little code. The value is in the default declared under `cds.requires`, which every project inherits without copying it. And in the `impl` path, which the plugin has to resolve, not the application.

**Secrets have a specific home.** A destination in production, `.cdsrc-private.json` locally, nothing in the repository. Obvious, yet it's the first thing to check when an integration travels between projects.

**Explicit beats implicit.** Automatic selection between credentials and destination is convenient while it works. The `base64` default is convenient until someone changes it. When a parameter decides the return type, pass it.

**A plugin shouldn't decide what's public.** The first versions in the repository also exposed an OData service at `/adobe/forms`, with the rendering and health-check actions. I removed it: today the plugin is a client and nothing more. Which endpoints to expose, and with which authorizations, is the application's call.

If your team comes from REST and wonders why a PDF comes out of an OData function, see [OData is not REST (and that's fine)](/en/blog/odata-is-not-rest).
