import { z } from "zod";

/**
 * Tipo di callback per progresso dell'esecuzione
 */
export type ProgressCallback = (message: string) => void;

/**
 * Interfaccia base per la definizione di un workflow
 */
export interface WorkflowDefinition<TParams = any> {
  description: string;
  schema: z.ZodSchema<TParams>;
  execute: (params: TParams, onProgress?: ProgressCallback) => Promise<string>;
}

/**
 * Risultato dell'esecuzione di un workflow
 */
export interface WorkflowResult {
  success: boolean;
  output: string;
  metadata?: Record<string, any>;
}

/**
 * Tipi di focus per l'analisi del codice
 */
export type ReviewFocus = "architecture" | "security" | "performance" | "quality" | "all";

/**
 * Livelli di profondità per la validazione
 */
export type ValidationDepth = "quick" | "thorough" | "paranoid";

/**
 * Parametri per il workflow parallel-review
 */
export interface ParallelReviewParams {
  files: string[];
  focus?: ReviewFocus;
}

/**
 * Parametri per il workflow pre-commit-validate
 */
export interface PreCommitValidateParams {
  depth?: ValidationDepth;
}

/**
 * Parametri per il workflow validate-last-commit
 */
export interface ValidateLastCommitParams {
  commit_ref?: string;
}

/**
 * Parametri per il workflow bug-hunt
 */
export interface BugHuntParams {
  symptoms: string;
  suspected_files?: string[];
}

/**
 * Risultato dell'analisi AI
 */
export interface AIAnalysisResult {
  backend: string;
  model?: string;
  output: string;
  success: boolean;
  error?: string;
}

/**
 * Risultato dell'analisi parallela
 */
export interface ParallelAnalysisResult {
  results: AIAnalysisResult[];
  synthesis?: string;
}

/**
 * Informazioni sul repository Git
 */
export interface GitRepoInfo {
  currentBranch: string;
  status: string;
  recentCommits: string[];
  stagedFiles: string[];
  modifiedFiles: string[];
}

/**
 * Informazioni su un commit Git
 */
export interface GitCommitInfo {
  hash: string;
  author: string;
  date: string;
  message: string;
  diff: string;
  files: string[];
}
