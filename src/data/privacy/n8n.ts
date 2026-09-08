// Dati condivisi fra la versione italiana e inglese della privacy policy di n8n.
// Gli scope sono quelli predefiniti dei nodi Google Drive e Google Sheets di n8n
// (n8n-io/n8n -> packages/nodes-base/credentials/Google{Drive,Sheets}OAuth2Api.credentials.ts)
// e devono restare allineati a quelli dichiarati nella schermata di consenso OAuth
// del progetto Google Cloud: se la lista qui e quella su Google divergono, la
// verifica viene rifiutata.

export const N8N_APP_NAME = 'salvatorelaspata.dev'
export const N8N_OWNER = 'Salvatore La Spata'
export const N8N_CONTACT_EMAIL = 'salvatore.la.spata@gmail.com'
export const N8N_SITE_URL = 'https://salvatorelaspata.net'
export const N8N_LAST_UPDATED = '2026-09-08'

export interface GoogleScope {
  scope: string
  api: 'Google Drive' | 'Google Sheets'
  it: string
  en: string
}

export const n8nGoogleScopes: GoogleScope[] = [
  {
    scope: 'https://www.googleapis.com/auth/drive',
    api: 'Google Drive',
    it: 'Consente di elencare, leggere, creare, rinominare, spostare ed eliminare file su Google Drive. n8n lo usa solo sui file esplicitamente indicati in un workflow.',
    en: 'Allows listing, reading, creating, renaming, moving and deleting files on Google Drive. n8n only acts on the files explicitly referenced by a workflow.',
  },
  {
    scope: 'https://www.googleapis.com/auth/drive.appdata',
    api: 'Google Drive',
    it: "Accesso all'area dati riservata all'applicazione su Drive, invisibile all'utente. Fa parte del set di scope predefinito del nodo Google Drive di n8n.",
    en: "Access to the application data folder on Drive, hidden from the user. It is part of the default scope set of n8n's Google Drive node.",
  },
  {
    scope: 'https://www.googleapis.com/auth/drive.photos.readonly',
    api: 'Google Drive',
    it: 'Lettura delle foto archiviate su Google Drive. Fa parte del set di scope predefinito del nodo Google Drive di n8n.',
    en: "Read-only access to photos stored on Google Drive. It is part of the default scope set of n8n's Google Drive node.",
  },
  {
    scope: 'https://www.googleapis.com/auth/drive.file',
    api: 'Google Sheets',
    it: "Accesso ai soli file Google creati o aperti esplicitamente tramite l'applicazione, non all'intero contenuto di Drive.",
    en: 'Access limited to the Google files created or explicitly opened through the application, not to the whole Drive content.',
  },
  {
    scope: 'https://www.googleapis.com/auth/spreadsheets',
    api: 'Google Sheets',
    it: 'Lettura e scrittura del contenuto (celle, righe, fogli) dei fogli di calcolo Google indicati nei workflow.',
    en: 'Reading and writing the content (cells, rows, sheets) of the Google spreadsheets referenced by the workflows.',
  },
  {
    scope: 'https://www.googleapis.com/auth/drive.metadata',
    api: 'Google Sheets',
    it: 'Accesso ai metadati dei file di Drive (nome, ID, cartella) per individuare e selezionare il foglio di calcolo su cui operare.',
    en: 'Access to Drive file metadata (name, ID, folder) in order to locate and select the spreadsheet a workflow has to operate on.',
  },
]

// Le sei disclosure che la brand verification OAuth di Google richiede in modo
// esplicito nella privacy policy: come l'app accede, usa, conserva, condivide,
// protegge ed elimina i dati utente Google.
// Riferimento: https://support.google.com/cloud/answer/13806988
export interface Disclosure {
  it: { label: string; text: string }
  en: { label: string; text: string }
}

