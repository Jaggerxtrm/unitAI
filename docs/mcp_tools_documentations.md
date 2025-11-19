---
date_created: Sunday, November 16th 2025, 1:47:53 pm
date_modified: Wednesday, November 19th 2025, 4:15:00 pm
---

# Documentazione MCP Tools

Questa guida è la Single Source of Truth per l’utilizzo degli strumenti MCP esposti da `unified-ai-mcp-tool`. Si concentra sui quattro strumenti principali (`ask-gemini`, `cursor-agent`, `droid`, `smart-workflows`) e sui servizi di supporto (deepwiki, context7, openmemory, serena).

---

## 1. Strumenti Principali (`unified-ai-mcp`)

### 1.1 ask-gemini
- **Scopo**: analisi architetturale, lettura di file lunghi, seconda opinione ad alta affidabilità.
- **Modelli**: `gemini-2.5-pro` (default), `gemini-2.5-flash`.
- **Parametri principali**: `prompt` (obbligatorio), `model`, `sandbox`.
- **Pattern consigliati**:
  - Lettura di documentazione o file >1k LOC.
  - Validazione architetturale prima di un merge.
  - Revisione testi (release note, design doc).
- **Esempio**:
  ```json
  {
    "prompt": "@docs/INTEGRATIONS.md Riassumi i punti critici e suggerisci miglioramenti",
    "model": "gemini-2.5-pro"
  }
  ```

### 1.2 cursor-agent
- **Scopo**: bug fixing, refactoring e patch chirurgiche usando i modelli GPT-5.x/Sonnet/Composer.
- **Installazione**: `npm install -g @cursorai/agent` + `export CURSOR_AGENT_TOKEN=<token>`.
- **Parametri principali**:
  - `prompt`: istruzioni testuali.
  - `model`: uno tra `gpt-5.1`, `gpt-5`, `composer-1`, `sonnet-4.5`, `haiku-5`, `deepseek-v3`.
  - `outputFormat`: `text`/`json`.
  - `projectRoot`: passato a `--cwd` per dare visibilità al repo.
  - `files`: lista di file allegati tramite `--file`.
  - `autoApprove`: abilita `--auto-approve` quando serve completa autonomia.
- **Best practice**:
  - Allegare solo i file necessari (max 5) per ridurre il contesto.
  - Usare `composer-1` per feedback rapidissimi, `gpt-5.1` per refactor critici.
  - In modalità `autoApprove=false`, Cursor chiede conferma per operazioni distruttive.
- **Esempio**:
  ```json
  {
    "prompt": "Analizza @src/workflows/parallel-review.workflow.ts e proponi un refactor modulare",
    "model": "sonnet-4.5",
    "files": ["src/workflows/parallel-review.workflow.ts"],
    "projectRoot": "/home/dawid/Projects/unified-ai-mcp-tool"
  }
  ```

### 1.3 droid
- **Scopo**: esecuzione agentica autonoma (GLM-4.6), generazione di checklist operative, auto-remediation.
- **Installazione**: `npm install -g @factoryai/droid-cli` + `export DROID_API_KEY=<token>`.
- **Parametri principali**:
  - `prompt`: istruzioni da passare a `droid exec`.
  - `auto`: `low` (analisi), `medium` (piani operativi), `high` (azioni aggressive).
  - `outputFormat`: `text`/`json`.
  - `sessionId`: permette di riprendere task multi-step.
  - `skipPermissionsUnsafe`: disponibile solo se il workflow ha `autonomyLevel=high`.
  - `files`, `cwd`: allegati e working directory.
- **Pattern consigliati**:
  - Generare checklist dopo un piano Cursor.
  - Creare remediation plan multi-step da integrare nei workflow (`auto-remediation`, `refactor-sprint`).
  - Richiedere `auto=medium` per ottenere azioni ragionate ma non distruttive.
- **Esempio**:
  ```json
  {
    "prompt": "Analizza i log allegati e crea un piano di fix in 5 step",
    "auto": "medium",
    "files": ["logs/system.log"],
    "outputFormat": "text"
  }
  ```

