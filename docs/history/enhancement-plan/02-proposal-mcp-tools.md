# Task 2 – MCP Tools Integration Proposal
**Versione:** 0.1  
**Stato:** Draft  
**Creato:** 2025-11-19  
**Aggiornato:** 2025-11-19  
**Autore:** GPT-5.1 Codex  
**Supersede:** _n/a (nuovo documento)_

---

## 1. Sintesi della ricerca obbligatoria
- **Serena**: confermata l'esigenza di mantenere l'accesso simbolico per ridurre il consumo di token; le nuove integrazioni devono rispettare il modello "Serena per il codice, agenti MCP per l'orchestrazione".
- **Claude Context**: rimane il canale principale per la ricerca semantica; i nuovi tool devono citare esplicitamente quando preferire una ricerca semantica rispetto ai nuovi agenti.
- **Cursor Agent Headless CLI**: supporta prompt singoli (`ask-cursor -p "..." --model <id> --output-format text`) con modelli multipli (GPT-5/5.1, composer-1, sonnet-4.5 ecc.) e modalità multi-step; richiede token Cursor (`CURSOR_AGENT_TOKEN`).
- **Factory Droid CLI**: `droid exec` con flag `--auto`, `--output-format`, `--skip-permissions-unsafe`; usa GLM-4.6 e sessioni riutilizzabili (`--session-id`).
- **Smart Workflows doc locale** (`docs/WORKFLOWS.md`) e `dist/src/workflows`: descrivono gli attuali sei workflow e l'uso parallelo di Qwen/Gemini/Rovodev.
- **.mcp.json**: oggi espone i server `claude-context`, `deepwiki`, `context7`, `unitAI`, `serena`, `openmemory`, `memory-local`. Non prevede ancora `ask-cursor` o `droid`.
- **Codice sorgente**: `src/tools/index.ts` registra `ask-qwen`, `ask-rovodev`, `ask-gemini`, `smart-workflows`; `src/utils/aiExecutor.ts` esegue i CLI attuali; `src/workflows/**` e `dist/workflows/**` orchestrano i backend; `docs/mcp_tools_documentations.md` contiene note preliminari su Cursor e Droid.

---

## 2. Stato attuale e gap
### 2.1 Configurazione MCP (`/.mcp.json`)
- Solo `unitAI` fornisce strumenti custom; gli altri server sono HTTP/stdio esterni.
- Nessun riferimento a CLI o env per Cursor/Droid → necessarie nuove variabili (`CURSOR_AGENT_TOKEN`, `DROID_API_KEY`, `DROID_DEFAULT_MODEL`, `DROID_AUTO_LEVEL`).

### 2.2 Tooling esistente (`src/tools`, `src/utils/aiExecutor.ts`)
- Tool manuali esposti: `ask-qwen`, `ask-rovodev`, `ask-gemini`, `smart-workflows`.
- `AIExecutionOptions` supporta flag Qwen/Gemini/Rovodev ma non parametri generici (file allegati, livello di autonomia, output JSON) richiesti da Cursor/Droid.
- Workflow e agenti continuano a invocare direttamente `BACKENDS.QWEN` e `BACKENDS.ROVODEV`; la rimozione dei tool manuali non impatta i workflow, ma la documentazione li utilizza come esempi principali.

---

## 3. Integrazione di `ask-cursor`
### 3.1 Requisiti di installazione
1. Dipendenza CLI: `npm install -g @cursorai/agent` (o uso `npx ask-cursor` per ambienti isolati).
2. Token: `export CURSOR_AGENT_TOKEN=<token>` (proveniente dal workspace Cursor).
3. Directory di lavoro: passare `--cwd /home/dawid/Projects/unitai` per consentire accesso al repo.
4. Modelli ammessi: `gpt-5.1`, `gpt-5`, `composer-1`, `sonnet-4.5`, `haiku-5`, `deepseek-v3`. Mappa da salvare in `AI_MODELS.CURSOR_AGENT`.

### 3.2 Wrapper MCP (codice)
1. **Costanti** (`src/constants.ts`):
   - Aggiungere `BACKENDS.CURSOR = "ask-cursor"`.
   - Definire `AI_MODELS.CURSOR_AGENT = {...}` e flag CLI (`CLI.FLAGS.CURSOR = { MODEL: "--model", OUTPUT: "--output-format", PROMPT: "-p", YT }`).
2. **Executor** (`src/utils/aiExecutor.ts`):
   - Nuova funzione `executeCursorAgentCLI` che invoca `ask-cursor` con:
     - `-p "<prompt>"`, `--model <model>`, `--output-format text|json`, `--cwd`, `--auto-approve` opzionale.
     - Supporto per allegati file (`--file @path`) sfruttando preparazione temporanea.
   - Estendere `executeAIClient` e `AIExecutionOptions` con campi `outputFormat`, `projectRoot`, `attachments`.
