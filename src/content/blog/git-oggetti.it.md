---
title: "Git sotto al cofano: blob, tree e commit"
description: "Dalle mie slide a un esercizio nel terminale: blob, tree, commit e tag, hash del contenuto, refs e HEAD. Fino a una commit creata senza usare git commit."
pubDate: 2026-07-20
tags: ["Strumenti"]
lang: it
translationKey: git-oggetti
urlSlug: git-oggetti
cover:
  icon: slides
relatedProject: git-sotto-al-cofano
draft: true
---

Git lo usiamo come un ascensore. Premi `add`, `commit`, `push` e arrivi al piano giusto. Finché funziona, nessuno si chiede cosa ci sia nel vano. Poi arriva un `reset` di troppo o un detached HEAD, e la soluzione più gettonata diventa clonare di nuovo il repository e copiare i file a mano.

[[DA COMPLETARE: episodio reale che ha fatto nascere il talk "Git sotto il cofano" (un collega, un progetto, un repository da salvare)]]

Quei comandi non sono magia. Sono scorciatoie sopra un modello di dati piccolo e coerente: quattro tipi di oggetto, qualche file di testo che fa da puntatore e poco altro. Una volta visto da vicino, anche il comando più strano diventa leggibile.

## Dalle slide all'articolo

Le slide di [Git sotto al cofano](/projects/git-sotto-al-cofano) sono nate per un talk. [[DA COMPLETARE: evento, pubblico e anno del talk]] La prima metà è un ripasso: cos'è Git, i comandi principali, `.gitignore`, la differenza tra Git e GitHub. La seconda metà è quella che mi interessa qui: il modello di storage. Blob, tree, commit e HEAD su una slide, l'integrità garantita dagli hash su quella dopo.

L'ultima slide dice solo "Live Demo". Questo articolo è quella demo, messa per iscritto. Con un vantaggio: posso correggermi. Nelle slide un hash SHA-1 ha "30 caratteri esadecimali". Sono 40. Su una slide intitolata "Integrità" brucia un po'.

## La cartella .git

Tutto quello che Git sa del progetto sta nella cartella `.git`. Appena creato, il repository contiene poco:

```bash title="terminale"
$ git init -b main git-a-mano
Initialized empty Git repository in /…/git-a-mano/.git/
$ cd git-a-mano
$ ls .git
HEAD
config
description
hooks
info
objects
refs
```

Le voci che contano oggi sono tre. `objects` è il database degli oggetti. `refs` contiene i puntatori con un nome, cioè branch e tag. `HEAD` dice dove sei adesso. Il file `index`, la staging area, comparirà al primo `update-index`.

