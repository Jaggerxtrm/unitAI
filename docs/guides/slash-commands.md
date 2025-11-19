# Guida Comandi Slash

**Version:** 1.0
**Data:** 19 novembre 2025
**Status:** Production Ready

Questa guida fornisce documentazione completa per i comandi slash personalizzati implementati nel progetto unified-ai-mcp-tool.

## Indice

- [Introduzione](#introduzione)
- [Comandi Disponibili](#comandi-disponibili)
- [Esempi di Utilizzo](#esempi-di-utilizzo)
- [Integrazione con Workflow](#integrazione-con-workflow)
- [Sicurezza e Best Practices](#sicurezza-e-best-practices)
- [Risoluzione Problemi](#risoluzione-problemi)

## Introduzione

I comandi slash forniscono un'interfaccia semplificata per eseguire task comuni di sviluppo, integrandosi con i workflow esistenti e garantendo sicurezza e consistenza.

### Principi di Design

- **Sicurezza First**: I comandi rispettano le policy di sicurezza del progetto
- **Workflow Integration**: Utilizzo diretto dei workflow MCP esistenti
- **User Experience**: Sintassi semplice e suggerimenti automatici
- **Error Recovery**: Gestione errori chiara con suggerimenti di recovery

## Comandi Disponibili

### `/init-session` - Inizializzazione Sessione

Inizializza una nuova sessione di lavoro con analisi automatica del contesto progetto.

```bash
/init-session [opzioni]
```

**Opzioni:**
- `--deep`: Analisi più approfondita (backend Gemini prioritario)
- `--no-memory`: Salta suggerimenti automatici di ricerca memoria

**Output:** Report completo con stato repository, commit recenti, analisi AI e suggerimenti memoria.

**Tempo esecuzione:** 15-30 secondi

---

### `/save-commit` - Salvataggio Sicuro

Salva lavoro stabile con validazione automatica, memoria e commit.

```bash
/save-commit "messaggio commit" [opzioni]
```

**Opzioni:**
- `--force`: Forza commit senza validazione (⚠️ sconsigliato)
- `--no-cloud`: Salta salvataggio memoria cloud
- `--tag "tag"`: Aggiunge tag personalizzato alla memoria

**Workflow di Sicurezza:**
1. ✅ **Validazione** codice stabile
2. 💾 **Memoria** salvata (locale + cloud)
3. 📝 **Commit** creato con messaggio

**Importante:** La memoria viene salvata **solo dopo** conferma stabilità codice.

---

### `/ai-task` - Esecuzione Workflow AI

Esegue workflow unified-ai-mcp con interfaccia semplificata.

```bash
/ai-task <sottocomando> [parametri]
```

**Sottocomandi:**

#### Lista Workflow
```bash
/ai-task list
```
Mostra tutti i workflow disponibili con descrizioni e durate.

#### Esecuzione Workflow
```bash
/ai-task run <nome-workflow> [parametri]
```

**Workflow Disponibili:**

| Workflow | Comando | Scopo |
|----------|---------|-------|
| `pre-commit-validate` | `/ai-task run pre-commit-validate --depth thorough` | Validazione qualità codice |
| `parallel-review` | `/ai-task run parallel-review --files "src/**/*.ts"` | Review codice parallelo |
| `bug-hunt` | `/ai-task run bug-hunt --symptoms "descrizione bug"` | Investigazione bug |
| `feature-design` | `/ai-task run feature-design --featureDescription "..."` | Design feature |
| `validate-last-commit` | `/ai-task run validate-last-commit` | Validazione post-commit |

---

### `/create-spec` - Creazione Specifiche

Genera documenti di specifica strutturati per nuove feature.

```bash
/create-spec "descrizione feature" [opzioni]
```

**Opzioni:**
- `--template "tipo"`: Tipo template (api, ui, db, full)
- `--with-design`: Include analisi architetturale
- `--output "path"`: Percorso salvataggio custom

**Template Disponibili:**
- `api`: Specifiche API endpoint
- `ui`: Design componenti UI
- `db`: Schema database e migrazioni
- `full`: Specifica completa (default)

**Output:** File Markdown strutturato in `docs/specs/`

---

### `/check-docs` - Ricerca Documentazione

Ricerca documentazione across multiple sorgenti con selezione intelligente.

```bash
/check-docs <topic> [sorgente]
```

**Sorgenti Disponibili:**
- `local`: Documentazione progetto
- `context7`: Librerie esterne (React, Node.js, etc.)
- `deepwiki`: Repository GitHub
- `all`: Tutte le sorgenti
- `auto`: Selezione automatica (default)

**Esempi:**
```bash
/check-docs react useCallback           # context7
/check-docs mcp-setup local            # documentazione progetto
/check-docs facebook/react deepwiki    # repository GitHub
/check-docs typescript all             # ricerca completa
```

---

### `/help` - Aiuto Comandi

Mostra questa guida di aiuto.

```bash
/help [comando]
```

**Esempi:**
```bash
/help              # Mostra tutti i comandi
/help save-commit  # Aiuto specifico per save-commit
```

## Esempi di Utilizzo

### Scenario: Inizio Lavoro
```bash
/init-session --deep
```
→ Analizza repository, mostra commit recenti, suggerisce ricerche memoria rilevanti.

### Scenario: Completamento Feature
```bash
/save-commit "feat: Implementare autenticazione OAuth"
```
→ Valida codice, salva memoria, crea commit sicuro.

### Scenario: Review Codice
```bash
/ai-task run parallel-review --files "src/auth/*.ts" --focus security
```
→ Review parallelo con Gemini + Rovodev focalizzato su sicurezza.

### Scenario: Nuovo Componente
```bash
/create-spec "Componente modale riutilizzabile" --template ui --with-design
```
→ Genera specifica UI con analisi architetturale.

### Scenario: Risoluzione Bug
```bash
/ai-task run bug-hunt --symptoms "Errore 500 upload file >10MB"
```
→ Analizza automaticamente file rilevanti, identifica causa radice, propone fix.

## Integrazione con Workflow

### Workflow Utilizzati

| Comando Slash | Workflow MCP | Scopo |
|---------------|--------------|-------|
| `/init-session` | `init-session` | Analisi stato repository + AI |
| `/save-commit` | `pre-commit-validate` | Validazione qualità codice |
| `/ai-task run X` | `X` (dinamico) | Esecuzione workflow specifico |
| `/create-spec` | `feature-design` (opzionale) | Analisi architetturale |
| `/check-docs` | context7/deepwiki/local | Ricerca documentazione |

### Backend Mapping

- **Gemini**: Analisi architetturale, ragionamento profondo
- **Qwen**: Controllo qualità, pattern recognition
- **Rovodev**: Generazione codice produzione, fix pratici

## Sicurezza e Best Practices

### Principio Fondamentale
> **La memoria viene salvata solo quando il codice è STABILE e FUNZIONANTE**

### Validazione Automatica
- Test esecuzione (se disponibili)
- Code quality checks
- Security scanning
- Breaking changes detection

### Recovery da Errori
- **Validazione fallita**: Mostra problemi specifici con suggerimenti fix
- **Memory save fallito**: Rollback operazioni precedenti
- **Commit fallito**: Preserva stato memoria, suggerisce retry

### Best Practices

#### Commit Sicuri
```bash
# ✅ CORRETTO: Lascia validare il comando
/save-commit "feat: Add new authentication"

# ❌ SBAGLIATO: Forza senza validazione
/save-commit "feat: Add new authentication" --force
```

#### Ricerche Memoria
```bash
# ✅ CORRETTO: Utilizza suggerimenti automatici
/init-session

# ✅ CORRETTO: Ricerca mirata
/check-docs react hooks context7
```

## Risoluzione Problemi

### Comando Non Riconosciuto
```
❌ Comando slash sconosciuto: /unknown
```
**Soluzione:** Usa `/help` per vedere comandi disponibili.

### Validazione Fallita
```
❌ Codice non stabile. Problemi trovati:
- Lint errors in src/auth.ts
- Missing test coverage
```
**Soluzione:** Fix problemi mostrati, poi retry comando.

### Workflow Timeout
```
❌ Timeout esecuzione workflow
```
**Soluzione:** Riduci scope (meno file) o usa profondità `quick`.

### Memoria Non Salvata
```
❌ Errore salvataggio memoria
```
**Soluzione:** Check connessione, retry senza `--no-cloud`.

### Documentazione Non Trovata
```
Nessun risultato trovato per "topic"
```
**Soluzione:** Prova sorgente diversa o usa `/check-docs topic all`.

## Performance

### Tempi Esecuzione Tipici

| Comando | Tempo | Note |
|---------|-------|------|
| `/init-session` | 15-30s | Include analisi AI completa |
| `/save-commit` | 10-45s | Include validazione completa |
| `/ai-task run` | 5-90s | Dipende dal workflow |
| `/create-spec` | 2-30s | Include analisi se `--with-design` |
| `/check-docs` | 1-15s | Cached per 1 ora |

### Ottimizzazioni

- **Caching**: Risultati workflow cachati per 1 ora
- **Parallelismo**: Esecuzione parallela dove possibile
- **Selezione Intelligente**: Backend appropriati per task

## Supporto e Manutenzione

### Aggiornamenti
I comandi vengono aggiornati automaticamente con i workflow MCP.

### Debug
Usa `/help` per sintassi corrente e opzioni disponibili.

### Feedback
Segnala problemi o suggerisci miglioramenti nei commit message.

---

**Documentazione Version:** 1.0
**Implementazione:** Completa ✅
**Testing:** In corso 🔄
**Status:** Production Ready