3. **Tool MCP** (`src/tools/ask-cursor.tool.ts`):
   - Schema Zod: `{ prompt: string; model?: enum; outputFormat?: "text"|"json"; projectRoot?: string; files?: string[]; autonomy?: "low"|"medium"|"high"; approvalMode?: "plan"|"default"|"auto" }`.
   - Progress logging coerente con `STATUS_MESSAGES`.
4. **Registrazione** (`src/tools/index.ts`): registrare il nuovo tool e rimuovere `ask-qwen/ask-rovodev`.
5. **Test**:
   - Nuovi unit test per la serializzazione dei parametri (`tests/unit/tools/ask-cursor.tool.test.ts`).
   - Mock di `executeCommand` per verificare i flag generati.

### 3.3 Schema di configurazione
- `.mcp.json` non necessita di un server separato: il tool viene esposto da `unitAI`.
- Aggiungere a `README`/`docs/INTEGRATIONS.md`:
  ```json
  {
    "env": {
      "CURSOR_AGENT_TOKEN": "..."
    },
    "cursorAgent": {
      "defaultModel": "gpt-5.1",
      "defaultOutputFormat": "text",
      "projectRoot": "/home/dawid/Projects/unitai"
    }
  }
  ```
- Prevedere fallback se il token manca: il tool deve restituire errore guidato ("Configura CURSOR_AGENT_TOKEN").

### 3.4 Pattern d'uso
- **Bug fixing e refactoring**: sfruttare i modelli `sonnet-4.5` o `composer-1` per generare patch dettagliate, poi validare con `smart-workflows`.
- **Second opinion**: usare `ask-cursor` in parallelo a `ask-gemini` per confronto (nuovo workflow "triangulation" sotto §6).
- **Token efficiency**: quando Serena individua un simbolo problematico, `ask-cursor` può proporre patch chirurgiche mantenendo il contesto minimo (passando file via `--file`).

---

## 4. Integrazione di `droid` (Factory Droid CLI)
### 4.1 Setup CLI e autenticazione
1. Installazione: `npm install -g @factoryai/droid-cli` (o `brew install factoryai/tap/droid` se disponibile).
2. Auth: `export DROID_API_KEY=<key>`.
3. Parametri principali:
   - `droid exec "<prompt>" --model glm-4.6 --output-format text`.
   - `--auto low|medium|high` per il grado di autonomia.
   - `--skip-permissions-unsafe` **solo** quando i permessi vengono già controllati a livello MCP.
   - `--session-id` per riprendere task multi-step.

### 4.2 Wrapper MCP
1. **Costanti**: `BACKENDS.DROID = "droid"`, `AI_MODELS.DROID = { PRIMARY: "glm-4.6" }`, `CLI.COMMANDS.DROID = "droid"`, `CLI.FLAGS.DROID = { EXEC: "exec", MODEL: "--model", AUTO: "--auto", OUTPUT: "--output-format", SESSION: "--session-id", SKIP_PERMISSIONS: "--skip-permissions-unsafe" }`.
2. **Executor**: nuova `executeDroidCLI` con gestione:
   - Timeout più lungo (15 minuti) per esecuzioni autonome.
   - Sanitizzazione del prompt (supporta newline).
   - Flag `--cwd` se il CLI lo supporta; in alternativa eseguire `process.chdir`.
   - Possibilità di passare `--file` generato temporaneamente per input corposi.
3. **Tool** (`src/tools/droid.tool.ts`):
   - Schema: `{ prompt: string; model?: enum; auto?: "low"|"medium"|"high"; outputFormat?: "text"|"json"; sessionId?: string; skipPermissionsUnsafe?: boolean }`.
   - Validazione: bloccare `skipPermissionsUnsafe` se il livello di autonomia del workflow è `read-only`.
   - Logging sul file `logs/workflow.log` per tracciare autonomia.
4. **Uso in agenti**:
   - `ImplementerAgent` può usare Droid come fallback quando Rovodev non è disponibile (nuova fallback chain in `AgentFactory`).
   - `smart-workflows` può delegare attività lunghe (es. `bug-hunt` step 2) a Droid con `auto=medium`.

### 4.3 Schema di configurazione
- Nuova sezione in `src/utils/config.ts` (se introdotta) o direttamente tramite `process.env`:
  - `DROID_BIN` (default `droid`), `DROID_DEFAULT_MODEL`, `DROID_DEFAULT_AUTO`.
- Documentare in `docs/mcp_tools_documentations.md` con esempi di export.

