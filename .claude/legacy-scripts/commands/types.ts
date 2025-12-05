export interface SlashCommand {
  command: string;
  params: string[];
  raw: string;
}

export interface CommandResult {
  success: boolean;
  output: string;
  error?: string;
  duration?: number;
}

export interface CommandHandler {
  execute(params: string[]): Promise<CommandResult>;
  help(): string;
}

export interface WorkflowParams {
  workflow: string;
  params: Record<string, any>;
}

export interface MemoryEntry {
  content: string;
  timestamp: string;
  tags?: string[];
  commitHash?: string;
}
