// Shell finta per salvatorelaspata.dev. I dati arrivano da /terminal.json (generato in build)
// e si scaricano solo al primo uso. L'output si costruisce con nodi DOM, mai con innerHTML.
import type { TerminalData } from '../lib/terminal-data'

type Out = (string | Node)[]
type Command = (args: string[], raw: string) => unknown

const THEMES = ['green', 'amber', 'mono'] as const
const HISTORY_KEY = 'term-history'
const THEME_KEY = 'term-theme'

// ---------- DOM ----------

const h = (tag: string, cls?: string, ...children: (string | Node)[]) => {
  const node = document.createElement(tag)
  if (cls) node.className = cls
  node.append(...children)
  return node
}
const span = (cls: string, text: string) => h('span', cls, text)
const link = (text: string, url: string, cls?: string) => {
  const a = h('a', cls, text) as HTMLAnchorElement
  a.href = url
  return a
}
const pad = (text: string, width: number) => text.padEnd(width, ' ')
const fill = (str: string, vars: Record<string, string | number>) =>
  str.replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? `{${k}}`))

// ---------- Utilità ----------

/** Distanza di Levenshtein, per il "forse intendevi". */
const distance = (a: string, b: string) => {
  const row = Array.from({ length: b.length + 1 }, (_, i) => i)
  for (let i = 1; i <= a.length; i++) {
    let prev = row[0]
    row[0] = i
    for (let j = 1; j <= b.length; j++) {
      const tmp = row[j]
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1))
      prev = tmp
    }
  }
  return row[b.length]
}

const commonPrefix = (words: string[]) =>
  words.reduce((prefix, w) => {
    let i = 0
    while (i < prefix.length && prefix[i] === w[i]) i++
    return prefix.slice(0, i)
  })

const storage = {
  get(key: string) {
    try {
      return sessionStorage.getItem(key)
    } catch {
      return null
    }
  },
  set(key: string, value: string) {
    try {
      sessionStorage.setItem(key, value)
    } catch {
      // storage non disponibile (navigazione privata, cookie bloccati): si va avanti senza
    }
  },
}

/** Percorso "da shell" della pagina corrente: `/en/blog/x/` → `~/blog/x`. */
const currentPath = () => {
  let p = location.pathname.replace(/\/$/, '')
  const base = import.meta.env.BASE_URL.replace(/\/$/, '')
  if (base && p.startsWith(base)) p = p.slice(base.length)
  if (p === '/en' || p.startsWith('/en/')) p = p.slice(3)
  return p ? `~${p}` : '~'
}

// ---------- Terminale ----------

