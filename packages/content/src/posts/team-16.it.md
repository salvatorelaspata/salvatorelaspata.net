---
title: "Guidare 16 persone senza smettere di scrivere codice"
description: "Da SAP Full Stack Developer a Practice Leader SAP BTP con 16 persone: come proteggo il tempo per il codice, delego, uso la code review e scrivo le decisioni."
pubDate: 2026-06-03
tags: ["Carriera"]
lang: it
translationKey: team-16
urlSlug: team-16
cover:
  icon: users
draft: true
---

## Il problema: l'agenda vince sempre

Dal 2017 al 2022 il mio lavoro era scrivere codice. In Cube Consultants ero SAP Full Stack Developer: ABAP on-premise sui moduli HCM, MM e SD, SAP BTP in cloud e, attorno, React, React Native e Node.js. Da gennaio 2023 sono Practice Leader SAP BTP in GOTONEXT, con un team di 16 persone.

Il mio titolo ufficiale dice già tutto: Practice Leader, SME, SAP BTP Architect, Senior SAP Full Stack Technical Consultant, Team Leader. Cinque ruoli, un'agenda sola. Il nuovo incarico non ha cancellato il vecchio: ci si è seduto sopra.

[[DA COMPLETARE: com'era una tua settimana tipo nei primi mesi del 2023 (ore di riunione, call con i clienti, quanto codice riuscivi davvero a scrivere) e il momento preciso in cui hai capito che così non funzionava]]

Il meccanismo è semplice. Le riunioni si prendono mezz'ora alla volta, il codice ha bisogno di ore intere, e un pomeriggio spezzato in quattro non ne contiene nemmeno una. A quel punto le strade sono due: smettere di scrivere codice, o scriverlo la sera.

[[DA COMPLETARE: quale delle due tentazioni hai sentito di più, quanto è durata e cosa ti ha fatto cambiare strada]]

## Il team, in breve

[[DA COMPLETARE: cosa fa la practice SAP BTP in GOTONEXT, in una o due frasi]]

[[DA COMPLETARE: composizione del team di 16 persone (ruoli e seniority, ad es. quanti su CAP e SAPUI5, quanti su ABAP o integrazioni, quanti junior e senior; bastano le proporzioni) e come è cresciuto dal 2023 a oggi]]

## Perché non ho smesso di scrivere codice

Un practice leader su SAP BTP prende decisioni che altri implementeranno: come strutturare un servizio CAP, dove far girare un'estensione, quanto investire in automazione. Ogni scelta ha un costo che si vede solo scrivendo il codice.

[[DA COMPLETARE: perché per te scrivere codice resta necessario per decidere bene. Racconta un esempio concreto, senza nomi di clienti, in cui averci messo le mani ha cambiato una decisione o una stima]]

## Proteggere il tempo per il codice

### Blocchi in agenda, difesi come riunioni

Un blocco in agenda vale quanto la regola che decide quando si può spostare.

[[DA COMPLETARE: quante ore a settimana blocchi per il codice, in quali giorni o fasce orarie, e come le difendi in agenda (blocchi ricorrenti visibili al team? cosa può spostarli e cosa no? come gestisci le urgenze dei clienti?)]]

### Scegliere quale codice scrivere

Non tutto il codice è adatto a chi ha un'agenda imprevedibile. Un task sul percorso critico di una consegna, affidato a qualcuno che può sparire in una call per mezza giornata, diventa un rischio per tutto il team.

[[DA COMPLETARE: quale codice scrivi oggi in prima persona (prototipi, spike tecnici, tooling interno, plugin e librerie riusabili; se pertinente cita il [plugin CAP per Adobe Forms](/projects/cap-plugin-adobe-forms) o altri progetti del portfolio) e quale invece non prendi più in carico]]

## Delegare senza sparire

Con 16 persone, delegare non significa distribuire task. Significa decidere chi è responsabile di cosa, e poi lasciarlo fare.

[[DA COMPLETARE: cosa deleghi per intero (ownership di un progetto, di un'area tecnica come UI5, CAP o integrazioni, del rapporto tecnico con un cliente) e cosa tieni per te; come scegli a chi affidarlo]]

[[DA COMPLETARE: un errore di delega che hai fatto all'inizio (ad es. delegare il task ma non la decisione, o riprenderti il lavoro a metà) e cosa hai cambiato dopo]]

## La code review come scuola

La review è il punto in cui un leader tecnico vede il lavoro del team senza chiedere report. Può diventare un collo di bottiglia o lo strumento con cui il team cresce: dipende da come la imposti.

- **Chi revisiona.** [[DA COMPLETARE: chi fa le review nel team (solo i senior, a rotazione, anche i junior sul codice dei senior?) e quanti revisori servono per un merge]]
- **Come si commenta.** [[DA COMPLETARE: le tue regole per i commenti, ad es. spiegare sempre il perché, distinguere i commenti bloccanti dai suggerimenti, proporre invece di riscrivere]]
- **Cosa guardo io.** [[DA COMPLETARE: cosa controlli personalmente in una review e cosa lasci ai colleghi o agli strumenti automatici (linter, test, pipeline CI)]]
- **Dove succede.** [[DA COMPLETARE: dove avvengono le review (GitHub, GitLab, Azure DevOps…) e se riguardano tutto lo stack o solo i progetti CAP e UI5]]

[[DA COMPLETARE: un esempio di come una review ha fatto crescere qualcuno nel team, senza nomi]]

## Decisioni condivise: i decision record

Le decisioni tecniche prese in riunione hanno un difetto: restano nella testa di chi c'era. Sei mesi dopo nessuno ricorda perché si è scelta una strada, e la discussione ricomincia da capo. O peggio, qualcuno annulla la decisione senza sapere cosa la teneva in piedi.

Un Architecture Decision Record (ADR) risolve questo problema. È un documento breve che registra una singola decisione architetturale significativa: il contesto in cui è nata, cosa si è deciso, lo stato e le conseguenze. Il formato di riferimento l'ha proposto Michael Nygard nel 2011 in [Documenting Architecture Decisions](https://www.cognitect.com/blog/2011/11/15/documenting-architecture-decisions): una o due pagine in Markdown, salvate nel repository del progetto insieme al codice, numerate in sequenza. I numeri non si riusano. Una decisione superata non si cancella: si segna come sostituita e si collega a quella nuova. Il sito [adr.github.io](https://adr.github.io/) raccoglie template e strumenti.

```markdown title="doc/arch/adr-001.md"
# ADR 001: <titolo breve, una frase nominale>

## Contesto
Le forze in gioco: vincoli tecnici, di progetto, di team.
Descritte in modo neutro, senza ancora scegliere.

## Decisione
Frasi complete, in forma attiva: "Useremo…", "Non faremo…".

## Stato
Proposta | Accettata | Deprecata | Sostituita da ADR NNN

## Conseguenze
Tutto quello che succede dopo: positivo, negativo, neutro.
Cosa diventa più facile, cosa più difficile, cosa andrà rivisto.
```

> **Nota.** Un ADR non è un verbale: racconta una decisione e le sue conseguenze, non chi ha detto cosa in riunione. E non serve per ogni scelta. Nygard lo riserva alle decisioni "architecturally significant", quelle che toccano struttura, caratteristiche non funzionali, dipendenze, interfacce o tecniche di costruzione.

Per chi guida un team il vantaggio è concreto: una decisione scritta può essere discussa, contestata e ritrovata anche quando tu non ci sei.

[[DA COMPLETARE: da quando usate i decision record nel team, dove li tenete (nel repository di ogni progetto o in uno della practice) e se avete aggiunto campi al template di Nygard (ad es. alternative considerate, impatto sull'accessibilità)]]

[[DA COMPLETARE: chi può proporre un ADR e come diventa "Accettata" (revisione in pull request, riunione tecnica, tua approvazione?); un esempio di decisione registrata, senza nomi di clienti]]

## Cosa ho smesso di fare

Cambiare ruolo significa anche togliere, non solo aggiungere.

- [[DA COMPLETARE: prima cosa che hai smesso di fare (ad es. riscrivere tu il codice invece di commentarlo in review) e cosa l'ha sostituita]]
- [[DA COMPLETARE: seconda (ad es. essere l'unico punto di contatto tecnico per ogni cliente)]]
- [[DA COMPLETARE: terza (ad es. rispondere in chat in tempo reale a ogni domanda tecnica)]]
- [[DA COMPLETARE: quarta, facoltativa]]

## L'accessibilità come standard del team

Accanto ai progetti SAP sviluppo applicazioni web accessibili, con particolare attenzione a chi è ipovedente o non vedente: linee guida WCAG, attributi ARIA, interfacce che funzionano con gli screen reader.

Uno standard del team non è una persona che se ne intende: è un criterio scritto, che vale anche quando quella persona è in ferie. Le regole che ho applicato al mio sito le ho raccontate in [Un portfolio accessibile](/blog/portfolio-accessibile).

[[DA COMPLETARE: come entra l'accessibilità nel processo del team (definition of done, checklist in review, test con tastiera e screen reader, strumenti automatici) e da quando]]

[[DA COMPLETARE: perché hai voluto che l'accessibilità diventasse una competenza del team e non solo tua; come hai convinto il team (o i clienti) che fosse uno standard e non un extra; eventuali resistenze e come le hai gestite]]

> **Da provare.** Alla prossima review apri la funzionalità usando solo la tastiera: Tab, Maiusc+Tab, Invio, Esc. Se il focus sparisce o salta in un punto inatteso, hai trovato il primo bug di accessibilità.

## Cosa ho imparato

[[DA COMPLETARE: tre lezioni in prima persona, una o due frasi ciascuna, con il tuo tono (ad es. sul tempo, sulla fiducia, sullo scrivere le decisioni)]]

Se stai facendo lo stesso passaggio, da sviluppatore a chi guida sviluppatori, mi interessa sapere come lo stai gestendo. [Scrivimi](/#contatti).