### 4.4 Pattern d'uso e interazione con altri tool
- **Agentic execution**: Droid è ideale per task multi-step (es. "analizza logs, trova root cause, proponi fix").
- **Fallback quando Serena non basta**: se `bug-hunt` non trova cause, un nuovo step può invocare Droid con `--auto=high` per esplorare ipotesi alternative.
- **Safety**: prevedere un wrapper che rimuove `--skip-permissions-unsafe` salvo quando il workflow è stato autorizzato via `PermissionManager` (`AutonomyLevel.HIGH`).

---

## 5. Piano di deprecazione per `ask-qwen` e `ask-rovodev`
### 5.1 Migrazione funzionale
1. **Manuale**: sostituire nelle guide (`CLAUDE.MD`, `docs/WORKFLOWS.md`, `docs/mcp_tools_documentations.md`) ogni riferimento a `ask-qwen/ask-rovodev` con:
   - `ask-cursor` (analisi + patch),
   - `droid` (esecuzioni autonome),
   - `ask-gemini` rimane per letture lunghe.
2. **Workflow**: aggiornare la tabella "Manual Patterns" in `CLAUDE.MD` con la nuova sequenza `Serena → claude-context → ask-cursor → smart-workflows`.

### 5.2 Cleanup checklist
1. Rimuovere file `src/tools/ask-qwen.tool.ts` e `ask-rovodev.tool.ts` + corrispondenti in `dist/tools`.
2. Aggiornare `src/tools/index.ts` per non registrarli.
3. Eliminare test/unit associati (o aggiornarli per i nuovi tool).
4. Aggiornare `docs/CHANGELOG.md` con voce "Removed ask-qwen/ask-rovodev (replaced by ask-cursor & droid)".
5. Validare `npm run build && npm run test`.

### 5.3 Migrazione dei workflow
- `TesterAgent` continuerà a usare Qwen tramite backend interno → nessun cambiamento immediato; documentare che il backend è considerato "internal" e non esposto come tool singolo.
- `ImplementerAgent` mantiene Rovodev come backend ma aggiunge Droid come fallback; per l'utente finale il nuovo strumento manuale è `ask-cursor`.
- `smart-workflows` dovrà esporre nei metadata quali backend sono stati usati (includendo Cursor/Droid) per trasparenza.

---

## 6. Piano di potenziamento di `smart-workflows`
### 6.1 Analisi stato attuale
- Sei workflow hard-coded con schema `smartWorkflowsSchema`.
- `parallel-review` usa Gemini + Rovodev; `pre-commit-validate` e `feature-design` orchestrano i tre agenti; logging con `structuredLogger`.
- Mancano:
  - Supporto per nuovi backend,
  - Parametri per autonomia e per allegare file,
  - Metriche di performance (solo log locale).

### 6.2 Modifiche proposte
1. **Schema esteso**:
   - Aggiungere `backendOverrides?: string[]`, `autonomyLevel?: "read-only"|"low"|"medium"|"high"`, `attachments?: string[]`.
   - Aggiornare `smartWorkflowsSchema` e `workflowSchemas`.
2. **Parallel Review 2.0**:
   - Pipeline a tre fasi: `Gemini (architettura)` → `CursorAgent (refactoring plan)` → `Droid (autonomous verification)`.
   - Parametri `focus` + `strategy` (es. `"double-check"` per eseguire due agenti con modelli diversi).
3. **Pre-commit Validate**:
   - `depth=paranoid` esegue Droid con `auto=low` per tentare fix automatici (solo suggerimenti, no modifiche dirette).
   - Logging dei token stimati tramite `tokenEstimator`.
4. **Bug Hunt**:
   - Step 2 (analisi) passa a `ask-cursor` per generare ipotesi multiple.
   - Step 3 può delegare a Droid per un "fix plan" multi-step.
5. **Feature Design**:
   - `ImplementerAgent` usa `ask-cursor` per generare patch di esempio se Rovodev e Droid falliscono.
   - Nuovo parametro `validationBackends` per scegliere se includere `ask-gemini`, `ask-cursor`, o `droid`.

### 6.3 Nuove idee di workflow
1. **`triangulated-review`**:
   - Input: `{ files: string[], goal: "bugfix" | "refactor" }`.
   - Esegue in sequenza `claude-context` (permi link), `ask-cursor`, `smart-workflows/parallel-review`.
   - Output: report comparativo + suggerimenti di merge.
2. **`auto-remediation`**:
   - Input: `{ symptoms: string, maxActions?: number }`.
   - Dà incarico a Droid (`auto=medium`) per proporre un piano, poi chiede conferma all'utente prima di eseguire patch con Serena.
3. **`refactor-sprint`**:
   - Coordina Serena per analisi simbolica + Cursor Agent per patch + `pre-commit-validate`.

