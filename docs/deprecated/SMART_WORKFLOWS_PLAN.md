# Piano di Sviluppo: Unified AI MCP Tool - Potenziamento per Claude Code

**Versione:** 1.0
**Data:** 2025-11-06

Questo documento delinea la visione strategica, l'architettura e il piano di sviluppo per il `unified-ai-mcp-tool`, concepito come un'estensione di orchestrazione intelligente per il tool CLI `claude-code`.

---

## 1. Visione Strategica

L'obiettivo è trasformare `claude-code` da un potente strumento CLI a un **orchestratore di agenti AI semi-autonomo**. Il `unified-ai-mcp-tool` funge da "sistema nervoso" e "braccio operativo", permettendo a Claude di delegare compiti complessi a un ecosistema di AI specializzate e strumenti di contesto, per poi riprendere il controllo per la validazione e l'implementazione finale.

---

## 2. Architettura del Sistema

Proponiamo un'architettura a più livelli che astrae la complessità e massimizza l'efficienza.

```
+------------------------------------------------+
| Livello 1: Interfaccia Utente (Claude Code CLI)|
| (Input manuale, validazione finale)            |
+----------------------+-------------------------+
                       |
+----------------------v-------------------------+
| Livello 2: Automazione (Hook + Skill Claude)   |
| (Intercetta l'intento, attiva la skill giusta) |
+----------------------+-------------------------+
                       |
+----------------------v-------------------------+
| Livello 3: Esecuzione (Skill -> unified-ai-mcp-tool) |
| (Chiama il nostro tool con parametri specifici)|
+----------------------+-------------------------+
                       |
+----------------------v-------------------------+
| Livello 4: Orchestrazione (Smart Workflows)    |
| (Seleziona strategie, permessi, AI e tool)     |
+------------------------------------------------+
```

---

## 3. Componenti Fondamentali e Loro Ruolo

### Client AI (Gli "Operai Specializzati")
- **`ask_gemini`**: Il "peso massimo". Ideale per analisi architetturali complesse, sicurezza, performance e refactoring su larga scala.
- **`ask_rovodev`**: Il "chirurgo". Preciso e affidabile per code quality, bug hunting e suggerimenti di codice mirati.
- **`ask_qwen`**: L'"esploratore rapido". Veloce ed economico per analisi preliminari, ricerche di codice e compiti a basso rischio.

### Strumenti di Contesto (La "Ricerca e Sviluppo")
- **`claude-context`**: Il "navigatore di codebase". Essenziale per la ricerca semantica *interna* al progetto. Risponde a "dove?" e "cosa è correlato?".
- **`context7`**: L'"esperto di API esterne". Fornisce documentazione API aggiornata per librerie di terze parti.
- **`deepwiki`**: Il "ricercatore architetturale". Fornisce insight strategici su repository open-source esterni.
- **`open-memory`**: La "memoria a lungo termine". Rende il sistema capace di apprendere, salvando e recuperando decisioni e risultati tra le sessioni.

---

## 4. Principi di Integrazione e Autonomia (Il "Sistema Nervoso")

Questa sezione descrive i meccanismi chiave che permetteranno a Claude Code di interagire con il `unified-ai-mcp-tool` in modo efficiente, proattivo e sicuro.

### 1. Skill Claude con Progressive Disclosure

La nostra interfaccia per Claude sarà una "Skill". La scoperta chiave dalla nostra analisi è che le skill monolitiche sono inefficienti. Adotteremo quindi un'architettura di **"Progressive Disclosure" (Rivelazione Progressiva)** a 3 livelli per massimizzare l'efficienza dei token e la reattività.

- **Livello 1: Metadati (Sempre Visibili)**
  - **Cosa**: Solo il frontmatter YAML del file `SKILL.md`, contenente `name` e `description`.
  - **Scopo**: La `description` è fondamentale. Deve essere scritta in modo tale da permettere a Claude di capire autonomamente quando la nostra skill è rilevante per la richiesta dell'utente, senza bisogno di caricarne il contenuto.

- **Livello 2: Mappa di Navigazione (`SKILL.md`)**
  - **Cosa**: Il corpo del file `SKILL.md`, mantenuto volutamente snello (sotto le 200-300 righe).
  - **Scopo**: Non contiene l'intera logica, ma agisce come una "mappa". Elenca le capacità (i nostri `smart-workflows`), ne descrive lo scopo ad alto livello e fornisce la sintassi di base, puntando a file di riferimento esterni per i dettagli.

- **Livello 3: Riferimenti Specifici (`ref/*.md`)**
  - **Cosa**: Una serie di file Markdown più piccoli e focalizzati (es. `ref/parallel-review.md`, `ref/init-session.md`).
  - **Scopo**: Contengono i dettagli granulari: tutti i parametri di un workflow, le `strategy` disponibili, esempi d'uso. Claude viene istruito dalla "mappa" a leggere questi file solo quando ha bisogno di eseguire un task specifico, caricando nel contesto solo le informazioni strettamente necessarie.

- **Azione Concreta**: Creare la directory `.claude/skills/unified-mcp/` con un `SKILL.md` principale e una sottodirectory `ref/` contenente la documentazione dettagliata per ogni workflow.

### 2. Hook e Attivazione Automatica (`skill-rules.json`)

Gli Hook sono il motore dell'automazione. Ci permettono di trasformare Claude da un esecutore passivo a un partner proattivo. Useremo due tipi principali di hook:

