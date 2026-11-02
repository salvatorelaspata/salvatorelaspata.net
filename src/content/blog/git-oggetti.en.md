---
title: "Git under the hood: blobs, trees and commits"
description: "From my slides to a terminal exercise: blobs, trees, commits and tags, content hashes, refs and HEAD. All the way to a commit made without git commit."
pubDate: 2026-07-20
tags: ["Strumenti"]
lang: en
translationKey: git-oggetti
urlSlug: git-objects
cover:
  icon: slides
relatedProject: git-sotto-al-cofano
draft: true
---

We use Git like an elevator. Press `add`, `commit`, `push` and you reach the right floor. As long as it works, nobody wonders what's inside the shaft. Then comes one `reset` too many, or a detached HEAD, and the most popular fix becomes cloning the repository again and copying files over by hand.

[[DA COMPLETARE: episodio reale che ha fatto nascere il talk "Git sotto il cofano" (un collega, un progetto, un repository da salvare)]]

Those commands aren't magic. They are shortcuts on top of a small, consistent data model: four object types, a few text files acting as pointers, and not much else. Once you've seen it up close, even the weirdest command becomes readable.

## From slides to article

The [Git under the hood](/en/projects/git-sotto-al-cofano) slides were made for a talk. [[DA COMPLETARE: evento, pubblico e anno del talk]] The first half is a refresher: what Git is, the main commands, `.gitignore`, the difference between Git and GitHub. The second half is what matters here: the storage model. Blob, tree, commit and HEAD on one slide, integrity through hashes on the next.

The last slide just says "Live Demo". This article is that demo, written down. With one advantage: I get to correct myself. On the slides, a SHA-1 hash has "30 hexadecimal characters". It has 40. On a slide titled "Integrity", that one stings a little.

## The .git folder

Everything Git knows about the project lives in the `.git` folder. A freshly created repository holds very little:

```bash title="terminal"
$ git init -b main git-by-hand
Initialized empty Git repository in /…/git-by-hand/.git/
$ cd git-by-hand
$ ls .git
HEAD
config
description
hooks
info
objects
refs
```

Three entries matter today. `objects` is the object database. `refs` holds named pointers, meaning branches and tags. `HEAD` tells you where you are right now. The `index` file, the staging area, shows up with the first `update-index`.

