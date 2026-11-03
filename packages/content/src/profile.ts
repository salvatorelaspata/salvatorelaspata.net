// Fonte unica dei dati personali: Header, Footer, Hero, JSON-LD e vCard leggono da qui.
export const profile = {
  firstName: 'Salvatore',
  lastName: 'La Spata',
  fullName: 'Salvatore La Spata',
  initials: 'sl',
  role: {
    it: 'Practice Leader SAP BTP',
    en: 'SAP BTP Practice Leader',
  },
  company: 'GOTONEXT S.r.l.',
  companyUrl: 'https://gotonext.it',
  email: 'salvatore.la.spata@gmail.com',
  site: 'https://salvatorelaspata.net',
  github: 'https://github.com/salvatorelaspata',
  linkedin: 'https://www.linkedin.com/in/salvatore-la-spata/',
  sourceRepo: 'https://github.com/salvatorelaspata/salvatorelaspata.net',
  city: { it: 'Roma', en: 'Rome' },
  country: { it: 'Italia', en: 'Italy' },
  countryCode: 'IT',
  // numeri mostrati nell'hero
  experienceYears: '12+',
  teamSize: 16,
  inRomeSince: 2016,
  cal: {
    base: 'https://cal.com/salvatore-la-spata',
    coffee: '30min',
    roundtable: '60min',
  },
  vcardPath: '/salvatore-la-spata.vcf',
} as const

export const mailto = (subject = 'Hello Salvatore!') =>
  `mailto:${profile.email}?subject=${encodeURIComponent(subject)}`

export const calUrl = (kind: 'coffee' | 'roundtable', lang: 'it' | 'en') =>
  `${profile.cal.base}/${profile.cal[kind]}-${lang}`
