# Cursor & Droid Playbook

**Versione:** 0.1  
**Creato:** 2025-11-19  
**Aggiornato:** 2025-11-19  
**Stato:** Draft operativo

Guida rapida per utilizzare `cursor-agent` e `droid` in combinazione con Serena, claude-context e smart-workflows.

---

## 1. Prerequisiti

1. Installare i CLI:
   ```bash
   npm install -g @cursorai/agent
   npm install -g @factoryai/droid-cli
   ```
2. Esportare i token:
   ```bash
   export CURSOR_AGENT_TOKEN="<token_cursor>"
   export DROID_API_KEY="<token_droid>"
   ```
3. Impostare il `projectRoot` su `/home/dawid/Projects/unified-ai-mcp-tool` per dare al CLI visibilità sul repo.

---

## 2. Pattern veloci

### 2.1 Bugfix chirurgico
```
1. claude-context → “Find usages of broken function”
2. Serena → find_referencing_symbols + get_symbols_overview
3. cursor-agent → prompt: "@file Fix logic + add regression test"
4. droid (auto=low) → creare checklist di validazione
5. smart-workflows.pre-commit-validate(depth="thorough")
```

### 2.2 Refactor sprint
```
1. Serena → identificare simboli da refactorizzare
2. cursor-agent (model: sonnet-4.5) → piano + patch suggestive
3. ask-gemini → validation architetturale (opzionale se serve seconda opinione)
4. droid (auto=medium) → checklist operativa
5. smart-workflows.refactor-sprint → consolidare output
```

### 2.3 Incident / remediation
```
1. Raccogliere log con Serena/grep
2. ask-gemini → sintetizzare i sintomi
3. droid (auto=medium, files=logs) → generare piano maxActions=5
4. cursor-agent → applicare i passi più critici (patch chirurgiche)
5. smart-workflows.auto-remediation → salvare il report finale
```

---

## 3. Prompt library

### Cursor Agent
- **Refactor Plan**
  ```
  "prompt": "Stai preparando un refactor {depth}. File coinvolti:\n${files}\nGenera piano step-by-step + patch suggerite + test.",
  "model": "sonnet-4.5",
  "files": [...],
  "projectRoot": "/home/dawid/Projects/unified-ai-mcp-tool"
  ```
- **Patch chirurgica**
  ```
  "prompt": "@src/utils/aiExecutor.ts Fix fallback handling for cursor/droid. Mantieni gli stessi log.",
  "model": "gpt-5.1"
  ```

### Droid
- **Checklist remediation**
  ```
  "prompt": "Sintomi: ${symptoms}\nGenera un piano in ${maxActions} passi. Ogni step = azione, output atteso, metriche, rischi.",
  "auto": "medium",
  "files": ["logs/error.log"],
  "outputFormat": "text"
  ```
- **Session continuation**
  ```
  "prompt": "Riprendi la sessione e valida i nuovi log allegati",
  "sessionId": "session-42",
  "auto": "low",
  "files": ["logs/new.log"]
  ```

---

## 4. Do & Don't

**Do**
- Allegare max 5 file per chiamata Cursor/Droid.
- Usare `autoApprove=false` finché non si è certi delle azioni da applicare.
- Integrare sempre Serena/claude-context per ridurre il contesto passato ai CLI.
- Salvare il report finale in openmemory quando il pattern funziona.

**Don't**
- Non usare `--skip-permissions-unsafe` se il workflow è `read-only`.
- Non lanciare Droid con `auto=high` senza avere un piano di rollback.
- Non duplicare prompt troppo generici: specificare sempre sintomi/goal.

---

## 5. Checklist finale

| Scenario | Sequenza consigliata |
|----------|----------------------|
| Bugfix critico | Serena → cursor-agent → droid → pre-commit-validate |
| Refactor multi-file | claude-context → cursor-agent → smart-workflows.refactor-sprint |
| Incident / outage | ask-gemini → droid.auto-remediation → cursor-agent (patch) → validate-last-commit |

Aggiorna questo playbook ogni volta che trovi pattern efficaci (aggiungi esempi reali e link a PR/commit).

