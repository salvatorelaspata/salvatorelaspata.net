// Pipeline Markdown del sito (blog e progetti): tema Shiki e plugin rehype.
// File .mjs perché lo importa astro.config.mjs. Nessuna dipendenza esterna:
// i nodi hast vengono visitati a mano.

// ---------------------------------------------------------------------------
// Tema Shiki: stessi colori di .code-block in tokens.css (tok-k, tok-s, tok-c, tok-f)
// ---------------------------------------------------------------------------
export const petrolioTheme = {
  name: 'petrolio-tecnico',
  type: 'dark',
  fg: '#E6E9E7',
  bg: '#0E1416',
  colors: { 'editor.background': '#0E1416', 'editor.foreground': '#E6E9E7' },
  tokenColors: [
    { scope: ['comment', 'punctuation.definition.comment'], settings: { foreground: '#8A9A9D', fontStyle: 'italic' } },
    { scope: ['string', 'string.quoted', 'string.template', 'markup.inline.raw'], settings: { foreground: '#C9E3A6' } },
    {
      scope: [
        'keyword',
        'storage',
        'storage.type',
        'storage.modifier',
        'variable.language',
        'constant.language',
        'keyword.operator.new',
        'markup.heading',
      ],
      settings: { foreground: '#7CC6D3' },
    },
    {
      scope: [
        'entity.name.function',
        'support.function',
        'meta.function-call.generic',
        'entity.name.tag',
        'entity.other.attribute-name',
        'support.type.property-name',
        'constant.numeric',
      ],
      settings: { foreground: '#F2C98A' },
    },
  ],
}

/** Copia `title="…"` dal meta del blocco di codice in data-title sul <pre>. */
export const titleTransformer = {
  name: 'code-title',
  pre(node) {
    const raw = this.options.meta?.__raw ?? ''
    const match = raw.match(/title=(?:"([^"]+)"|'([^']+)')/)
    if (match) node.properties['data-title'] = match[1] ?? match[2]
  },
}

// ---------------------------------------------------------------------------
// Utilità hast
// ---------------------------------------------------------------------------
const h = (tagName, properties = {}, children = []) => ({ type: 'element', tagName, properties, children })
const text = value => ({ type: 'text', value })

const visit = (node, fn, parent = null, index = 0) => {
  fn(node, parent, index)
  if (node.children) {
    // copia: fn può sostituire il nodo corrente nel genitore
    ;[...node.children].forEach((child, i) => visit(child, fn, node, i))
  }
}

const textOf = node => (node.type === 'text' ? node.value : (node.children ?? []).map(textOf).join(''))

const langOf = file => (/\.en\.mdx?$/.test(file?.path ?? '') ? 'en' : 'it')

const L = {
  it: { copy: 'Copia', copied: 'Copiato', code: 'Codice', table: 'Tabella', note: 'Nota' },
  en: { copy: 'Copy', copied: 'Copied', code: 'Code', table: 'Table', note: 'Note' },
}

const iconSvg = paths =>
  h(
    'svg',
    {
      width: 18,
      height: 18,
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      strokeWidth: 1.75,
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
      ariaHidden: 'true',
      focusable: 'false',
    },
    paths.map(([tag, props]) => h(tag, props)),
  )

const COPY_ICON = [
  ['rect', { x: 9, y: 9, width: 12, height: 12, rx: 2 }],
  ['path', { d: 'M5 15V5a2 2 0 0 1 2-2h10' }],
]
const INFO_ICON = [
  ['circle', { cx: 12, cy: 12, r: 9 }],
  ['path', { d: 'M12 11v5M12 8h.01' }],
]

// ---------------------------------------------------------------------------
// rehype: blocchi di codice → .code-block con barra (nome file) e pulsante Copia.
// Shiki gira prima dei plugin rehype dell'utente: qui il <pre> è già evidenziato
// (class="astro-code …", data-language) e il titolo arriva da titleTransformer.
// ---------------------------------------------------------------------------
export const rehypeCodeBlocks = () => (tree, file) => {
  const l = L[langOf(file)]
  visit(tree, (node, parent, index) => {
    if (!parent || node.tagName !== 'pre') return
    const cls = [].concat(node.properties?.class ?? node.properties?.className ?? []).join(' ')
    if (!cls.includes('astro-code')) return
    const title = node.properties['data-title'] || node.properties.dataLanguage || 'code'
    delete node.properties['data-title']
    const bar = h('div', { className: ['code-block-bar'] }, [
      h('span', {}, [text(title)]),
      h('button', { type: 'button', className: ['btn'], dataCopy: '', dataCopied: l.copied }, [
        iconSvg(COPY_ICON),
        h('span', { dataCopyLabel: '' }, [text(l.copy)]),
      ]),
    ])
    parent.children[index] = h(
      'div',
      { className: ['code-block', 'not-prose'], role: 'group', ariaLabel: `${l.code}: ${title}` },
      [bar, node],
    )
  })
}

// ---------------------------------------------------------------------------
// rehype: blockquote che inizia con **Nota.** / **Da provare.** (o Note./Try it.) → callout
// ---------------------------------------------------------------------------
const CALLOUT_LABELS = /^(Nota|Da provare|Note|Try it|Attenzione|Warning)\.?$/i

export const rehypeCallouts = () => tree => {
  visit(tree, (node, parent, index) => {
    if (!parent || node.tagName !== 'blockquote') return
    const first = node.children.find(c => c.type === 'element')
    const strong = first?.tagName === 'p' && first.children.find(c => c.type === 'element' || c.value?.trim())
    if (!strong || strong.tagName !== 'strong' || !CALLOUT_LABELS.test(textOf(strong).trim())) return
    const content = node.children.filter(c => c.type === 'element')
    parent.children[index] = h('div', { className: ['callout', 'not-prose'], role: 'note' }, [
      iconSvg(INFO_ICON),
      h('div', { className: ['callout-body'] }, content),
    ])
  })
}

// ---------------------------------------------------------------------------
// rehype: tabelle in un contenitore scrollabile e focalizzabile
// ---------------------------------------------------------------------------
export const rehypeTables = () => (tree, file) => {
  const l = L[langOf(file)]
  let n = 0
  visit(tree, (node, parent, index) => {
    if (!parent || node.tagName !== 'table' || parent.properties?.role === 'region') return
    n++
    const head = node.children.find(c => c.tagName === 'thead')
    const firstRow = head && textOf(head).replace(/\s+/g, ' ').trim()
    parent.children[index] = h(
      'div',
      { className: ['table-scroll'], role: 'region', tabIndex: 0, ariaLabel: `${l.table} ${n}${firstRow ? `: ${firstRow}` : ''}` },
      [node],
    )
  })
}

// ---------------------------------------------------------------------------
// rehype: link interni assoluti con il base path (GitHub Pages)
// ---------------------------------------------------------------------------
export const rehypeBaseLinks = base => () => tree => {
  const prefix = (base || '/').replace(/\/$/, '')
  if (!prefix) return
  visit(tree, node => {
    const href = node.tagName === 'a' && node.properties?.href
    if (typeof href === 'string' && href.startsWith('/') && !href.startsWith('//') && !href.startsWith(`${prefix}/`)) {
      node.properties.href = prefix + href
    }
  })
}
