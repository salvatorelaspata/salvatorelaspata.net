// Testi su chi sono e cosa faccio, in italiano e inglese. Sono contenuto, non interfaccia:
// qualsiasi sito li mostri (anche con un design diverso) li legge da qui. Le etichette,
// i titoli di sezione e le call to action restano nei dizionari di src/i18n.
// Numeri e dati anagrafici sono in profile.ts.

const it = {
  /** Ruolo in breve, accanto al nome nell'header. */
  tagline: 'SAP BTP Architect',
  /** Dove, ruolo e azienda: la riga sopra il titolo dell'hero. */
  kicker: 'Roma · SAP BTP Practice Leader @ GOTONEXT',
  /** Titolo dell'hero; `code` è la parola resa in monospace. */
  headline: { before: 'Architetto SAP BTP che scrive ancora ', code: 'codice', after: '.' },
  /** Bio in una riga (footer). */
  short: "Architetture SAP cloud, codice moderno e un debole per l'accessibilità. Da Roma, con accento siciliano.",
  /** Bio di presentazione (hero). */
  intro:
    "Da oltre 12 anni progetto soluzioni enterprise su SAP, dall'ABAP on-premise a BTP, CAP e Integration Suite. Guido un team di 16 persone in GOTONEXT e nel tempo libero sperimento con React, Three.js e Rust.",
  motto: 'Enterprise di giorno, creative coding di sera.',
  /** Bio estesa (chi sono). */
  summary:
    'Full-stack developer con oltre 12 anni di esperienza, concentrato su architetture SAP enterprise e sviluppo web moderno. Mi piacciono i problemi con vincoli veri: performance, integrazioni, persone.',
  facts: [
    { icon: 'pin', title: 'Origini', text: "Siciliano di nascita, a Roma dal 2016. Il pragmatismo l'ho portato con me.", tags: [] as string[] },
    { icon: 'users', title: 'Ruolo attuale', text: 'Practice Leader SAP BTP in GOTONEXT: guido 16 persone su architetture cloud e on-premise.', tags: ['Leadership', 'Architettura'] },
    { icon: 'code', title: 'Background', text: 'Nato su Java, specializzato nell’ecosistema BTP. React, Node.js e TypeScript nei progetti personali.', tags: ['SAP', 'React', 'Node.js', 'TypeScript'] },
    { icon: 'access', title: 'Accessibilità', text: 'Ogni interfaccia che firmo funziona da tastiera e con screen reader. Anche questa.', tags: ['WCAG 2.2', 'ARIA'] },
  ],
  skills: [
    {
      title: 'Architettura',
      items: [
        { icon: 'blocks', name: 'Software Architect', text: 'Soluzioni SAP cloud e ibride su BTP, CAP, RAP e Integration Suite.' },
        { icon: 'refresh', name: 'DevOps', text: 'Pipeline CI/CD, Cloud Foundry, Docker e Kubernetes.' },
      ],
    },
    {
      title: 'Sviluppo',
      items: [
        { icon: 'browser', name: 'Web App', text: 'SAPUI5 e Fiori in azienda, React e Astro nei progetti personali.' },
        { icon: 'server', name: 'Back-end', text: 'Node.js, CAP, ABAP, Fastify e PostgreSQL.' },
        { icon: 'phone', name: 'Mobile', text: 'App con React Native, dalla prima schermata allo store.' },
      ],
    },
    {
      title: 'Esperienza utente',
      items: [
        { icon: 'pen', name: 'Webdesign', text: 'Interfacce chiare, design system e prototipi.' },
        { icon: 'access', name: 'Web Accessibility', text: 'WCAG 2.2, ARIA e test reali con screen reader.' },
      ],
    },
  ],
  /** Lo stack a strati, dall'alto (side project) al basso (on-premise). */
  stack: [
    { id: 'L3', name: 'Side projects', note: 'sere e weekend', items: 'React · TypeScript · Three.js · Rust' },
    { id: 'L2', name: 'SAP BTP', note: 'cloud', items: 'CAP · RAP · Integration Suite · Event Mesh' },
    { id: 'L1', name: 'SAP on-premise', note: 'le fondamenta', items: 'ABAP · NetWeaver · HANA · OData' },
  ],
  /** Formati di call prenotabili; `key` corrisponde a profile.cal. */
  bookings: [
    {
      key: 'coffee',
      audience: 'Per sviluppatori',
      duration: '30 min',
      title: 'SAP Dev Coffee Chat',
      text: "Domande su BTP, CAP o carriera, revisione di un'idea, due chiacchiere tra sviluppatori.",
    },
    {
      key: 'roundtable',
      audience: 'Per team e aziende',
      duration: '60 min',
      title: 'Modern SAP Dev Roundtable',
      text: 'Architettura, migrazione al cloud, scelta tra CAP e RAP, roadmap del team. Si parte dal vostro contesto.',
    },
  ],
}