### 1.4 smart-workflows
- **Scopo**: orchestrare più backend (Gemini, Cursor, Droid, Serena, ecc.) seguendo pipeline predefinite.
- **Workflow attivi**: `parallel-review`, `pre-commit-validate`, `init-session`, `validate-last-commit`, `feature-design`, `bug-hunt`, `triangulated-review`, `auto-remediation`, `refactor-sprint`.
- **Parametri generali**:
  - `workflow`: nome del workflow.
  - `params`: oggetto con i parametri specifici (vedi `docs/WORKFLOWS.md`).
- **Quando usarli**:
  - Processi ripetitivi (pre-commit, bug hunt, review).
  - Task multi-fase (feature design, refactor sprint).
  - Validazioni autonome (auto-remediation, triangulated review).
- **Esempio**:
  ```json
  {
    "workflow": "triangulated-review",
    "params": {
      "files": ["src/utils/aiExecutor.ts"],
      "goal": "refactor"
    }
  }
  ```

---

## 2. Altri strumenti essenziali

| Tool | Scopo | Quando usarlo |
|------|-------|---------------|
| **deepwiki** | Accesso documentazione GitHub via MCP | Reverse engineering di repo esterni |
| **context7** | Documentazione di librerie/framework sempre aggiornata | Verifica API, parametri, versioni |
| **openmemory / memory-local** | Memorie persistenti (cloud + locale) | Salvare decisioni architetturali, playbook |
| **serena** | Navigazione simbolica e refactor sicuri | File >300 LOC, rename, impact analysis |

---

## 3. Pattern di utilizzo

### 3.1 Quick Matrix
| Scenario | Tool consigliato |
|----------|------------------|
| Lettura/analisi documenti lunghi | `ask-gemini` |
| Bug fixing chirurgico | `cursor-agent` |
| Piano operativo/autonomo | `droid` |
| Processi standard (review, pre-commit, bug) | `smart-workflows` |
| Ricerca semantica | `claude-context` |
| Navigazione simbolica | `serena` |

### 3.2 Flusso consigliato (bugfix complesso)
```
1. claude-context → individua file pertinenti
2. serena.find_referencing_symbols → impact analysis
3. cursor-agent → genera patch + test suggeriti
4. droid → checklist operativa / auto-remediation
5. smart-workflows.pre-commit-validate → verifica finale
```

### 3.3 Note operative
- Impostare `CURSOR_AGENT_TOKEN` e `DROID_API_KEY` nello stesso ambiente di `unified-ai-mcp`.
- Per workflow con `autonomyLevel=read-only`, Droid blocca `--skip-permissions-unsafe`.
- Allegare file reali (no glob) quando si usano `files`/`attachments`; Serena è più efficiente per grandi insiemi di file.
- Usa `ask-gemini` come “secondo parere” quando Cursor/Droid propongono cambi strutturali importanti.

---

## 4. Troubleshooting

| Sintomo | Tool | Soluzione |
|---------|------|-----------|
| `cursor-agent` restituisce errore di auth | Cursor | Verificare `CURSOR_AGENT_TOKEN` e login CLI |
| `droid` blocca `--skip-permissions-unsafe` | Droid | Alzare `autonomyLevel` del workflow o togliere il flag |
| Smart workflow si ferma su backend mancante | smart-workflows | Controllare installazione CLI e PATH |
| Output tronco/illeggibile | Tutti | Usa `outputFormat: "json"` o `sandbox` per log puliti |

---

## 5. Riferimenti rapidi
- Cursor Agent CLI docs: https://cursor.com/docs/cli/headless
- Factory Droid CLI docs: https://docs.factory.ai/cli/droid-exec/overview#droid-exec-headless-cli
- Gemini CLI docs: https://github.com/google-gemini/gemini-cli
- Serena (code navigation): https://github.com/oraios/serena

> Mantieni questo documento aggiornato quando introduci nuovi backend o cambi flussi approvati. Ogni sezione deve riflettere lo stato corrente del server MCP.
