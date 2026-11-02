---
title: "OData is not REST (and that's fine)"
description: "$metadata, query options, $batch, ETags and deep insert: what changes for a REST team meeting OData in SAP, and when a plain endpoint is the better choice."
pubDate: 2026-09-02
tags: ["SAP BTP"]
lang: en
translationKey: odata-non-e-rest
urlSlug: odata-is-not-rest
cover:
  icon: code
relatedProject: http-like-restfull-vs-odata
draft: false
---

A team that has always written REST APIs joins an SAP project. They open the Network tab of a Fiori app and find requests to `$batch`, URLs full of dollar signs, responses starting with `@odata.context` or, worse, wrapped in a mysterious `d` object. The first reaction is to look for the Swagger page. The second is to propose a "cleaner" REST wrapper on top of the service.

Understandable reactions, but both start from a misunderstanding: treating OData as a REST API with a few odd conventions. I covered this in my slides too, [HTTP like RESTful vs OData](/en/projects/http-like-restfull-vs-odata).

OData uses HTTP, URLs and verbs just like a REST API. But it is a standard protocol, currently at version 4.01 at OASIS, with a data model, a query language and precise rules for batching and concurrency. What REST leaves up to you, project by project, OData has already decided. That's a constraint. It's also the reason it pays off.

## The contract comes first: `$metadata`

Every OData service exposes a document at its root URL followed by `$metadata`. The [specification](https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html) defines it as the description of the types, entity sets, functions and actions the service understands. The language is CSDL, which describes an EDM (Entity Data Model):

- **entity types**, with a key and typed properties (`Edm.String`, `Edm.Int32`, `Edm.DateTimeOffset`…);
- **navigation properties**, i.e. the relationships between entities;
- **entity sets**, the collections you can query;
- **actions** and **functions**, the operations that aren't CRUD.

The default format is XML. Since 4.01 there is also a JSON representation of CSDL.

The difference from REST isn't that OData has a contract and REST doesn't: OpenAPI exists. The difference is that `$metadata` isn't documentation written on the side. It's the service describing itself. In CAP it's generated from the same CDS model that answers requests, so it can't fall behind.

