import type { GitRepoInfo, GitCommitInfo } from "../workflows/types.js";
/**
 * Verifica se la directory corrente è un repository Git
 */
export declare function isGitRepository(): Promise<boolean>;
/**
 * Ottiene informazioni sul repository Git corrente
 */
export declare function getGitRepoInfo(): Promise<GitRepoInfo>;
/**
 * Restituisce il branch corrente
 */
export declare function getCurrentBranch(): Promise<string>;
/**
 * Ottiene informazioni su un commit specifico
 */
export declare function getGitCommitInfo(commitRef?: string): Promise<GitCommitInfo>;
/**
 * Ottiene il diff tra due commit
 */
export declare function getGitDiff(fromRef: string, toRef?: string): Promise<string>;
/**
 * Ottiene il diff dei file staged
 */
export declare function getStagedDiff(): Promise<string>;
/**
 * Ottiene lo stato del repository in formato dettagliato
 */
export declare function getDetailedGitStatus(): Promise<string>;
/**
 * Ottiene i branch locali e remoti
 */
export declare function getGitBranches(): Promise<string>;
/**
 * Verifica se un file è tracciato da Git
 */
export declare function isFileTracked(filePath: string): Promise<boolean>;
/**
 * Ottiene gli ultimi N commits con i loro diffs completi
 */
export declare function getRecentCommitsWithDiffs(count?: number): Promise<GitCommitInfo[]>;
/**
 * Estrae il range di date da un array di commits
 */
export declare function getDateRangeFromCommits(commits: GitCommitInfo[]): {
    oldest: string;
    newest: string;
} | null;
/**
 * Verifica la disponibilità dei comandi CLI necessari
 */
export declare function checkCLIAvailability(): Promise<Record<string, boolean>>;
//# sourceMappingURL=gitHelper.d.ts.map