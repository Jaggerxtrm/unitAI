- verificare che gli smart workflows abbiano i giusti permessi per fare qualsiasi cosa debbano fare es. --yolo;
- permettere una scelta smart per eseguire un workflow anzichè hard-coded? ad esempio, scegliere un livello di accuratezza:
    - gemini: context window estremamente ampia, adatto per proposte di refactoring molto ampie o addirittura interi refactoring (se refactoring nella pratica, deve avere i permessi giusti, fare un nuovo branch prima di iniziare o qualcosa del genere);
    - rovodev: utilizza sonnet 4.5, per cui molto accurato per il coding, molto preciso;
    - qwen: ottimo modello multi purpose, ma generalmente inferiore agli altri due, si presta bene a ricerche di codice, utilizzo di mcp come context7, o comunque quel che potrebbe riguardare "wasting" di token senza pensarci troppo;
Ovviamente, per i workflow che riguardano la collaborazione tra LLM, si può arrivare ad utilizzarli anche tutti e 3 senza problemi, in parallelo o sequenzialmente.

Potrebbe dunque essere la LLM host/orchestrator a scegliere autonomamente il parametro "model" tra gemini, rovodev, qwen (o altre aggiunte in futuro).

Claude ha comunque bisogno di un sistema approfondito di skill e hook per utilizzare il sistema autonomamente, correttamente, al momento giusto.
    Documentazione:
        - SKILL: https://code.claude.com/docs/en/skills
        - HOOK: https://code.claude.com/docs/en/hooks-guide
        - Sistema skill: https://www.reddit.com/r/ClaudeAI/comments/1opxgq4/i_was_wrong_about_agent_skills_and_how_i_refactor/ , https://github.com/mrgoonie/claudekit-skills/tree/main/.claude/skills/devops , https://github.com/diet103/claude-code-infrastructure-showcase , https://www.reddit.com/r/ClaudeAI/comments/1oivjvm/claude_code_is_a_beast_tips_from_6_months_of/

GLM 4.6 tramite "Factory Droid" CLI è anche un ottimo modo per usarlo. Oppure direttamente con api key direttamente. Forse avendo API key si può pensare a qualcosa di ancor più avanzato? Tipo un orchestratore dei workflow (ma questa è solo un idea, necessita brainstorming).
    Documentazione:
        - HEADLESS MODE / DROID EXEC: https://docs.factory.ai/cli/droid-exec/overview#droid-exec-headless-cli