I pass `-b main` because the default name for the first branch is still `master`: the [git init documentation](https://git-scm.com/docs/git-init) announces the switch to `main` with Git 3.0. All the output below comes from Git 2.54.

## Four object types

| Object | What it contains | Points to |
| --- | --- | --- |
| blob | a file's content, without name or permissions | nothing |
| tree | a list of entries: mode, type, hash, name | blobs and other trees |
| commit | a tree, parent commits, author, committer, message | one tree and zero or more commits |
| annotated tag | target object, type, tag name, tagger, message | usually a commit |

The file name lives in the tree, not in the blob. So two identical files with different names share a single blob.

## The hash is the content

The [Pro Git](https://git-scm.com/book/en/v2/Git-Internals-Git-Objects) book calls Git a content-addressable filesystem: a key-value store where Git computes the key from the value. Here is the recipe for storing an object:

1. build a header: the type, a space, the content size in bytes, a null byte (`blob 11\0`);
2. concatenate header and content;
3. compute the SHA-1 hash of the result, 40 hexadecimal characters;
4. compress header and content with zlib and save them under `.git/objects/`, using the first 2 characters of the hash as the folder and the other 38 as the file name.

The consequence is simple. The same content produces the same hash on any machine. If a single byte gets corrupted, the hash no longer matches. Integrity isn't a feature bolted on later: it's how objects get their names.

## Exercise: a commit without git commit

First I pin author, committer and dates. Blobs and trees depend only on content, so they will have the same hashes on your machine too. Commits won't: they contain name, email and timestamp. With these variables, and a Git configuration without unusual customizations, you should get exactly my hashes.

```bash title="terminal"
$ export GIT_AUTHOR_NAME="Salvatore La Spata" GIT_AUTHOR_EMAIL="salvatore@example.com"
$ export GIT_COMMITTER_NAME="Salvatore La Spata" GIT_COMMITTER_EMAIL="salvatore@example.com"
$ export GIT_AUTHOR_DATE="2026-07-20T09:00:00+02:00" GIT_COMMITTER_DATE="2026-07-20T09:00:00+02:00"
```

### A blob

```bash title="terminal"
$ echo 'Hello, Git' > hello.txt
$ git hash-object -w hello.txt
b7aec520dec0a7516c18eb4c68b64ae1eb9b5a5e
$ find .git/objects -type f
.git/objects/b7/aec520dec0a7516c18eb4c68b64ae1eb9b5a5e
$ git cat-file -t b7aec520dec0a7516c18eb4c68b64ae1eb9b5a5e
blob
$ git cat-file -p b7aec520dec0a7516c18eb4c68b64ae1eb9b5a5e
Hello, Git
```

`-w` writes the object to the database: without it, Git only computes the hash. `cat-file -t` returns the type, `-p` pretty-prints the content. Then the check I cared about most: computing the hash without Git.

```bash title="terminal"
$ printf 'blob 11\0Hello, Git\n' | sha1sum
b7aec520dec0a7516c18eb4c68b64ae1eb9b5a5e  -
$ python3 -c "import sys, zlib; print(zlib.decompress(open(sys.argv[1], 'rb').read()))" .git/objects/b7/aec520dec0a7516c18eb4c68b64ae1eb9b5a5e
b'blob 11\x00Hello, Git\n'
```

Same hash. It's 11 bytes because `echo` appends a newline. And the file on disk, once zlib has decompressed it, holds exactly header plus content. If `sha1sum` isn't installed, `shasum` does the same job: with no options it uses SHA-1.

> **Try it.** Change a single letter in `hello.txt` and run `git hash-object` again: the whole hash changes, not just the last few characters. Put the file back the way it was and the hash is identical, down to the last character.

### From the index to a tree

A blob has no name. To give it one I go through the index: `update-index` records the blob with a mode and a path, `write-tree` turns the index into a tree object.

```bash title="terminal"
$ git update-index --add --cacheinfo 100644,b7aec520dec0a7516c18eb4c68b64ae1eb9b5a5e,hello.txt
$ git ls-files --stage
100644 b7aec520dec0a7516c18eb4c68b64ae1eb9b5a5e 0	hello.txt
$ git write-tree
996f638e1bc5fe472fc23bc5eeb5b232ab566185
$ git cat-file -p 996f638e1bc5fe472fc23bc5eeb5b232ab566185
100644 blob b7aec520dec0a7516c18eb4c68b64ae1eb9b5a5e	hello.txt
```

`100644` is a regular file. Files have only two other valid modes: `100755` for executables and `120000` for symbolic links. Subfolders show up as `040000 tree`, as we'll see shortly.

### The commit

```bash title="terminal"
$ git commit-tree 996f638e1bc5fe472fc23bc5eeb5b232ab566185 -m 'First commit, by hand'
bf5ce6e80f71094bd5bc9613fb7a50893b11deaa
$ git cat-file -p bf5ce6e80f71094bd5bc9613fb7a50893b11deaa
tree 996f638e1bc5fe472fc23bc5eeb5b232ab566185
author Salvatore La Spata <salvatore@example.com> 1784530800 +0200
committer Salvatore La Spata <salvatore@example.com> 1784530800 +0200

First commit, by hand
```

A commit is a small text file: the tree, author and committer with a Unix timestamp and time zone, a blank line, the message. No list of changed files. The repository, though, doesn't know about it yet:

```bash title="terminal"
$ cat .git/HEAD
ref: refs/heads/main
$ git log --oneline
fatal: your current branch 'main' does not have any commits yet
```

### A branch is a file

`HEAD` is a symbolic reference: it doesn't contain a hash but the name of another ref, `refs/heads/main`. That ref doesn't exist yet, and the [gitrepository-layout](https://git-scm.com/docs/gitrepository-layout) documentation considers that perfectly legal. So I create it:

```bash title="terminal"
$ git update-ref refs/heads/main bf5ce6e80f71094bd5bc9613fb7a50893b11deaa
$ cat .git/refs/heads/main
bf5ce6e80f71094bd5bc9613fb7a50893b11deaa
$ wc -c .git/refs/heads/main
      41 .git/refs/heads/main
$ git log --oneline
bf5ce6e First commit, by hand
```

A branch is a 41-byte file: 40 characters of hash and a newline. I could write it with `echo`, but Pro Git advises against editing ref files directly and points to `git update-ref` as the safer route.

> **Note.** "A branch is a file" holds for the default ref format, `files`, which uses individual files plus `packed-refs`. Git also supports the `reftable` format (`git init --ref-format=reftable`), where refs are no longer one file each. The model stays the same: a name pointing to a hash.

### The second commit

I add a folder and prepare a second snapshot. This time `update-index` reads the file from disk and writes the blob on its own.

```bash title="terminal"
$ mkdir docs
$ echo 'A commit is a snapshot, not a diff.' > docs/note.txt
$ git update-index --add docs/note.txt
$ git write-tree
f07a5485cd1192eb0f759c886a5678380829f74b
$ git cat-file -p f07a5485cd1192eb0f759c886a5678380829f74b
040000 tree 909e764c32305f11d7de7462850d396ed9a4c52d	docs
100644 blob b7aec520dec0a7516c18eb4c68b64ae1eb9b5a5e	hello.txt
$ git commit-tree f07a5485cd1192eb0f759c886a5678380829f74b -p bf5ce6e80f71094bd5bc9613fb7a50893b11deaa -m 'Second commit: docs/ arrives'
e57e3c466a0e6c7bd4d515fda6c23e725c62f186
$ git update-ref refs/heads/main e57e3c466a0e6c7bd4d515fda6c23e725c62f186 bf5ce6e80f71094bd5bc9613fb7a50893b11deaa
$ git log --oneline
e57e3c4 Second commit: docs/ arrives
bf5ce6e First commit, by hand
$ git status
On branch main
nothing to commit, working tree clean
```

`-p` sets the parent commit. The third argument to `update-ref` is the expected current value: the ref only moves if it still points there. And `git status` has no complaints: as far as Git is concerned, these handmade commits are indistinguishable from the ones `git commit` makes.

## Snapshots, not diffs

Look at the second tree. `hello.txt` hasn't changed, yet it shows up again, with the same hash `b7aec52…`. Every commit points to a tree that describes the whole project: not "what changed", but "what everything looked like at that moment". The diff you see with `git diff` or `git show` is computed on the fly by comparing two trees.

It isn't wasteful. Unchanged files aren't copied, they're referenced: same content, same hash, same object. And to know that two folders are identical, comparing two hashes is enough, without walking into the files.

## An annotated tag

```bash title="terminal"
$ git tag -a v0.1 -m 'First release'
$ git cat-file -p v0.1
object e57e3c466a0e6c7bd4d515fda6c23e725c62f186
type commit
tag v0.1
tagger Salvatore La Spata <salvatore@example.com> 1784530800 +0200

First release
$ cat .git/refs/tags/v0.1
6679220a980e29c4e3bf49fe34e3867da8385fe3
```

The `refs/tags/v0.1` ref doesn't point to the commit but to a tag object, which in turn points to the commit. A lightweight tag, created without `-a`, would just be a ref: no object, no message, no tagger. The final count is eight objects: two blobs, three trees, two commits and one tag.

## Packfiles, briefly

So far every object is a file of its own, what Git calls the "loose" format. On a real repository that would be wasteful, so every now and then Git packs objects into a packfile, with an index to find them quickly. It happens with `git gc`, when there are too many loose objects, or when you push to a server.

```bash title="terminal"
$ git gc --quiet
$ find .git/objects -type f
.git/objects/pack/pack-5bfdd2a34b28b59831cd6767eb73ea830103ac26.idx
.git/objects/pack/pack-5bfdd2a34b28b59831cd6767eb73ea830103ac26.pack
.git/objects/pack/pack-5bfdd2a34b28b59831cd6767eb73ea830103ac26.rev
.git/objects/info/commit-graph
.git/objects/info/packs
$ git verify-pack -v .git/objects/pack/pack-5bfdd2a34b28b59831cd6767eb73ea830103ac26.idx
e57e3c466a0e6c7bd4d515fda6c23e725c62f186 commit 261 169 12
6679220a980e29c4e3bf49fe34e3867da8385fe3 tag    151 138 181
bf5ce6e80f71094bd5bc9613fb7a50893b11deaa commit 76 87 319 1 e57e3c466a0e6c7bd4d515fda6c23e725c62f186
f07a5485cd1192eb0f759c886a5678380829f74b tree   68 78 406
909e764c32305f11d7de7462850d396ed9a4c52d tree   36 46 484
996f638e1bc5fe472fc23bc5eeb5b232ab566185 tree   37 48 530
50b0e6bf4c367d5e3845f985ac3c216d72837504 blob   36 44 578
b7aec520dec0a7516c18eb4c68b64ae1eb9b5a5e blob   11 20 622
non delta: 7 objects
chain length = 1: 1 object
.git/objects/pack/pack-5bfdd2a34b28b59831cd6767eb73ea830103ac26.pack: ok
```

The eight loose files are gone; everything now lives in a single pack. The refs were gathered into `.git/packed-refs` as well. The interesting line is the third one. The first commit has two extra columns, depth `1` and a base object: it's stored as a delta against the second commit. There they are, the diffs, at last. But they're a compression detail inside the pack, not the data model. And it's the older version that gets stored as a difference: [Pro Git](https://git-scm.com/book/en/v2/Git-Internals-Packfiles) explains that the most recent one is the one you're most likely to need.

## SHA-1 today, SHA-256 tomorrow

SHA-1 is still the default format. Since Git 2.13, as the [transition document](https://git-scm.com/docs/hash-function-transition) recalls, Git uses a hardened SHA-1 implementation that isn't vulnerable to the SHAttered attack, although SHA-1 remains a weak algorithm. SHA-256 already exists, and you choose it when you create the repository:

```bash title="terminal"
$ git init -b main --object-format=sha256 git-by-hand-sha256
Initialized empty Git repository in /…/git-by-hand-sha256/.git/
$ cd git-by-hand-sha256
$ echo 'Hello, Git' | git hash-object --stdin
886fb8fd8e66c5a7483536a90f8bb355ac1a36e70e36e6d1872d7f583af8f76a
```

Same content, same header, 64 characters instead of 40. The [git init documentation](https://git-scm.com/docs/git-init) currently says two things. First: at present there is no interoperability between SHA-256 and SHA-1 repositories. Second: the project used to warn that SHA-256 repositories might need backward-incompatible changes later; today it only expects compatible ones.

The [BreakingChanges](https://git-scm.com/docs/BreakingChanges) document lists SHA-256 as the default for new repositories among the Git 3.0 changes, on one condition: the ecosystem has to be ready, meaning libraries, applications and forges. Git 3.0 has no release date yet, and there are no plans to deprecate SHA-1.

## What I learned

Turning the demo into an article leaves a few ideas that are worth more than any single command.

- Everyday commands are compositions of a few "plumbing" commands. Pro Git says it plainly: `git add` and `git commit` store blobs, update the index, write trees and commits. Today I did it by hand.
- A branch costs 41 bytes. There's no reason to ration them.
- Objects are never modified. An `--amend` or a rebase doesn't change a commit: it creates a new one, with a new hash. That's why rewriting history that others already have causes them trouble.
- A `reset` moves a pointer. Commits that look lost stay in the database until garbage collection removes them, and `git reflog` helps you find them again.

Next time someone suggests cloning the repository again, we open `.git` together first. The full slides are on the [Git under the hood](/en/projects/git-sotto-al-cofano) project page.
