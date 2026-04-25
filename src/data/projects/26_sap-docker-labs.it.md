# SAP Docker Labs 🐳

**Categoria:** Progetti loschi
**Tecnologie:** Docker, SAP NetWeaver ABAP, SAP WebIDE, SAP Cloud Connector, Linux

## Di cosa si tratta

Collezione di esperimenti per containerizzare ambienti SAP che normalmente richiedono giornate intere di setup, licenze enterprise e una discreta quantità di pazienza.

L'obiettivo è semplice: `docker run` e hai un ambiente SAP funzionante in locale. Senza installer wizard da 47 step, senza dipendenze oscure da Windows Server 2008, senza sacrifici rituali.

## Cosa è stato containerizzato

- **SAP NetWeaver AS ABAP Developer Edition 7.52** — il classico ambiente ABAP locale, dockerizzato per girare su Linux senza toccare nulla del sistema host
- **SAP WebIDE** — l'IDE browser-based per sviluppo SAPUI5/Fiori, isolato in container per non inquinare il sistema
- **SAP Cloud Connector** — il bridge tra SAP BTP e sistemi on-premise, in Docker per ambienti di test e CI/CD

## Perché "loschi"

SAP non ufficialmente incoraggia questi setup. La documentazione ufficiale suggerisce VM dedicate, sistemi operativi certificati e configurazioni manuali elaborate. Noi preferiamo un `docker-compose up`.

> ⚠️ Solo per ambienti di sviluppo e test. Non per produzione. Ovviamente.