- **Hook Proattivo (`UserPromptSubmit`)**:
  - **Quando**: Si attiva *prima* che Claude elabori il prompt dell'utente.
  - **Scopo**: È il nostro "intercettore di intenti". Lo useremo per analizzare il testo del prompt. Se l'utente scrive "fai una review di questo file", l'hook lo rileva.
  - **Meccanismo**: L'hook consulta un file di configurazione centrale, `skill-rules.json`. Questo file JSON mappa pattern di testo, regex o percorsi di file a specifiche skill da attivare. Trovata una corrispondenza, l'hook inietta nel contesto di Claude un suggerimento per usare la nostra skill con i parametri già pronti.

- **Hook di Validazione (`Stop` o `PostToolUse`)**:
  - **Quando**: Si attiva *dopo* che il nostro `smart-workflow` ha terminato la sua esecuzione.
  - **Scopo**: È il nostro "controllore di qualità". Può eseguire azioni automatiche per validare il lavoro svolto, come lanciare un `npm run build` per verificare che non ci siano errori di compilazione, o eseguire un linter.
  - **Meccanismo**: Se la validazione fallisce, l'hook può notificare l'utente o, in scenari più avanzati, innescare un workflow di auto-correzione.

- **Azione Concreta**: Progettare e creare un `skill-rules.json` che definisca i trigger per i nostri workflow. Implementare uno script per l'hook `UserPromptSubmit` che usi queste regole per suggerire l'attivazione del `smart-workflows` tool.

### 3. Modello di Permessi Granulare (`--autonomy-level`)

Per consentire un'autonomia sicura, adotteremo un modello di permessi a più livelli ispirato a `droid exec`, controllato da un flag `--autonomy-level` passato ai nostri `smart-workflows`.

- **Concetto**: Ogni workflow, prima di eseguire un'operazione potenzialmente rischiosa (scrivere un file, eseguire `git commit`), controllerà il livello di autonomia con cui è stato invocato.

- **Livelli di Autonomia Dettagliati**:
  - **`read-only` (Default)**: Il livello più sicuro.
    - **Permette**: Lettura di file, `git status`, `git diff`, `git log`, `npm list`.
    - **Esempio d'uso**: Un'analisi preliminare del codice che non modifica nulla.
  - **`low`**: Permette modifiche sicure e locali ai file.
    - **Permette**: Tutto ciò che è `read-only` + scrittura/modifica di file all'interno della directory del progetto, formattazione del codice.
    - **Esempio d'uso**: Un workflow che aggiunge commenti al codice o corregge semplici typo.
  - **`medium`**: Abilita operazioni di sviluppo comuni con impatto locale.
    - **Permette**: Tutto ciò che è `low` + `npm install`, `pip install`, `git commit`, `git checkout`, `git branch`.
    - **Esempio d'uso**: Un workflow di refactoring che installa una nuova libreria e committa le modifiche su un nuovo branch.
  - **`high`**: Consente operazioni con impatto esterno e potenziale rischio.
    - **Permette**: Tutto ciò che è `medium` + `git push`, esposizione di porte, chiamate a API esterne che modificano stato.
    - **Esempio d'uso**: Un workflow di CI/CD che esegue il deploy automatico su un ambiente di staging dopo aver superato i test.

- **Azione Concreta**: Implementare una funzione di validazione (`checkPermission(level, requiredLevel)`) all'interno del nostro `commandExecutor` o in un utility condivisa. Ogni comando rischioso dovrà invocare questa funzione prima di procedere.

---

## 5. Idee Avanzate per il Futuro (La "Prossima Generazione")

### 1. Workflow di Auto-Correzione (Self-Healing)
- **Concetto**: Il sistema monitora i propri risultati e tenta di correggere autonomamente i fallimenti (es. errori di build post-refactoring).
- **Implementazione**: Tramite Hook `Stop` o `PostToolUse` che rilevano exit code di errore e lanciano workflow correttivi.

### 2. Generazione Dinamica di Workflow
- **Concetto**: Un'AI "master" genera al volo piani di esecuzione (workflow temporanei) per richieste utente complesse e non standard.
- **Implementazione**: Richiede un "meta-workflow" (`execute-dynamic-plan`) capace di interpretare ed eseguire una sequenza di comandi generata da un'altra AI.

### 3. Esecuzione Proattiva e Opportunistica
- **Concetto**: Il sistema agisce come un "guardiano", eseguendo periodicamente (es. via CI/CD) workflow di analisi per trovare "code smells", vulnerabilità o altre opportunità di miglioramento.
- **Implementazione**: Integrazione con sistemi esterni come GitHub Actions e creazione di workflow specifici (`codebase-health-check`).

### 4. Dibattito e Sintesi Multi-Agente
- **Concetto**: Per decisioni critiche, il sistema orchestra un "dibattito" tra i modelli AI, facendoli criticare e migliorare a vicenda le rispettive analisi prima di produrre una sintesi finale.
- **Implementazione**: Un nuovo `smart-workflow` sequenziale che gestisce il flusso di una conversazione tra modelli AI.

---

## 6. Piano d'Azione Immediato

Per iniziare a concretizzare questa visione, i prossimi passi sono:

#### Passo 1: Implementare la Selezione Dinamica dei Modelli
- **Obiettivo**: Finalizzare l'approccio ibrido (`strategy` + `backends`) nel workflow `parallel-review` e generalizzarlo agli altri.
- **Stato**: Bozza concettuale già definita.

#### Passo 2: Progettare il Modello di Permessi
- **Obiettivo**: Definire formalmente i livelli di autonomia (`read-only`, `low`, `medium`, `high`) e progettare come i workflow verificheranno questi permessi.
- **Stato**: Idea concettuale basata su `droid exec`.

#### Passo 3: Creare la Bozza della Skill Claude
- **Obiettivo**: Scrivere la prima versione del file `SKILL.md` per il nostro tool, seguendo il principio di "Progressive Disclosure".
- **Stato**: Da iniziare.