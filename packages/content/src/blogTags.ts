// Argomenti ammessi per gli articoli (chiavi in italiano, etichette tradotte in src/i18n)
export const BLOG_TAGS = ['SAP BTP', 'CAP', 'Accessibilità', 'Frontend', 'Strumenti', 'Carriera'] as const
export type BlogTag = (typeof BLOG_TAGS)[number]
