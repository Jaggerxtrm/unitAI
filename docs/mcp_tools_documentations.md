---
date_created: Sunday, November 16th 2025, 1:47:53 pm
date_modified: Sunday, November 16th 2025, 2:12:48 pm
---
https://cursor.com/docs/cli/overview - cursor CLI agent
	- la sintassi è: cursor-agent -p "prompt" --model --output-format text 
	- permette l'uso di molti modelli con il parametro --model "model":
		- GPT-5, GPT-5.1 (modelli molto potenti, diversi da sonnet o gemini per come eseguono i comandi, utili per prospettive diverse, GPT-5.1 è più nuovo e più potente)
		- composer-1 (modello più leggero e molto veloc, ottimo per task veloci)
		- sonnet-4.5 (stesso modello di claude code, potentissimo, anche se è lo stesso modello permette di far risparmiare context e token a claude code)
https://docs.factory.ai/cli/droid-exec/overview#droid-exec-headless-cli - GLM-4.6
- un unico modello, alternativo, molto potente. Se deve usare tool o modificare file, deve usare --skip-permission-unsafe
```
Usage: droid exec [options] [prompt]

Execute a single command (non-interactive mode)

Arguments:
  prompt                          The prompt to execute

Options:
  -o, --output-format <format>    Output format (default: "text")
  -f, --file <path>               Read prompt from file
  --auto <level>                  Autonomy level: low|medium|high
  --skip-permissions-unsafe       Skip ALL permission checks (unsafe)
  -s, --session-id <id>           Existing session to continue (requires a prompt)
  -m, --model <id>                Model ID to use
  -r, --reasoning-effort <level>  Reasoning effort: off|low|medium|high
  --cwd <path>                    Working directory path
  -h, --help                      display help for command
  ```
https://github.com/QwenLM/qwen-code
https://github.com/google-gemini/gemini-cli