Uso `-b main` perché il nome predefinito del primo branch è ancora `master`: la [documentazione di git init](https://git-scm.com/docs/git-init) annuncia il passaggio a `main` con Git 3.0. Gli output che seguono vengono da Git 2.54.

## Quattro tipi di oggetto

| Oggetto | Cosa contiene | Punta a |
| --- | --- | --- |
| blob | il contenuto di un file, senza nome né permessi | niente |
| tree | una lista di voci: modo, tipo, hash, nome | blob e altri tree |
| commit | un tree, le commit parent, autore, committer, messaggio | un tree e zero o più commit |
| tag annotato | oggetto puntato, tipo, nome del tag, tagger, messaggio | di solito una commit |

Il nome del file sta nel tree, non nel blob. Due file identici con nomi diversi, quindi, occupano un solo blob.

## L'hash è il contenuto

Il libro [Pro Git](https://git-scm.com/book/en/v2/Git-Internals-Git-Objects) definisce Git un filesystem indirizzabile per contenuto: un archivio chiave-valore in cui la chiave la calcola Git a partire dal valore. La ricetta per salvare un oggetto è questa:

1. costruisce un header: il tipo, uno spazio, la dimensione del contenuto in byte, un byte nullo (`blob 10\0`);
2. concatena header e contenuto;
3. calcola l'hash SHA-1 del risultato, 40 caratteri esadecimali;
4. comprime header e contenuto con zlib e li salva in `.git/objects/`, con i primi 2 caratteri dell'hash come cartella e gli altri 38 come nome del file.

La conseguenza è semplice. Lo stesso contenuto produce lo stesso hash su qualunque macchina. Se un byte si corrompe, l'hash non torna più. L'integrità non è una funzione aggiunta dopo: è il modo in cui gli oggetti hanno un nome.

## Esercizio: una commit senza git commit

Prima fisso autore, committer e date. Blob e tree dipendono solo dal contenuto, quindi avranno gli stessi hash anche sul tuo computer. Le commit no: dentro ci sono nome, email e timestamp. Con queste variabili, e una configurazione di Git senza personalizzazioni particolari, dovresti ottenere esattamente i miei hash.

```bash title="terminale"
$ export GIT_AUTHOR_NAME="Salvatore La Spata" GIT_AUTHOR_EMAIL="salvatore@example.com"
$ export GIT_COMMITTER_NAME="Salvatore La Spata" GIT_COMMITTER_EMAIL="salvatore@example.com"
$ export GIT_AUTHOR_DATE="2026-07-20T09:00:00+02:00" GIT_COMMITTER_DATE="2026-07-20T09:00:00+02:00"
```

### Un blob

```bash title="terminale"
$ echo 'Ciao, Git' > saluto.txt
$ git hash-object -w saluto.txt
e93e468167c73cf61e33c96c04a6c7e7a1c4d68d
$ find .git/objects -type f
.git/objects/e9/3e468167c73cf61e33c96c04a6c7e7a1c4d68d
$ git cat-file -t e93e468167c73cf61e33c96c04a6c7e7a1c4d68d
blob
$ git cat-file -p e93e468167c73cf61e33c96c04a6c7e7a1c4d68d
Ciao, Git
```

`-w` scrive l'oggetto nel database: senza, Git calcola solo l'hash. `cat-file -t` restituisce il tipo, `-p` stampa il contenuto in forma leggibile. Poi la verifica che mi interessava di più: rifare l'hash senza Git.

```bash title="terminale"
$ printf 'blob 10\0Ciao, Git\n' | sha1sum
e93e468167c73cf61e33c96c04a6c7e7a1c4d68d  -
$ python3 -c "import sys, zlib; print(zlib.decompress(open(sys.argv[1], 'rb').read()))" .git/objects/e9/3e468167c73cf61e33c96c04a6c7e7a1c4d68d
b'blob 10\x00Ciao, Git\n'
```

Stesso hash. I byte sono 10 perché `echo` aggiunge un a capo. E il file su disco, decompresso con zlib, contiene esattamente header e contenuto. Se `sha1sum` non c'è, `shasum` fa lo stesso lavoro: senza opzioni usa SHA-1.

> **Da provare.** Cambia una sola lettera in `saluto.txt` e rilancia `git hash-object`: l'hash cambia per intero, non solo in fondo. Rimetti il file com'era e torna identico al carattere.

### Dall'index a un tree

Un blob non ha nome. Per darglielo passo dall'index: `update-index` registra il blob con modo e percorso, `write-tree` trasforma l'index in un oggetto tree.

```bash title="terminale"
$ git update-index --add --cacheinfo 100644,e93e468167c73cf61e33c96c04a6c7e7a1c4d68d,saluto.txt
$ git ls-files --stage
100644 e93e468167c73cf61e33c96c04a6c7e7a1c4d68d 0	saluto.txt
$ git write-tree
82ae9cbac8f23c7db9a16acbdab65dfbf0bed7b6
$ git cat-file -p 82ae9cbac8f23c7db9a16acbdab65dfbf0bed7b6
100644 blob e93e468167c73cf61e33c96c04a6c7e7a1c4d68d	saluto.txt
```

`100644` è un file normale. Per i file esistono solo altri due modi, `100755` per gli eseguibili e `120000` per i link simbolici. Le sottocartelle compaiono come `040000 tree`: lo vedremo tra poco.

### La commit

```bash title="terminale"
$ git commit-tree 82ae9cbac8f23c7db9a16acbdab65dfbf0bed7b6 -m 'Prima commit, a mano'
8e9e3fb07a050bd7b41f5375acfa441e53e7c931
$ git cat-file -p 8e9e3fb07a050bd7b41f5375acfa441e53e7c931
tree 82ae9cbac8f23c7db9a16acbdab65dfbf0bed7b6
author Salvatore La Spata <salvatore@example.com> 1784530800 +0200
committer Salvatore La Spata <salvatore@example.com> 1784530800 +0200

Prima commit, a mano
```

Una commit è un piccolo file di testo: il tree, autore e committer con timestamp Unix e fuso orario, una riga vuota, il messaggio. Nessuna lista di file modificati. Il repository, però, non lo sa ancora:

```bash title="terminale"
$ cat .git/HEAD
ref: refs/heads/main
$ git log --oneline
fatal: your current branch 'main' does not have any commits yet
```

### Il branch è un file

`HEAD` è un riferimento simbolico: non contiene un hash, ma il nome di un altro ref, `refs/heads/main`. Quel ref non esiste ancora, e la documentazione di [gitrepository-layout](https://git-scm.com/docs/gitrepository-layout) lo considera perfettamente legale. Lo creo io:

```bash title="terminale"
$ git update-ref refs/heads/main 8e9e3fb07a050bd7b41f5375acfa441e53e7c931
$ cat .git/refs/heads/main
8e9e3fb07a050bd7b41f5375acfa441e53e7c931
$ wc -c .git/refs/heads/main
      41 .git/refs/heads/main
$ git log --oneline
8e9e3fb Prima commit, a mano
```

Un branch è un file di 41 byte: 40 caratteri di hash e un a capo. Potrei scriverlo con `echo`, ma Pro Git sconsiglia di modificare a mano i file dei ref e indica `git update-ref` come strada più sicura.

> **Nota.** "Un branch è un file" vale per il formato di ref predefinito, `files`, che usa file singoli più `packed-refs`. Git supporta anche il formato `reftable` (`git init --ref-format=reftable`), in cui i ref non sono più un file ciascuno. Il modello non cambia: un nome che punta a un hash.

### La seconda commit

Aggiungo una cartella e preparo un secondo snapshot. Stavolta `update-index` legge il file dal disco e scrive il blob da solo.

```bash title="terminale"
$ mkdir docs
$ echo 'Una commit è una foto, non un diff.' > docs/nota.txt
$ git update-index --add docs/nota.txt
$ git write-tree
0cb64fbdfde9649b9c04846a840707e1c844f49b
$ git cat-file -p 0cb64fbdfde9649b9c04846a840707e1c844f49b
040000 tree a2919938339ec0898b0177ee214b66c6c4d412d1	docs
100644 blob e93e468167c73cf61e33c96c04a6c7e7a1c4d68d	saluto.txt
$ git commit-tree 0cb64fbdfde9649b9c04846a840707e1c844f49b -p 8e9e3fb07a050bd7b41f5375acfa441e53e7c931 -m 'Seconda commit: arriva docs/'
d1f4c4ba66a092afa045edd8732ab45dd31bb832
$ git update-ref refs/heads/main d1f4c4ba66a092afa045edd8732ab45dd31bb832 8e9e3fb07a050bd7b41f5375acfa441e53e7c931
$ git log --oneline
d1f4c4b Seconda commit: arriva docs/
8e9e3fb Prima commit, a mano
$ git status
On branch main
nothing to commit, working tree clean
```

`-p` indica la commit parent. Il terzo argomento di `update-ref` è il valore atteso: il ref si aggiorna solo se punta ancora lì. E `git status` non trova niente da ridire: per Git queste commit fatte a mano sono indistinguibili da quelle di `git commit`.

## Snapshot, non diff

Guarda il secondo tree. `saluto.txt` non è cambiato, eppure compare di nuovo, con lo stesso hash `e93e468…`. Ogni commit punta a un tree che descrive il progetto intero: non "cosa è cambiato", ma "com'era tutto in quel momento". Il diff che vedi con `git diff` o `git show` Git lo calcola al volo, confrontando due tree.

Non è uno spreco. I file non modificati non vengono copiati, vengono referenziati: stesso contenuto, stesso hash, stesso oggetto. E per sapere che due cartelle sono identiche basta confrontare due hash, senza scendere nei file.

## Un tag annotato

```bash title="terminale"
$ git tag -a v0.1 -m 'Prima versione'
$ git cat-file -p v0.1
object d1f4c4ba66a092afa045edd8732ab45dd31bb832
type commit
tag v0.1
tagger Salvatore La Spata <salvatore@example.com> 1784530800 +0200

Prima versione
$ cat .git/refs/tags/v0.1
d65318d468bb7f37437f9d73a8a0e3033922bd62
```

Il ref `refs/tags/v0.1` non punta alla commit, ma a un oggetto tag che a sua volta punta alla commit. Un tag leggero, creato senza `-a`, sarebbe solo un ref: niente oggetto, niente messaggio, niente tagger. Il conto finale fa otto oggetti: due blob, tre tree, due commit e un tag.

## Packfile, in breve

Finora ogni oggetto è un file a sé, quello che Git chiama formato "loose". Su un repository vero sarebbe uno spreco, quindi ogni tanto Git impacchetta gli oggetti in un packfile, con un indice per ritrovarli in fretta. Succede con `git gc`, quando gli oggetti loose diventano troppi o quando fai push verso un server.

```bash title="terminale"
$ git gc --quiet
$ find .git/objects -type f
.git/objects/pack/pack-8c474bbf0ae7c371e6e50e428d99a9636417ca80.idx
.git/objects/pack/pack-8c474bbf0ae7c371e6e50e428d99a9636417ca80.rev
.git/objects/pack/pack-8c474bbf0ae7c371e6e50e428d99a9636417ca80.pack
.git/objects/info/commit-graph
.git/objects/info/packs
$ git verify-pack -v .git/objects/pack/pack-8c474bbf0ae7c371e6e50e428d99a9636417ca80.idx
d1f4c4ba66a092afa045edd8732ab45dd31bb832 commit 261 167 12
d65318d468bb7f37437f9d73a8a0e3033922bd62 tag    152 140 179
8e9e3fb07a050bd7b41f5375acfa441e53e7c931 commit 75 87 319 1 d1f4c4ba66a092afa045edd8732ab45dd31bb832
0cb64fbdfde9649b9c04846a840707e1c844f49b tree   69 80 406
a2919938339ec0898b0177ee214b66c6c4d412d1 tree   36 46 486
82ae9cbac8f23c7db9a16acbdab65dfbf0bed7b6 tree   38 49 532
52121aa22580ab5c7e3aea581a2e594a0726fa96 blob   37 44 581
e93e468167c73cf61e33c96c04a6c7e7a1c4d68d blob   10 19 625
non delta: 7 objects
chain length = 1: 1 object
.git/objects/pack/pack-8c474bbf0ae7c371e6e50e428d99a9636417ca80.pack: ok
```

Gli otto file loose sono spariti, ora vivono tutti in un unico pack. Anche i ref sono stati raccolti in `.git/packed-refs`. La riga interessante è la terza. La prima commit ha due colonne in più, profondità `1` e un oggetto base: è salvata come delta rispetto alla seconda. Ecco i diff, finalmente. Ma sono un dettaglio di compressione dentro il pack, non il modello dei dati. Ed è la versione più vecchia a essere salvata come differenza: [Pro Git](https://git-scm.com/book/en/v2/Git-Internals-Packfiles) spiega che quella recente è quella che ti serve più spesso.

## SHA-1 oggi, SHA-256 domani

SHA-1 è ancora il formato predefinito. Da Git 2.13, ricorda la [documentazione sulla transizione](https://git-scm.com/docs/hash-function-transition), Git usa un'implementazione "hardened" di SHA-1 che non è vulnerabile all'attacco SHAttered, anche se SHA-1 resta un algoritmo debole. SHA-256 esiste già e si sceglie alla creazione del repository:

```bash title="terminale"
$ git init -b main --object-format=sha256 git-a-mano-sha256
Initialized empty Git repository in /…/git-a-mano-sha256/.git/
$ cd git-a-mano-sha256
$ echo 'Ciao, Git' | git hash-object --stdin
761326b460d93d952eeb7bd92958fc95661934716160097217acc404b5604d9f
```

Stesso contenuto, stesso header, 64 caratteri invece di 40. La [documentazione di git init](https://git-scm.com/docs/git-init) oggi dice due cose. Primo: al momento non c'è interoperabilità tra repository SHA-256 e repository SHA-1. Secondo: in passato si avvisava che i repository SHA-256 avrebbero potuto richiedere modifiche incompatibili; oggi il progetto si aspetta solo modifiche compatibili.

Il documento [BreakingChanges](https://git-scm.com/docs/BreakingChanges) mette SHA-256 come predefinito per i nuovi repository tra i cambiamenti di Git 3.0, a una condizione: che l'ecosistema sia pronto, cioè librerie, applicazioni e forge. Per Git 3.0 non c'è ancora una data, e non è previsto di deprecare SHA-1.

## Cosa ho imparato

Trasformare la demo in un articolo lascia alcune idee che valgono più dei singoli comandi.

- I comandi di tutti i giorni sono composizioni di pochi comandi "plumbing". Pro Git lo dice chiaramente: `git add` e `git commit` salvano blob, aggiornano l'index, scrivono tree e commit. Oggi l'ho fatto a mano.
- Un branch costa 41 byte. Non c'è motivo di centellinarli.
- Gli oggetti non si modificano mai. Un `--amend` o un rebase non cambiano una commit: ne creano una nuova, con un hash nuovo. Per questo riscrivere una storia già condivisa crea problemi agli altri.
- Un `reset` sposta un puntatore. Le commit che sembrano perse restano nel database finché il garbage collector non le elimina, e `git reflog` aiuta a ritrovarle.

La prossima volta che qualcuno mi propone di clonare di nuovo il repository, prima apriamo `.git` insieme. Le slide complete sono nella pagina del progetto [Git sotto al cofano](/projects/git-sotto-al-cofano).