### 6.4 Aggiornamenti tecnici trasversali
- Estrarre una `BackendCapabilitiesMap` per definire quali tool supportano `attachments`, `autonomy`, `multi-step`.
- Salvare i risultati dei workflow in `data/audit.sqlite` con nuova tabella `workflow_runs` (campi `id`, `workflow`, `backends`, `duration`, `success`, `token_estimate`).
- Aggiornare `docs/WORKFLOWS.md` con diagrammi delle nuove pipeline e casi d'uso.

---

## 7. Struttura di documentazione e best practices
| Documento | Aggiornamenti richiesti |
|-----------|-------------------------|
| `docs/mcp_tools_documentations.md` | Nuove sezioni dettagliate per `ask-cursor` e `droid` con esempi CLI, variabili d'ambiente, limiti noti. Rimuovere paragrafi su `ask-qwen/ask-rovodev`. |
| `docs/WORKFLOWS.md` | Aggiornare tabelle "Workflow Comparison" e "Manual Patterns" con i nuovi backend. Aggiungere i workflow proposti quando implementati. |
| `docs/INTEGRATIONS.md` | Sezione "MCP Servers" → descrivere come `unitAI` ora espone `ask-cursor` e `droid`. Aggiornare "Tool Selection Decision Tree". |
| `CLAUDE.MD` | Sezione 3 aggiornata: sostituire `ask-qwen/ask-rovodev` nei pattern; descrivere quando usare Cursor/Droid. |
| `README.md` principale | Breve nota nelle "Features" su nuovi tool e deprecazioni. |
| Nuova guida rapida (`docs/guides/cursor-droid-playbook.md`, previa approvazione) | Raccolta di snippet `mcp__unitAI__ask-cursor({...})` e `...droid({...})`. |

**Best practices da documentare:**
- Preferire `ask-cursor` per patch e refactor; usare `droid` per task generativi lunghi.
- Specificare `autonomyLevel` coerente con `PermissionManager`; vietare `--skip-permissions-unsafe` quando il workflow è `read-only`.
- Documentare trade-off di costo/token vs accuratezza, includendo una tabella comparativa (Gemini vs Cursor vs Droid).

---

## 8. Roadmap e rischi
### 8.1 Fasi proposte
1. **Fase A – Infrastruttura (2-3 giorni)**  
   - Aggiornare costanti/esecutori.  
   - Implementare nuovi tool + test.  
   - Aggiornare `.mcp.json` per le nuove variabili.
2. **Fase B – Deprecazione + Docs (1-2 giorni)**  
   - Rimuovere `ask-qwen/ask-rovodev`.  
   - Aggiornare documentazione e `CLAUDE.MD`.  
   - Pubblicare changelog.
3. **Fase C – Smart Workflows (3-4 giorni)**  
   - Refactoring schema.  
   - Integrazione backend cap-aware.  
   - Implementare nuovi workflow e test e2e (`tests/integration/workflows/*.ts`).

### 8.2 Rischi e mitigazioni
- **Assenza CLI**: se Cursor o Droid non sono installati, i tool devono fallire con messaggio d'errore chiaro e suggerire il comando di installazione.
- **Autonomia e permessi**: Droid può eseguire azioni pericolose; vincolare i flag in base al `PermissionManager` e loggare ogni richiesta `skip-permissions`.
- **Compatibilità backward**: mantenere `ask-gemini` finché i team non migrano; comunicare la deprecazione nella release note.
- **Tokens/costi**: aggiungere `src/utils/tokenEstimator.ts` per calcolare budget e mostrarlo nei log dei workflow.

### 8.3 Dipendenze
- Coordinarsi con Task 1 (Hook & Skills) per suggerimenti automatici dei nuovi tool.
- Eventuale Task 3 (moai-adk/OpenSpec) potrebbe aggiungere ulteriori backends; mantenere la nuova infrastruttura modulare.

---

## 9. Metriche di successo e validazione
- Tool `ask-cursor` e `droid` visibili in `mcp__unitAI__list-tools`.
- Tutti i workflow riportano i backend effettivamente usati nel report finale.
- Documentazione aggiornata + link funzionanti.
- Test automatizzati: nuove suite unit/integration verdi (incluso `tests/integration/workflows/pre-commit-validate.integration.ts` aggiornato per i backend extra).
- Rimozione completa di `ask-qwen` e `ask-rovodev` dal codice, dalle build `dist/` e dalla documentazione.

---

## 10. Prossimi passi immediati
1. Validare con i maintainer la roadmap sopra.
2. Iniziare Fase A implementando gli executor nuovi dietro flag (`ENABLE_CURSOR_AGENT`, `ENABLE_DROID`) per rollout graduale.
3. Aprire due issue di tracking:  
   - `feat: add ask-cursor MCP tool`  
   - `feat: add droid MCP tool + retire ask-qwen/ask-rovodev`.