export type Bio = typeof it

const en: Bio = {
  tagline: 'SAP BTP Architect',
  kicker: 'Rome · SAP BTP Practice Leader @ GOTONEXT',
  headline: { before: 'A SAP BTP architect who still writes ', code: 'code', after: '.' },
  short: 'SAP cloud architectures, modern code and a soft spot for accessibility. From Rome, with a Sicilian accent.',
  intro:
    'For more than 12 years I have been designing enterprise solutions on SAP, from on-premise ABAP to BTP, CAP and Integration Suite. I lead a 16-person team at GOTONEXT and, in my spare time, I experiment with React, Three.js and Rust.',
  motto: 'Enterprise by day, creative coding by night.',
  summary:
    'Full-stack developer with more than 12 years of experience, focused on SAP enterprise architectures and modern web development. I like problems with real constraints: performance, integrations, people.',
  facts: [
    { icon: 'pin', title: 'Origins', text: 'Born in Sicily, in Rome since 2016. I brought the pragmatism with me.', tags: [] },
    { icon: 'users', title: 'Current role', text: 'SAP BTP Practice Leader at GOTONEXT: I lead 16 people on cloud and on-premise architectures.', tags: ['Leadership', 'Architecture'] },
    { icon: 'code', title: 'Background', text: 'Started with Java, now specialised in the BTP ecosystem. React, Node.js and TypeScript in my side projects.', tags: ['SAP', 'React', 'Node.js', 'TypeScript'] },
    { icon: 'access', title: 'Accessibility', text: 'Every interface I sign works with a keyboard and a screen reader. This one included.', tags: ['WCAG 2.2', 'ARIA'] },
  ],
  skills: [
    {
      title: 'Architecture',
      items: [
        { icon: 'blocks', name: 'Software Architect', text: 'Cloud and hybrid SAP solutions on BTP, CAP, RAP and Integration Suite.' },
        { icon: 'refresh', name: 'DevOps', text: 'CI/CD pipelines, Cloud Foundry, Docker and Kubernetes.' },
      ],
    },
    {
      title: 'Development',
      items: [
        { icon: 'browser', name: 'Web App', text: 'SAPUI5 and Fiori at work, React and Astro in my side projects.' },
        { icon: 'server', name: 'Back-end', text: 'Node.js, CAP, ABAP, Fastify and PostgreSQL.' },
        { icon: 'phone', name: 'Mobile', text: 'React Native apps, from the first screen to the store.' },
      ],
    },
    {
      title: 'User experience',
      items: [
        { icon: 'pen', name: 'Webdesign', text: 'Clear interfaces, design systems and prototypes.' },
        { icon: 'access', name: 'Web Accessibility', text: 'WCAG 2.2, ARIA and real tests with screen readers.' },
      ],
    },
  ],
  stack: [
    { id: 'L3', name: 'Side projects', note: 'evenings and weekends', items: 'React · TypeScript · Three.js · Rust' },
    { id: 'L2', name: 'SAP BTP', note: 'cloud', items: 'CAP · RAP · Integration Suite · Event Mesh' },
    { id: 'L1', name: 'SAP on-premise', note: 'the foundations', items: 'ABAP · NetWeaver · HANA · OData' },
  ],
  bookings: [
    {
      key: 'coffee',
      audience: 'For developers',
      duration: '30 min',
      title: 'SAP Dev Coffee Chat',
      text: 'Questions about BTP, CAP or your career, a review of an idea, a chat between developers.',
    },
    {
      key: 'roundtable',
      audience: 'For teams and companies',
      duration: '60 min',
      title: 'Modern SAP Dev Roundtable',
      text: 'Architecture, cloud migration, choosing between CAP and RAP, team roadmap. We start from your context.',
    },
  ],
}

/** Bio nella lingua richiesta (italiano se la lingua non è inglese). */
export const getBio = (locale: string | undefined): Bio => (locale === 'en' ? en : it)
