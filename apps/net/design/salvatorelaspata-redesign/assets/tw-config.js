/* Configurazione Tailwind condivisa dal prototipo (Play CDN).
   Per Astro copia l'oggetto `theme` in tailwind.config.mjs (vedi file omonimo). */
tailwind.config = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        'surface-2': 'var(--surface-2)',
        ink: 'var(--text)',
        muted: 'var(--text-muted)',
        line: 'var(--border)',
        'line-subtle': 'var(--border-subtle)',
        link: 'var(--link)',
        accent: {
          DEFAULT: 'var(--accent)',
          hover: 'var(--accent-hover)',
          fg: 'var(--accent-fg)',
          soft: 'var(--accent-soft)',
          ink: 'var(--accent-ink)',
        },
        focus: 'var(--focus)',
        palette: {
          1: 'var(--palette1)', 2: 'var(--palette2)', 3: 'var(--palette3)',
          4: 'var(--palette4)', 5: 'var(--palette5)',
        },
      },
      fontFamily: {
        sans: ['"Schibsted Grotesk"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      fontSize: {
        'step--1': ['var(--step--1)', { lineHeight: '1.5' }],
        'step-0': ['var(--step-0)', { lineHeight: '1.65' }],
        'step-1': ['var(--step-1)', { lineHeight: '1.5' }],
        'step-2': ['var(--step-2)', { lineHeight: '1.25' }],
        'step-3': ['var(--step-3)', { lineHeight: '1.15' }],
        'step-4': ['var(--step-4)', { lineHeight: '1.08' }],
        'step-5': ['var(--step-5)', { lineHeight: '1.04' }],
      },
      maxWidth: { site: '76rem', prose: '68ch' },
      borderRadius: { sm: 'var(--radius-sm)', DEFAULT: 'var(--radius)', lg: 'var(--radius-lg)' },
      boxShadow: { 'brut-sm': 'var(--shadow-sm)', brut: 'var(--shadow-md)', 'brut-lg': 'var(--shadow-lg)' },
      spacing: { section: 'var(--space-section)', header: 'var(--header-h)' },
      transitionTimingFunction: { out: 'var(--ease-out)' },
    },
  },
};