export const n8nDisclosures: Disclosure[] = [
  {
    it: {
      label: 'Come accediamo ai dati',
      text: "Tramite le API ufficiali di Google Drive e Google Sheets, usando un token OAuth 2.0 rilasciato dall'utente. L'accesso avviene solo quando un workflow avviato dal titolare lo richiede, e solo sui file espressamente indicati in quel workflow.",
    },
    en: {
      label: 'How we access the data',
      text: 'Through the official Google Drive and Google Sheets APIs, using an OAuth 2.0 token granted by the user. Access happens only when a workflow started by the controller requires it, and only on the files that workflow explicitly references.',
    },
  },
  {
    it: {
      label: 'Come usiamo i dati',
      text: "Esclusivamente per eseguire l'automazione richiesta: leggere righe di un foglio di calcolo, scriverle o aggiornarle, e leggere, caricare, rinominare, spostare o eliminare file di Drive indicati nel workflow. Nessun altro uso.",
    },
    en: {
      label: 'How we use the data',
      text: 'Solely to run the requested automation: reading rows from a spreadsheet, writing or updating them, and reading, uploading, renaming, moving or deleting the Drive files referenced by the workflow. No other use.',
    },
  },
  {
    it: {
      label: 'Come conserviamo i dati',
      text: "I contenuti di Drive e Sheets sono elaborati in transito e non vengono archiviati in modo permanente. L'unico dato conservato in modo persistente è il token OAuth, cifrato a riposo nel database dell'istanza n8n, ospitata su infrastruttura privata del titolare nell'Unione Europea.",
    },
    en: {
      label: 'How we store the data',
      text: "Drive and Sheets content is processed in transit and is not stored permanently. The only persistently stored item is the OAuth token, encrypted at rest in the database of the n8n instance, which runs on the controller's own private infrastructure in the European Union.",
    },
  },
  {
    it: {
      label: 'Come condividiamo i dati',
      text: "In nessun modo. I dati non vengono venduti, ceduti, trasferiti o comunicati a terzi, data broker, circuiti pubblicitari o modelli di intelligenza artificiale. L'unico scambio di rete è quello diretto fra l'istanza n8n e i server di Google.",
    },
    en: {
      label: 'How we share the data',
      text: 'We do not. The data is never sold, transferred, disclosed or handed to third parties, data brokers, advertising networks or artificial intelligence models. The only network exchange is the direct one between the n8n instance and Google servers.',
    },
  },
  {
    it: {
      label: 'Come proteggiamo i dati',
      text: "Trasporto cifrato HTTPS/TLS verso le API Google, credenziali OAuth cifrate a riposo (AES-256) con la chiave di cifratura dell'istanza, accesso all'interfaccia n8n protetto da autenticazione e riservato al solo titolare, istanza mantenuta aggiornata alle release supportate.",
    },
    en: {
      label: 'How we protect the data',
      text: 'Encrypted HTTPS/TLS transport to the Google APIs, OAuth credentials encrypted at rest (AES-256) with the instance encryption key, access to the n8n interface protected by authentication and restricted to the controller alone, and the instance kept up to date with supported releases.',
    },
  },
  {
    it: {
      label: 'Come eliminiamo i dati',
      text: "L'utente può revocare l'autorizzazione in qualsiasi momento da myaccount.google.com/permissions, interrompendo immediatamente ogni accesso. Su richiesta via email, token memorizzati e log di esecuzione associati vengono cancellati entro 30 giorni; i log sono comunque eliminati automaticamente dopo 30 giorni.",
    },
    en: {
      label: 'How we delete the data',
      text: 'Users can revoke the authorisation at any time at myaccount.google.com/permissions, which immediately stops all access. On request by email, the stored tokens and the associated execution logs are deleted within 30 days; logs are in any case removed automatically after 30 days.',
    },
  },
]

// Dicitura testuale richiesta da Google per la verifica OAuth: deve comparire
// nella privacy policy ESATTAMENTE in questa forma (in inglese), perché i
// controlli automatici la cercano come stringa. Non riformulare, non tradurre
// al posto dell'originale: la traduzione italiana e' solo di accompagnamento.
// Riferimento: https://developers.google.com/terms/api-services-user-data-policy
export const GOOGLE_LIMITED_USE_DISCLOSURE_EN =
  "The app's use and transfer of information received from Google APIs to any other app will adhere to Google API Services User Data Policy, including the Limited Use requirements."

export const GOOGLE_LIMITED_USE_DISCLOSURE_IT =
  "L'uso e il trasferimento da parte dell'app di informazioni ricevute dalle API di Google verso qualsiasi altra app rispetteranno le Norme sui dati utente dei servizi API di Google, inclusi i requisiti di Utilizzo limitato."

export const GOOGLE_USER_DATA_POLICY_URL =
  'https://developers.google.com/terms/api-services-user-data-policy'