In SAP this matters even more. Fiori elements apps are generic front ends: they [build pages and controls](https://cap.cloud.sap/docs/guides/uis/fiori) by reading `$metadata` and its annotations. No `$metadata`, no UI.

## Queries are part of the protocol

In a classic REST API every team invents its own parameters: `?status=open`, `?page=2&size=20`, `?include=items`. In OData the query options are defined by the specification and work the same on every service:

| Option | What it does | Example |
| --- | --- | --- |
| `$filter` | filters with a boolean expression | `$filter=status eq 'open' and total gt 100` |
| `$select` | picks the properties to return | `$select=ID,customer,total` |
| `$expand` | includes related entities | `$expand=items` |
| `$orderby` | sorts | `$orderby=createdAt desc` |
| `$top` / `$skip` | paging | `$top=20&$skip=40` |
| `$count` | total count | `$count=true` |

Combined, they make a request that in REST would need a dedicated endpoint:

```http title="HTTP request"
GET /odata/v4/order/Orders?$filter=status eq 'open' and total gt 100
    &$select=ID,customer,total
    &$expand=items($select=product,quantity;$orderby=quantity desc)
    &$orderby=createdAt desc
    &$top=20
    &$count=true
```

Line breaks and spaces are only for readability: a real request removes or encodes them. In v4, `$expand` accepts nested options in parentheses, separated by semicolons. Here each order's items come back with just two fields, already sorted. One request, one round trip, no `/orders/{id}/items` to design.

The grammar is regular enough for a machine to translate. [odata-to-sql](/en/projects/odata-to-sql) is a small parser that turns an OData v2 URL into SQL clauses. [sql-odata](/en/projects/sql-odata) is a prototype going the other way: exposing the entities of a relational database over OData v2.

## `$batch` and changesets

A Fiori app sends a lot of requests. OData can bundle them: a single `POST` to the `$batch` endpoint, carrying several requests in `multipart/mixed` format. Changes are grouped into **changesets**, atomic units: either they all go through or none does. In v2 a changeset cannot contain reads.

Version 4.01 adds an [alternative JSON format](https://docs.oasis-open.org/odata/new-in-odata/v4.01/new-in-odata-v4.01.html) for batches, with atomicity groups and dependencies between requests. If a request fails, its dependents answer `424 Failed Dependency`.

Not an academic detail. The UI5 OData V4 model uses the `$auto` group by default, which collects requests into a batch, and the UI5 documentation advises against going to production without batching: not every model feature works without it. That's why the Network tab of a Fiori app shows little besides `$batch`.

> **Try it.** To debug a UI5 app on the V4 model, temporarily set the group ID to `$direct`. Requests go out one by one and become readable in the Network tab again. Then switch back to `$auto`, before anyone notices.

## ETags and optimistic concurrency

Two users open the same order. The first one saves. The second saves a minute later and silently overwrites the first. In REST you handle that by hand, if you remember to. In OData it's part of the protocol: the entity has an ETag, the client sends it back in the `If-Match` header when updating or deleting, and if the record has changed in the meantime the response is `412 Precondition Failed`.

In CAP you annotate an element with `@odata.etag`. [Capire](https://cap.cloud.sap/docs/guides/services/served-ootb) recommends `modifiedAt` from the `managed` aspect, which updates itself. The same logic applies to reads with `If-None-Match`: if the record hasn't changed, `304 Not Modified`.

> **Note.** v2 and v4 disagree on a missing `If-Match` header. The v2 specification says the server should reject the request with `412`. Version 4.01 calls for `428 Precondition Required`. If your client talks to services of both versions, handle both codes.

## Deep insert

In REST, an order with its line items often means several calls and consistency you guarantee yourself. In OData it's a deep insert: a `POST` of the entity with the related entities inline. The v4 specification is clear: either all of them get created, or none.

```http title="HTTP request"
POST /odata/v4/order/Orders
Content-Type: application/json

{
  "customer": "ACME",
  "status": "open",
  "items": [
    { "product": "M8 bolts", "quantity": 100 },
    { "product": "M8 nuts", "quantity": 100 }
  ]
}
```

v2 already supports deep insert: a tree of entries in a single `POST`. Version 4.01 adds deep update. In CAP it works for compositions: the runtime deeply creates or updates the child entities. For associations, it only fills in the foreign keys to existing records.

## v2 and v4: the differences that matter

In SAP you still run into both versions. CAP serves v4 by default; v2 goes through the `@cap-js-community/odata-v2-adapter` package, and [Capire](https://cap.cloud.sap/docs/guides/protocols/odata) declares OData V2 deprecated, for existing UIs or controls that don't work with v4 yet. The differences people trip over:

| Topic | OData v2 | OData v4 |
| --- | --- | --- |
| Inline count | `$inlinecount=allpages` | `$count=true` |
| JSON response | `{"d": {"results": [...]}}` with `__metadata` and `__count` (a string) | `value`, `@odata.context`, `@odata.count`; from 4.01 without the `odata.` prefix |
| Dates | `/Date(<milliseconds>)/` | ISO 8601 |
| String search | `substringof('x', Field) eq true` | `contains(Field, 'x')` |
| Filters on collections | not defined | `any` / `all` |
| `$expand` | navigation paths only | nested options in parentheses |
| Partial update | `MERGE` | `PATCH` |
| Missing `If-Match` | `412` | `428` |
| `$batch` | `multipart/mixed` | `multipart/mixed`, plus JSON from 4.01 |
| `$metadata` | CSDL XML | CSDL XML, plus JSON from 4.01 |

The second row wastes the most time. A client written for v2 that reads `d.results` from a v4 service stops on a `TypeError`: `d` doesn't exist, and the error doesn't tell you why.

## Classic REST vs OData

| | Classic REST | OData |
| --- | --- | --- |
| Contract | OpenAPI, if someone writes it and keeps it current | `$metadata`, exposed by the service itself |
| Filters and paging | different parameters for every API | `$filter`, `$orderby`, `$top`, `$skip`, `$count`, the same everywhere |
| Relationships | dedicated endpoints or multiple calls | `$expand`, nestable in v4 |
| Batch | to be designed, if needed | `$batch` with atomic changesets |
| Concurrency | by hand, when it exists | ETags and `If-Match` in the protocol |
| Tooling | any HTTP client | generic clients, Fiori elements, UI5 OData models, CAP |

## The same service in CAP

Everything so far fits into two CDS files in CAP. The model:

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

And the service, with the ETag:

```cds title="srv/order-service.cds"
using { my.orders as db } from '../db/schema';

service OrderService {
  entity Orders     as projection on db.Orders;
  entity OrderItems as projection on db.OrderItems;
}

annotate OrderService.Orders with { modifiedAt @odata.etag }
```

With `cds watch`, the service answers at `/odata/v4/order`: CAP drops the `Service` suffix from the name. It handles the `GET` with `$filter` and `$expand`, the deep insert thanks to the composition, and updates with `If-Match`. Without a single line of JavaScript.

Two details. First: by default, generic READ handlers truncate results to 1,000 records, and `@cds.query.limit` adjusts that. Second: if you also need REST, you don't need another service. With `@protocol: ['odata', 'rest']` the same `OrderService` answers at both `/odata/v4/order` and `/rest/order`, as described in [Capire](https://cap.cloud.sap/docs/node.js/cds-serve).

## When OData pays off (and when it doesn't)

OData pays off when:

- the consumer is a Fiori elements or UI5 app on an OData model, which speaks that protocol and lives on `$metadata` and annotations;
- the service is data-centric CAP: the protocol comes free with the model;
- you need lists, filters, paging and relationships: exactly what query options were designed for.

A plain REST endpoint is better when:

- you're receiving webhooks or callbacks, and someone else decides the format;
- the operation isn't about entities, and an OData action would be pure ceremony;
- the client is external and shouldn't be able to compose arbitrary queries. Exposing `$filter` and `$expand` means accepting queries you never planned for.

A rule of thumb: if the consumer works on entities, OData; if it calls an operation, REST.

## What I learned

**The contract is the point.** OData is not REST: it's REST with a contract. Query options, batching, ETags and deep insert all follow from that. People coming from REST understand OData faster starting from `$metadata` than from Postman.

**Don't fight the protocol.** Custom parameters next to the query options, REST wrappers on top of OData services: every shortcut like that takes away from generic clients, Fiori elements first, exactly what makes them work.

**v2 is deprecated, not gone.** New services are born on v4. Existing ones will stay on v2 for a long time: learn the table of differences before it introduces itself.
