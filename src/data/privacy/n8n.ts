// Dati condivisi fra la versione italiana e inglese della privacy policy di n8n.
// Gli scope sono quelli predefiniti dei nodi Google Drive e Google Sheets di n8n
// (n8n-io/n8n -> packages/nodes-base/credentials/Google{Drive,Sheets}OAuth2Api.credentials.ts)
// e devono restare allineati a quelli dichiarati nella schermata di consenso OAuth
// del progetto Google Cloud: se la lista qui e quella su Google divergono, la
// verifica viene rifiutata.

export const N8N_APP_NAME = 'n8n'
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
