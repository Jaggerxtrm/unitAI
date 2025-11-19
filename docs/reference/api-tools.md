# API Reference: Base Tools

**Version:** 1.2  
**Last Updated:** 2025-11-19  
**Status:** Production Ready

Questa guida descrive i tre tool MCP esposti da `unified-ai-mcp-tool`:

- `ask-gemini` – analisi profonda e lettura documentazione
- `cursor-agent` – refactor, bug fixing e patch chirurgiche
- `droid` – task agentici/autonomi e piani di remediation

---

## Table of Contents

- [ask-gemini](#ask-gemini)
- [cursor-agent](#cursor-agent)
- [droid](#droid)
- [File Reference Syntax](#file-reference-syntax)

---

## ask-gemini

Query Google Gemini CLI con supporto per file multipli e contesti estesi.

### Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| prompt | string | Yes | - | Testo della richiesta. Usa `@file` per includere file |
| model | string | No | gemini-2.5-pro | `gemini-2.5-pro` o `gemini-2.5-flash` |
| sandbox | boolean | No | false | Esegue il prompt in sandbox locale |

### Models

| Model | Context Window | Speed | Use Case |
|-------|----------------|-------|----------|
| gemini-2.5-pro | ~2M token | Medio | Analisi architetturali, documenti lunghi |
| gemini-2.5-flash | ~1M token | Veloce | QA rapida, review leggere |

### Return Value

```typescript
{
  output: string,
  success: boolean,
  error?: string
}
```

### Examples

```json
{
  "prompt": "@docs/WORKFLOWS.md Riassumi come funziona il workflow parallel-review",
  "model": "gemini-2.5-pro"
}
```

```json
{
  "prompt": "@README.md Elenca i prerequisiti di installazione",
  "model": "gemini-2.5-flash",
  "sandbox": false
}
```

### Best Practices

- Preferisci `gemini-2.5-pro` per analisi >1k LOC; usa `flash` per feedback veloci.
- Quando referenzi molti file, fornisci istruzioni precise per evitare contesti inutili.
- Usa `sandbox` se vuoi che Gemini esegua script/command nelle VM isolate del CLI.

---

## cursor-agent

Invoca il Cursor Agent Headless CLI con modelli GPT-5.x/Sonnet/Composer. Ideale per refactor e proposte di patch.

### Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| prompt | string | Yes | - | Richiesta principale |
| model | string | No | gpt-5.1 | Uno dei modelli supportati (gpt-5.1, gpt-5, composer-1, sonnet-4.5, haiku-5, deepseek-v3) |
| outputFormat | "text"\|"json" | No | text | Formato di output |
| projectRoot | string | No | cwd | Passato a `--cwd` per dare visibilità al repo |
| files | string[] | No | [] | File allegati (equivale a `--file <path>`) |
| autoApprove | boolean | No | false | Abilita `--auto-approve` |
| autonomyLevel | string | No | - | Metadata informativo (restituito nei log) |

### Return Value

```typescript
{
  output: string,
  success: boolean,
  error?: string
}
```

### Examples

```json
{
  "prompt": "Analizza @src/utils/aiExecutor.ts e proponi un refactor per separare i backend",
  "model": "sonnet-4.5",
  "files": ["src/utils/aiExecutor.ts"],
  "projectRoot": "/home/dawid/Projects/unified-ai-mcp-tool"
}
```

```json
{
  "prompt": "Genera una checklist di bugfix per il modulo workflow",
  "model": "composer-1",
  "outputFormat": "json",
  "autoApprove": true
}
```

### Best Practices

- Allegare solo i file indispensabili (max 5) riduce il consumo di token.
- Usa `composer-1` per iterazioni veloci, `gpt-5.1` per refactor critici.
- Imposta `projectRoot` sul workspace corrente per permettere al CLI di risolvere percorsi relativi.

---

## droid

Interfaccia con il Factory Droid CLI (`droid exec`) basato su GLM-4.6. Ideale per task agentici, auto-remediation, checklist operative.

### Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| prompt | string | Yes | - | Prompt principale |
| auto | "low"\|"medium"\|"high" | No | low | Livello di autonomia (`--auto`) |
| outputFormat | "text"\|"json" | No | text | Formato output |
| sessionId | string | No | - | Continua una sessione esistente |
| skipPermissionsUnsafe | boolean | No | false | Passa `--skip-permissions-unsafe` (richiede autonomyLevel=high nel workflow) |
| files | string[] | No | [] | Allegati passati con `--file` |
| cwd | string | No | - | Directory di lavoro (`--cwd`) |

### Autonomy Levels

| Level | Descrizione |
|-------|-------------|
| low | Analisi descrittive, nessuna azione distruttiva |
| medium | Genera checklist/piani operativi dettagliati |
| high | Può proporre azioni aggressive (richiede permessi elevati) |

### Examples

```json
{
  "prompt": "Crea un piano di remediation in 5 step per errori 500 su upload",
  "auto": "medium",
  "files": ["logs/upload-error.log"],
  "outputFormat": "text"
}
```

```json
{
  "prompt": "Continua l'analisi della sessione precedente e verifica i nuovi log",
  "sessionId": "session-123",
  "auto": "low",
  "cwd": "/home/dawid/Projects/unified-ai-mcp-tool"
}
```

### Best Practices

- Imposta `auto=low` per ottenere checklist conservative; `medium` solo quando hai già compreso il contesto.
- Usa `skipPermissionsUnsafe` esclusivamente in workflow con `autonomyLevel=high`.
- Allegare file (log, diff, report) aumenta drasticamente la qualità del piano di remediation.

---

## File Reference Syntax

Tutti i tool accettano i riferimenti file di Claude (`@path`, `#path`). Alcuni tool (Cursor e Droid) supportano anche il flag `--file` con percorsi assoluti.

| Sintassi | Descrizione | Esempio |
|----------|-------------|---------|
| `@file` | Include il contenuto del file | `@src/utils/logger.ts` |
| `@dir/` | Include tutti i file nella directory | `@src/workflows/` |
| `#file` | Alias alternativo (supportato da Gemini) | `#README.md` |

**Suggerimenti:**
- Referenzia solo i file necessari per evitare limiti di contesto.
- Per file molto grandi (>1k LOC) combina Serena (`find_symbol`, `get_symbols_overview`) con i riferimenti diretti.
- Quando usi `files`/`attachments` con Cursor o Droid, passa percorsi assoluti o relativi al `projectRoot`.

---

## See Also

- [Workflow API Reference](./api-workflows.md)
- [Integrations Guide](../INTEGRATIONS.md)
- [MCP Tools Documentation](../mcp_tools_documentations.md)

