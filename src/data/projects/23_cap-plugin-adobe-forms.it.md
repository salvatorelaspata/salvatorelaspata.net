# CAP Plugin Adobe Forms

**Categoria:** npm Package
**Tecnologie:** SAP CAP, Node.js, Adobe Forms, OAuth2, XML

## Descrizione

Plugin Node.js riutilizzabile per SAP CAP che integra il servizio **SAP Forms by Adobe** su SAP BTP. Permette di generare PDF da template Adobe Forms direttamente nelle applicazioni CAP, con supporto completo per autenticazione, localizzazione e accesso REST.

## Funzionalità principali

- **Due modalità di autenticazione:** BTP Destination Service (consigliata) e credenziali dirette
- **Generazione PDF** da template con selezione locale/lingua
- **Serializzazione XML automatica** da oggetti JavaScript
- **Encoding Base64** opzionale per risposte JSON
- **Endpoint OData REST** a `/adobe/forms`
- **Listing form e schema retrieval** dai template Adobe
- **Health check** per verifica connettività
- **Gestione errori** con codici specifici

## Installazione

```bash
npm install @salvatorela/cap-plugin-adobe-forms
```

## Link

- **npm:** [@salvatorela/cap-plugin-adobe-forms](https://www.npmjs.com/package/@salvatorela/cap-plugin-adobe-forms)
- **GitHub:** [Repository](https://github.com/salvatorelaspata/cap-plugin-adobe-forms)
