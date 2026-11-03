---
title: "Leading 16 people without giving up writing code"
description: "From SAP Full Stack Developer to SAP BTP Practice Leader with a team of 16: how I protect coding time, delegate, use code review and write decisions down."
pubDate: 2026-06-03
tags: ["Carriera"]
lang: en
translationKey: team-16
urlSlug: team-16
cover:
  icon: users
draft: true
---

## The problem: the calendar always wins

From 2017 to 2022 my job was writing code. At Cube Consultants I was an SAP Full Stack Developer: on-premise ABAP across the HCM, MM and SD modules, SAP BTP in the cloud and, around it, React, React Native and Node.js. Since January 2023 I've been the SAP BTP Practice Leader at GOTONEXT, with a team of 16 people.

My official title says it all: Practice Leader, SME, SAP BTP Architect, Senior SAP Full Stack Technical Consultant, Team Leader. Five roles, one calendar. The new job didn't replace the old one: it sat on top of it.

[[DA COMPLETARE: what a typical week looked like in early 2023 (hours of meetings, client calls, how much code you actually managed to write) and the moment you realized it wasn't working]]

The mechanics are simple. Meetings take half an hour at a time, code needs whole hours, and an afternoon cut into four pieces doesn't contain a single one. At that point there are two ways out: stop writing code, or write it at night.

[[DA COMPLETARE: which of the two temptations pulled at you more, how long it lasted and what made you change course]]

## The team, briefly

[[DA COMPLETARE: what the SAP BTP practice does at GOTONEXT, in one or two sentences]]

[[DA COMPLETARE: how the team of 16 is made up (roles and seniority, e.g. how many on CAP and SAPUI5, how many on ABAP or integrations, how many juniors and seniors; proportions are enough) and how it has grown since 2023]]

## Why I didn't stop writing code

A practice leader on SAP BTP makes decisions that other people will implement: how to structure a CAP service, where an extension should run, how much to invest in automation. Every one of those choices has a cost you only see by writing the code.

[[DA COMPLETARE: why writing code is still necessary for you to make good decisions. Give a concrete example, without client names, where getting your hands dirty changed a decision or an estimate]]

## Protecting time for code

### Calendar blocks, defended like meetings

A calendar block is only as good as the rule that decides when it can move.

[[DA COMPLETARE: how many hours a week you block for code, on which days or time slots, and how you defend them (recurring blocks visible to the team? what can move them and what can't? how do you handle client emergencies?)]]

### Choosing which code to write

Not all code suits someone with an unpredictable calendar. A task on a delivery's critical path, assigned to someone who can vanish into a call for half a day, becomes a risk for the whole team.

[[DA COMPLETARE: which code you write yourself today (prototypes, technical spikes, internal tooling, reusable plugins and libraries; if relevant, mention the [CAP plugin for Adobe Forms](/en/projects/cap-plugin-adobe-forms) or other portfolio projects) and which work you no longer pick up]]

## Delegating without disappearing

With 16 people, delegating doesn't mean handing out tasks. It means deciding who owns what, and then letting them get on with it.

[[DA COMPLETARE: what you delegate entirely (ownership of a project, of a technical area such as UI5, CAP or integrations, of the technical relationship with a client) and what you keep; how you choose who gets it]]

[[DA COMPLETARE: a delegation mistake you made early on (e.g. delegating the task but not the decision, or taking the work back halfway through) and what you changed afterwards]]

## Code review as a classroom

Review is where a technical lead sees the team's work without asking for status reports. It can become a bottleneck or the tool the team grows with: it depends on how you set it up.

- **Who reviews.** [[DA COMPLETARE: who does reviews on the team (seniors only, on rotation, juniors reviewing seniors' code too?) and how many approvals a merge needs]]
- **How we comment.** [[DA COMPLETARE: your rules for review comments, e.g. always explain the why, separate blocking comments from suggestions, propose rather than rewrite]]
- **What I look at.** [[DA COMPLETARE: what you personally check in a review and what you leave to colleagues or automated tools (linters, tests, CI pipelines)]]
- **Where it happens.** [[DA COMPLETARE: where reviews take place (GitHub, GitLab, Azure DevOps…) and whether they cover the whole stack or only CAP and UI5 projects]]

[[DA COMPLETARE: an example of a review that helped someone on the team grow, without names]]

## Shared decisions: decision records

Technical decisions made in meetings have a flaw: they stay in the heads of whoever was in the room. Six months later nobody remembers why a path was chosen, and the discussion starts from scratch. Or worse, someone reverses the decision without knowing what was holding it up.

An Architecture Decision Record (ADR) fixes that. It's a short document that captures a single architecturally significant decision: the context it came from, what was decided, its status and its consequences. The reference format was proposed by Michael Nygard in 2011 in [Documenting Architecture Decisions](https://www.cognitect.com/blog/2011/11/15/documenting-architecture-decisions): one or two pages of Markdown, kept in the project repository next to the code, numbered sequentially. Numbers are never reused. A reversed decision isn't deleted: it's marked as superseded and linked to the one that replaces it. [adr.github.io](https://adr.github.io/) collects templates and tools.

```markdown title="doc/arch/adr-001.md"
# ADR 001: <short title, a noun phrase>

## Context
The forces at play: technical, project and team constraints.
Described neutrally, before choosing anything.

## Decision
Full sentences, active voice: "We will…", "We will not…".

## Status
Proposed | Accepted | Deprecated | Superseded by ADR NNN

## Consequences
Everything that follows: positive, negative, neutral.
What gets easier, what gets harder, what will need revisiting.
```

> **Note.** An ADR is not meeting minutes: it describes a decision and its consequences, not who said what. And it isn't meant for every choice. Nygard keeps it for "architecturally significant" decisions, the ones that affect structure, non-functional characteristics, dependencies, interfaces or construction techniques.

For anyone leading a team the payoff is concrete: a written decision can be discussed, challenged and found again even when you're not around.

[[DA COMPLETARE: since when the team has used decision records, where you keep them (in each project's repository or in a practice-wide one) and whether you've added fields to Nygard's template (e.g. alternatives considered, accessibility impact)]]

[[DA COMPLETARE: who can propose an ADR and how it becomes "Accepted" (pull request review, technical meeting, your sign-off?); an example of a recorded decision, without client names]]

## What I stopped doing

Changing roles also means taking things off the list, not just adding them.

- [[DA COMPLETARE: the first thing you stopped doing (e.g. rewriting code yourself instead of commenting on it in review) and what replaced it]]
- [[DA COMPLETARE: the second (e.g. being the only technical point of contact for every client)]]
- [[DA COMPLETARE: the third (e.g. answering every technical question in chat in real time)]]
- [[DA COMPLETARE: a fourth, optional]]

## Accessibility as a team standard

Alongside SAP projects I build accessible web applications, with particular attention to low-vision and blind users: WCAG guidelines, ARIA attributes, interfaces that work with screen readers.

A team standard isn't a person who knows about it: it's a written criterion that still applies when that person is on vacation. I described the rules I applied to my own site in [An accessible portfolio](/en/blog/accessible-portfolio).

[[DA COMPLETARE: how accessibility fits into the team's process (definition of done, review checklist, keyboard and screen reader testing, automated tools) and since when]]

[[DA COMPLETARE: why you wanted accessibility to become a team skill rather than just yours; how you convinced the team (or clients) that it's a standard and not an extra; any pushback and how you handled it]]

> **Try it.** At your next review, use the feature with the keyboard only: Tab, Shift+Tab, Enter, Esc. If focus disappears or jumps somewhere unexpected, you've found your first accessibility bug.

## What I learned

[[DA COMPLETARE: three first-person lessons, one or two sentences each, in your own voice (e.g. about time, trust, writing decisions down)]]

If you're making the same move, from developer to someone who leads developers, I'd like to hear how you're handling it. [Get in touch](/en/#contact).
