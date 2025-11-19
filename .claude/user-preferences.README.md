# User Preferences Configuration

Questo file permette di personalizzare il comportamento degli hooks e delle skills di Claude Code.

## File di Configurazione

**Posizione**: `.claude/user-preferences.json`

**Formato**: JSON con commenti supportati tramite `$comment`

## Opzioni Disponibili

### suppressReminders

Controlla quali reminder hooks devono essere soppressi:

```json
"suppressReminders": {
  "claude-context": false,      // Reminder per usare claude-context
  "serena": false,               // Reminder per usare Serena
  "memory-search": false,        // Reminder per cercare memories
  "workflow-suggestions": false, // Suggerimenti workflow
  "token-efficiency": false      // Warning efficienza token
}
```

**Valori**: `true` (soppresso) o `false` (attivo)

### experienceLevel

Controlla la verbosità dei messaggi:

```json
"experienceLevel": "intermediate"
```

**Opzioni**:
- `"beginner"`: Messaggi dettagliati con spiegazioni complete
- `"intermediate"`: Messaggi bilanciati (default)
- `"expert"`: Messaggi concisi, solo informazioni essenziali

**Effetti**:
- Beginner: Messaggi completi con esempi
- Intermediate: Messaggi standard
- Expert: Solo nome tool/comando suggerito, nessuna spiegazione

### throttling

Sovrascrive i periodi di cooldown predefiniti (in secondi):

```json
"throttling": {
  "claude-context-reminder": 300,      // 5 minuti (default)
  "workflow-pattern-detector": 600,    // 10 minuti (default)
  "smart-tool-enforcer": 0             // Nessun throttling (default)
}
```

**Valori**: Secondi di cooldown. 0 = nessun throttling.

**Uso**:
- Aumenta il valore per ridurre la frequenza dei reminder
- Diminuisci per reminder più frequenti
- Imposta a 0 per disabilitare throttling (mostra sempre)

### thresholds

Sovrascrive le soglie predefinite per smart-tool-enforcer:

```json
"thresholds": {
  "maxFileSizeLines": 500,         // Soglia per warning
  "warnFileSizeLines": 200,        // Soglia per suggerimento
  "complexityMultiplier": 1.0      // Moltiplicatore complessità
}
```

**Parametri**:
- `maxFileSizeLines`: Linee oltre le quali viene mostrato warning forte
- `warnFileSizeLines`: Linee oltre le quali viene mostrato suggerimento
- `complexityMultiplier`: Fattore che influenza il calcolo della complessità (1.0 = default, >1.0 = più sensibile, <1.0 = meno sensibile)

### skills

Preferenze specifiche per le skills:

```json
"skills": {
  "enableFileTriggering": true,
  "minimumConfidence": {
    "critical": 0.7,   // Skill critiche mostrate con confidence >= 70%
    "high": 0.8,       // Skill high mostrate con confidence >= 80%
    "medium": 0.85,    // Skill medium mostrate con confidence >= 85%
    "low": 0.9         // Skill low mostrate solo con confidence >= 90%
  }
}
```

**Parametri**:
- `enableFileTriggering`: Attiva/disattiva activation basata su file context
- `minimumConfidence`: Confidence minima per priority level (0.0 - 1.0)

### output

Controllo del formato output:

```json
"output": {
  "compactMessages": false,    // Messaggi compatti vs dettagliati
  "useEmoji": true,            // Usa emoji nei messaggi
  "showTokenSavings": true     // Mostra calcolo risparmi token
}
```

## Esempi di Configurazione

### Power User (Minimal Noise)

```json
{
  "suppressReminders": {
    "claude-context": false,
    "serena": false,
    "memory-search": true,
    "workflow-suggestions": true,
    "token-efficiency": false
  },
  "experienceLevel": "expert",
  "throttling": {
    "claude-context-reminder": 600,
    "workflow-pattern-detector": 1800
  },
  "output": {
    "compactMessages": true,
    "useEmoji": false,
    "showTokenSavings": false
  }
}
```

### Beginner (Maximum Guidance)

```json
{
  "suppressReminders": {
    "claude-context": false,
    "serena": false,
    "memory-search": false,
    "workflow-suggestions": false,
    "token-efficiency": false
  },
  "experienceLevel": "beginner",
  "throttling": {
    "claude-context-reminder": 120,
    "workflow-pattern-detector": 300
  },
  "output": {
    "compactMessages": false,
    "useEmoji": true,
    "showTokenSavings": true
  }
}
```

### Token Conscious (Focus on Efficiency)

```json
{
  "suppressReminders": {
    "claude-context": false,
    "serena": false,
    "memory-search": true,
    "workflow-suggestions": true,
    "token-efficiency": false
  },
  "experienceLevel": "intermediate",
  "thresholds": {
    "maxFileSizeLines": 300,
    "warnFileSizeLines": 150,
    "complexityMultiplier": 1.2
  },
  "output": {
    "showTokenSavings": true
  }
}
```

## Note

- Modifiche al file hanno effetto dalla prossima invocazione dell'hook
- Se il file non esiste, vengono usati i valori predefiniti
- Valori non specificati usano i default
- Il file è locale al progetto (non committato in git)
- Per configurazione globale, crea `~/.claude/user-preferences.json`

## Troubleshooting

**Problema**: Le modifiche non hanno effetto  
**Soluzione**: Verifica che il file sia JSON valido (usa un linter JSON)

**Problema**: Non so quale valore impostare  
**Soluzione**: Inizia con i default, poi aggiusta in base all'esperienza

**Problema**: Voglio disabilitare completamente un hook  
**Soluzione**: Imposta il corrispondente `suppressReminders` a `true`