export const initTerminal = () => {
  const root = document.getElementById('term')
  const log = document.getElementById('term-log')
  const form = document.getElementById('term-form') as HTMLFormElement | null
  const input = document.getElementById('term-input') as HTMLInputElement | null
  if (!root || !log || !form || !input) return

  root.hidden = false
  document.querySelectorAll<HTMLElement>('[data-term-link]').forEach((el) => (el.hidden = false))
  const pwd = currentPath()
  root.querySelectorAll('[data-term-pwd]').forEach((el) => (el.textContent = pwd))

  let data: TerminalData | null = null
  let loading: Promise<TerminalData | null> | null = null
  const load = () =>
    (loading ??= fetch(root.dataset.src ?? '/terminal.json')
      .then((r) => (r.ok ? (r.json() as Promise<TerminalData>) : null))
      .then((d) => (data = d))
      .catch(() => null))

  let history: string[] = []
  try {
    history = JSON.parse(storage.get(HISTORY_KEY) ?? '[]')
  } catch {
    history = []
  }
  let cursor = history.length

  // Ogni comando è un "entry": la riga digitata e il suo output
  let entry: HTMLElement = log
  const print = (...parts: Out) => entry.append(h('p', undefined, ...parts))
  const printDim = (text: string) => print(span('dim', text))
  const printErr = (text: string) => print(span('err', text))

  const go = (url: string, label: string) => {
    if (!data) return
    printDim(fill(data.strings.navigating, { path: label }))
    location.assign(url)
  }

  // --- risoluzione dei "file" ---
  const clean = (arg = '') => arg.replace(/^~\/?/, '').replace(/^\.\//, '').replace(/\/+$/, '')
  const findProject = (arg: string) => {
    const slug = clean(arg)
      .replace(/^projects\//, '')
      .replace(/\/README\.md$/i, '')
    return data?.projects.find((p) => p.slug === slug)
  }
  const findPost = (arg: string) => {
    const slug = clean(arg)
      .replace(/^blog\//, '')
      .replace(/\.md$/, '')
    return data?.posts.find((p) => p.slug === slug)
  }
  const paths = () =>
    data
      ? [
          'about.md',
          'contact.txt',
          'stack.txt',
          '.plan',
          'projects/',
          'blog/',
          ...data.projects.map((p) => `projects/${p.slug}/`),
          ...data.posts.map((p) => `blog/${p.slug}.md`),
        ]
      : []

  // --- output riutilizzati ---
  const about = (d: TerminalData) => {
    print(span('title-md', d.motto))
    print(d.summary)
    d.facts.forEach((f) => print(span('dim', '- '), span('accent', f.title), ` — ${f.text}`))
  }
  const plan = (d: TerminalData) => {
    print(span('title-md', d.headline))
    print(d.intro)
  }
  const stack = (d: TerminalData) =>
    d.stack.forEach((l) =>
      print(
        span('warn', `${l.id}  `),
        span('accent', pad(l.name, 16)),
        span('dim', pad(l.note, 18)),
        l.items
      )
    )
  const projectRow = (p: TerminalData['projects'][number]) =>
    print(
      span('dim', pad(p.kind, 12)),
      link(`${p.slug}/`, p.href, 'path'),
      span('dim', `  ${p.summary}`)
    )
  const postRow = (p: TerminalData['posts'][number]) =>
    print(
      span('dim', `${p.date}  `),
      link(p.title, p.href),
      span('dim', `  ${fill(data!.strings.minRead, { n: p.minutes })}`)
    )
  const contact = (d: TerminalData) => {
    print(span('title-md', d.strings.bookTitle))
    d.contact.bookings.forEach((b, i) =>
      print(
        span('warn', `[${i + 1}] `),
        link(b.title, b.url),
        span('dim', ` · ${b.duration} · ${b.audience}`)
      )
    )
    print(span('title-md', d.strings.channels))
    print(span('accent', pad('email', 10)), link(d.contact.email, d.contact.mailto))
    print(
      span('accent', pad('github', 10)),
      link(d.contact.github.replace('https://', ''), d.contact.github)
    )
    print(
      span('accent', pad('linkedin', 10)),
      link(d.contact.linkedin.replace('https://www.', ''), d.contact.linkedin)
    )
    print(span('accent', pad('vcard', 10)), link('salvatore-la-spata.vcf', d.contact.vcard))
  }

  // --- comandi ---
  const commands: Record<string, Command> = {
    help: () => {
      if (!data) return
      print(data.strings.helpIntro)
      Object.entries(data.strings.help).forEach(([name, desc]) =>
        print(span('accent', pad(name, 12)), span('dim', desc))
      )
      printDim(data.strings.helpFiles)
    },
    whoami: () => {
      if (!data) return
      print(span('accent', data.user), span('dim', ` — ${data.name}, ${data.tagline}`))
    },
    neofetch: () => {
      if (!data) return
      print(span('title-md', data.name))
      data.system.forEach(([k, v]) => print(span('accent', `${k}: `), v))
    },
    about: () => data && about(data),
    skills: () => {
      if (!data) return
      print(span('path', 'skills/'))
      data.skills.forEach((group, gi) => {
        const lastGroup = gi === data!.skills.length - 1
        print(span('dim', lastGroup ? '└── ' : '├── '), span('path', `${group.dir}/`))
        group.items.forEach((item, ii) => {
          const branch = `${lastGroup ? '    ' : '│   '}${ii === group.items.length - 1 ? '└── ' : '├── '}`
          print(span('dim', branch), span('accent', item.name), span('dim', `  ${item.text}`))
        })
      })
    },
    stack: () => data && stack(data),
    ls: (args) => {
      if (!data) return
      const long = args.some((a) => /^-\w*l/.test(a))
      const target = clean(args.find((a) => !a.startsWith('-')) ?? '')
      if (target === '' || target === '.') {
        print(
          span('path', 'blog/'),
          '  about.md  contact.txt  ',
          span('path', 'projects/'),
          '  stack.txt'
        )
      } else if (target === 'projects') {
        if (long) data.projects.forEach(projectRow)
        else print(...data.projects.flatMap((p) => [link(`${p.slug}/`, p.href, 'path'), '  ']))
      } else if (target === 'blog') {
        if (long) data.posts.forEach(postRow)
        else print(...data.posts.flatMap((p) => [link(`${p.slug}.md`, p.href), '  ']))
      } else if (findProject(target)) {
        print('README.md')
      } else {
        printErr(fill(data.strings.noSuchFile, { cmd: 'ls', path: target }))
      }
    },
    cd: (args) => {
      if (!data) return
      const target = clean(args[0] ?? '')
      if (target === '' || target === '/') return go(data.urls.home, '~')
      if (target === '..') {
        if (pwd.startsWith('~/blog/')) return go(data.urls.blog, '~/blog')
        if (pwd.startsWith('~/projects/')) return go(data.urls.projects, '~/projects')
        return go(data.urls.home, '~')
      }
      if (target === 'projects') return go(data.urls.projects, '~/projects')
      if (target === 'blog') return go(data.urls.blog, '~/blog')
      const project = findProject(target)
      if (project) return go(project.href, `~/projects/${project.slug}`)
      const post = findPost(target)
      if (post) return go(post.href, `~/blog/${post.slug}.md`)
      printErr(fill(data.strings.noSuchFile, { cmd: 'cd', path: target }))
    },
    cat: (args) => {
      if (!data) return
      const target = clean(args[0] ?? '')
      if (!target) return printDim(fill(data.strings.usage, { usage: 'cat <file>' }))
      if (target === 'about.md') return about(data)
      if (target === 'contact.txt') return contact(data)
      if (target === 'stack.txt') return stack(data)
      if (target === '.plan') return plan(data)
      if (
        target === 'projects' ||
        target === 'blog' ||
        (findProject(target) && !/readme\.md$/i.test(target))
      ) {
        return printErr(fill(data.strings.isDirectory, { path: target }))
      }
      const project = findProject(target)
      if (project) {
        print(span('title-md', project.title))
        print(project.summary)
        print(span('dim', project.technologies.join(' · ')))
        return print(link(`cd ~/projects/${project.slug}`, project.href))
      }
      const post = findPost(target)
      if (post) {
        print(span('title-md', post.title))
        print(
          span(
            'dim',
            `${post.date} · ${fill(data.strings.minRead, { n: post.minutes })} · ${post.tags.map((t) => `#${t}`).join(' ')}`
          )
        )
        print(post.description)
        return print(link(`less ~/blog/${post.slug}.md`, post.href))
      }
      printErr(fill(data.strings.noSuchFile, { cmd: 'cat', path: target }))
    },
    open: (args) => {
      if (!data) return
      const target = clean(args[0] ?? '')
      if (!target) return printDim(fill(data.strings.usage, { usage: 'open <project|post>' }))
      if (target === 'github') return go(data.contact.github, data.contact.github)
      if (target === 'linkedin') return go(data.contact.linkedin, data.contact.linkedin)
      return commands.cd([target], '')
    },
    projects: (args) => {
      if (!data) return
      const filter = args[0]?.toLowerCase()
      if (filter && !data.filters.includes(filter)) {
        return printDim(fill(data.strings.usage, { usage: `projects [${data.filters.join('|')}]` }))
      }
      const list = filter ? data.projects.filter((p) => p.filters.includes(filter)) : data.projects
      list.forEach(projectRow)
    },
    blog: () => data?.posts.forEach(postRow),
    grep: (args) => {
      if (!data) return
      const q = args
        .filter((a) => !a.startsWith('-'))
        .join(' ')
        .toLowerCase()
      if (!q) return printDim(fill(data.strings.usage, { usage: 'grep <text>' }))
      const projects = data.projects.filter((p) =>
        [p.title, p.summary, p.slug, ...p.technologies].some((s) => s.toLowerCase().includes(q))
      )
      const posts = data.posts.filter((p) =>
        [p.title, p.description, ...p.tags].some((s) => s.toLowerCase().includes(q))
      )
      if (!projects.length && !posts.length) return printDim(fill(data.strings.noMatches, { q }))
      projects.forEach((p) =>
        print(link(`projects/${p.slug}/`, p.href, 'path'), span('dim', `: ${p.summary}`))
      )
      posts.forEach((p) => print(link(`blog/${p.slug}.md`, p.href), span('dim', `: ${p.title}`)))
    },
    experience: () =>
      data?.experience.forEach((e, i) =>
        print(
          span('warn', '* '),
          span('warn', e.hash),
          i === 0 ? span('path', ' (HEAD -> main)') : '',
          ` ${e.title} @ ${e.company} `,
          span('dim', e.period)
        )
      ),
    git: (args, raw) => {
      if (args[0] === 'log') return commands.experience([], raw)
      if (args[0] === 'status')
        return print('On branch main', '\n', span('dim', 'nothing to commit, working tree clean'))
      printDim(fill(data?.strings.usage ?? '', { usage: 'git log | git status' }))
    },
    contact: () => data && contact(data),
    lang: (args) => {
      if (!data) return
      const target = args[0]
      if (target !== 'it' && target !== 'en')
        return printDim(fill(data.strings.usage, { usage: 'lang it|en' }))
      if (target === data.lang) return printDim(target)
      const alternate = document.querySelector<HTMLAnchorElement>(
        `.statusbar a[hreflang='${target}']`
      )
      go(alternate?.href ?? data.urls.otherHome, target)
    },
    theme: (args) => {
      if (!data) return
      const html = document.documentElement
      const current = html.dataset.theme ?? 'green'
      const name = args[0] as (typeof THEMES)[number] | undefined
      if (!name)
        return printDim(fill(data.strings.themeNow, { name: current, list: THEMES.join(', ') }))
      if (!THEMES.includes(name))
        return printDim(fill(data.strings.usage, { usage: `theme ${THEMES.join('|')}` }))
      if (name === 'green') delete html.dataset.theme
      else html.dataset.theme = name
      try {
        localStorage.setItem(THEME_KEY, name)
      } catch {
        // tema valido solo per questa pagina
      }
      printDim(fill(data.strings.themeSet, { name }))
    },
    clear: () => {
      log.replaceChildren()
    },
    history: () => {
      if (!data) return
      if (!history.length) return printDim(data.strings.historyEmpty)
      history.forEach((cmd, i) => print(span('dim', `${String(i + 1).padStart(4)}  `), cmd))
    },
    date: () =>
      print(
        new Date().toLocaleString(data?.lang === 'en' ? 'en-GB' : 'it-IT', {
          dateStyle: 'full',
          timeStyle: 'medium',
        })
      ),
    pwd: () => print(`/home/${data?.user ?? 'salvatore'}${pwd.slice(1)}`),
    echo: (args) => {
      const env: Record<string, string> = {
        $USER: data?.user ?? 'salvatore',
        $SHELL: '/bin/zsh',
        $HOME: `/home/${data?.user}`,
        $PWD: pwd,
      }
      print(args.map((a) => env[a] ?? a).join(' '))
    },
    uname: (args) =>
      print(
        args.includes('-a') ? 'SalvatoreOS 12.0.0 btp-cloud abap-onprem x86_64' : 'SalvatoreOS'
      ),
    sudo: () => data && printErr(fill(data.strings.sudo, { user: data.user })),
    rm: () => data && printErr(data.strings.rm),
    exit: () => data && printDim(data.strings.exit),
    vim: () => data && printDim(data.strings.vim),
    make: (args) => {
      if (!data) return
      if (args[0] !== 'coffee')
        return printErr(fill(data.strings.makeUsage, { target: args[0] ?? '' }))
      print(data.strings.coffee)
      const coffee = data.contact.bookings[0]
      if (coffee) print(link(coffee.title, coffee.url))
    },
    man: (args) => {
      if (!data) return
      const desc = (data.strings.help as Record<string, string>)[args[0] ?? '']
      if (args[0] === 'salvatore') return about(data)
      if (desc) return print(span('accent', `${args[0]} `), span('dim', `— ${desc}`))
      commands.help([], '')
    },
  }

  const aliases: Record<string, string> = {
    ll: 'ls -l',
    dir: 'ls',
    logout: 'exit',
    quit: 'exit',
    vi: 'vim',
    nano: 'vim',
    emacs: 'vim',
    cls: 'clear',
    '?': 'help',
  }

  const run = async (raw: string) => {
    const line = raw.trim()
    entry = h('div', 'entry')
    entry.append(
      h(
        'p',
        undefined,
        h('span', 'ps1', span('u', 'salvatore@dev'), ':', span('p', pwd), '$ '),
        span('cmd', line)
      )
    )
    log.append(entry)
    if (!line) return

    history = [...history.filter((c) => c !== line), line].slice(-50)
    storage.set(HISTORY_KEY, JSON.stringify(history))
    cursor = history.length

    const expanded = aliases[line.split(/\s+/)[0]]
      ? line.replace(/^\S+/, aliases[line.split(/\s+/)[0]])
      : line
    const [name, ...args] = expanded.split(/\s+/)

    if (!data) {
      const own = entry
      const wait = h('p', 'dim', root.dataset.loading ?? '…')
      own.append(wait)
      await load()
      wait.remove()
      // Nel frattempo può essere partito un altro comando: l'output torna nel suo entry
      entry = own
      if (!data) return printErr(root.dataset.error ?? '')
    }

    const command = commands[name]
    if (command) return command(args, line)
    printErr(fill(data.strings.notFound, { cmd: name }))
    const guess = Object.keys(commands).find((c) => distance(c, name) <= 2)
    if (guess) printDim(fill(data.strings.didYouMean, { cmd: guess }))
  }

  const complete = () => {
    if (!data) return
    const value = input.value
    const parts = value.split(/\s+/)
    let candidates: string[]
    if (parts.length === 1) {
      candidates = Object.keys(commands).filter((c) => c.startsWith(parts[0]))
    } else {
      const cmd = parts[0]
      const options: Record<string, string[]> = {
        theme: [...THEMES],
        lang: ['it', 'en'],
        projects: data.filters,
        git: ['log', 'status'],
        make: ['coffee'],
        man: Object.keys(commands),
      }
      const pool = options[cmd] ?? (['ls', 'cd', 'cat', 'open'].includes(cmd) ? paths() : [])
      candidates = pool.filter((p) => p.startsWith(parts.at(-1) ?? ''))
    }
    if (!candidates.length) return
    const head = parts.slice(0, -1).join(' ')
    const prefix = candidates.length === 1 ? candidates[0] : commonPrefix(candidates)
    const spacer = candidates.length === 1 && !prefix.endsWith('/') ? ' ' : ''
    input.value = `${head ? `${head} ` : ''}${prefix}${spacer}`
    if (candidates.length > 1) {
      entry = h('div', 'entry')
      log.append(entry)
      printDim(candidates.join('  '))
    }
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault()
    const value = input.value
    input.value = ''
    await run(value)
    input.scrollIntoView({ block: 'nearest' })
  })

  // I dati (~13 kB) si scaricano a browser inattivo o, al più tardi, al primo focus sul prompt
  input.addEventListener('focus', () => void load(), { once: true })
  if ('requestIdleCallback' in window) requestIdleCallback(() => void load())
  else setTimeout(() => void load(), 2000)

  input.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowUp' && history.length) {
      event.preventDefault()
      cursor = Math.max(0, cursor - 1)
      input.value = history[cursor] ?? ''
    } else if (event.key === 'ArrowDown' && history.length) {
      event.preventDefault()
      cursor = Math.min(history.length, cursor + 1)
      input.value = history[cursor] ?? ''
    } else if (event.key === 'Tab' && input.value.trim()) {
      // Tab completa solo se c'è qualcosa da completare: altrimenti sposta il focus come sempre
      event.preventDefault()
      void load().then(complete)
    } else if (event.key === 'l' && event.ctrlKey) {
      event.preventDefault()
      log.replaceChildren()
    } else if (event.key === 'c' && event.ctrlKey && input.selectionStart === input.selectionEnd) {
      // Ctrl+C senza selezione interrompe la riga, come in una shell (con selezione copia)
      event.preventDefault()
      entry = h('div', 'entry')
      log.append(entry)
      print(
        h('span', 'ps1', span('u', 'salvatore@dev'), ':', span('p', pwd), '$ '),
        input.value,
        span('dim', '^C')
      )
      input.value = ''
    }
  })
}
