# aggiustamento sistema workflow, skills, hooks, mcp

## 1) 
Il sistema di hooks deve risultare meno restrittivo e più flessibile. Favorire uno stile più libero e meno vincolante. Deve comunque trovare uno sweet-spot suggerendo e guidando claude nell'uso dei tool ricordandogli di usare:
    - serena per retrieval di codice senza leggere interi file e sprecando token inutilmente (evitare dunque che legga file di 1000 LOC per capire una piccola modifica). DOCUMENTAZIONE: https://github.com/oraios/serena
    - claude-context per effettuare ricerche sulla repository con ricerca semantica, come primo approccio per capire il contesto e le relazioni tra i file. DOCUMENTAZIONE: https://github.com/zilliztech/claude-context
    - Usare unified-ai-mcp per task agentiche complesse, nello specifico:
        - ask-gemini per leggere interi file, particolarmente lunghi, cartelle e codebase in generale. Ottimo come seconda opinione per capire se una modifica è necessaria (evita over-engineering).
        - cursor-agent (integrato): agente multi-modello (GPT-5.1, Sonnet, Composer) per bugfix e refactor guidati. DOCUMENTAZIONE: https://cursor.com/docs/cli/headless
        - droid (integrato): GLM-4.6 via Factory Droid CLI per checklist e remediation autonome. DOCUMENTAZIONE: https://docs.factory.ai/cli/droid-exec/overview#droid-exec-headless-cli 
        - (Deprecato) ask-qwen / ask-rovodev → usare cursor-agent + droid come sostituti.
        - smart-workflows, strumenti predefiniti potenti per task agentiche complesse. `dist/workflows` è già integrato ma deve essere mantenuto allineato alla roadmap.
    - deepwiki per accedere a github per documentazioni specifiche e ricerca semantica.
    - context7 per ricerca documentazioni su librerie, pacchetti e framework specifiche, sempre aggiornate per colmare la conoscenza outdated dei modelli.
    - openmemory-cloud per accedere a memories salvate in remoto/cloud, per evitare di perdere memoria tra sessioni. I tools sono semplici, va utilizzato anche quando si incappa in un problema, oppure per vedere come una funzione o refactoring o altro modulo è stato implementato in passato. Memories vanno aggiunto al termine di un task, una volta CONFERMATO CHE IL CODICE FUNZIONA E È STABILE.
    - openmemory per accedere a memories salvate localmente, per evitare di perdere memoria tra sessioni. I tools sono semplici, va utilizzato anche quando si incappa in un problema, oppure per vedere come una funzione o refactoring o altro modulo è stato implementato in passato. Memories vanno aggiunto al termine di un task, una volta CONFERMATO CHE IL CODICE FUNZIONA E È STABILE. A differenza della versione cloud, è possibile rinforzare memories, dargli più peso e importanza. 
    - anche serena permette di salvare memories.
- vanno compresi hooks in modo molto approfondito DOCUMENTAZIONE: https://code.claude.com/docs/en/hooks-guide
- vanno comprese skills in modo approfondito DOCUMENTAZIONE: https://code.claude.com/docs/en/skills
    - esempi specifici: https://www.reddit.com/r/ClaudeAI/comments/1opxgq4/i_was_wrong_about_agent_skills_and_how_i_refactor/ , https://github.com/mrgoonie/claudekit-skills/tree/main/.claude/skills/devops , https://github.com/diet103/claude-code-infrastructure-showcase , https://www.reddit.com/r/ClaudeAI/comments/1oivjvm/claude_code_is_a_beast_tips_from_6_months_of/

# DA ESPLORARE E COMPRENDERE PER INTEGRARE NEL SISTEMA
Questi due sembrano molto potenti.
- https://github.com/modu-ai/moai-adk 
- https://github.com/Fission-AI/OpenSpec

Voglio slash-commands custom per invocare l'uso di certi tools in modo semplice, quelli ripetitivi, quelli che vanno fatti spesso. Inizializzazione sessione, aggiunta memory e commit, uso di unified-ai-mcp per task agentiche complesse (si possono definire workflow già presenti).
    - SPEC creation
    - use unified-ai-mcp for ...
    - check docs

I woul like you to split @refinements.md in 3-4 different, sub-tasks and save them .md in docs/enhancement-plan. The tasks should be pertinent to eachother by theme, we must enforce checking the documentations link before starting any proposal work. The agent that we make the request to shouldn't immediately implement, but propose a clear plan, and update the task it belongs to (the .md you create now). Please understand the requirement and my request thoroughly, explore the documentations yourself and the codebase if you need more specific context. Also, before starting any work, create a new branch now.