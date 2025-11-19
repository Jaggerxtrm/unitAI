import { executeCommand } from "./commandExecutor.js";
import { logger } from "./logger.js";
import type { GitRepoInfo, GitCommitInfo } from "../workflows/types.js";

/**
 * Esegue un comando Git e restituisce l'output
 */
async function runGitCommand(args: string[]): Promise<string> {
  try {
    return await executeCommand("git", args);
  } catch (error) {
    logger.error(`Errore nell'esecuzione di git ${args.join(" ")}:`, error);
    throw error;
  }
}

/**
 * Verifica se la directory corrente è un repository Git
 */
export async function isGitRepository(): Promise<boolean> {
  try {
    await runGitCommand(["rev-parse", "--git-dir"]);
    return true;
  } catch {
    return false;
  }
}

/**
 * Ottiene informazioni sul repository Git corrente
 */
export async function getGitRepoInfo(): Promise<GitRepoInfo> {
  if (!await isGitRepository()) {
    throw new Error("Directory corrente non è un repository Git");
  }

  try {
    // Branch corrente
    const branchOutput = await runGitCommand(["branch", "--show-current"]);
    const currentBranch = branchOutput.trim();

    // Status
    const statusOutput = await runGitCommand(["status", "--porcelain"]);
    const status = statusOutput.trim();

    // Commit recenti
    const logOutput = await runGitCommand(["log", "--oneline", "-5"]);
    const recentCommits = logOutput.trim().split("\n").filter(line => line.trim());

    // File staged
    const stagedOutput = await runGitCommand(["diff", "--cached", "--name-only"]);
    const stagedFiles = stagedOutput.trim() ? stagedOutput.trim().split("\n") : [];

    // File modificati
    const modifiedOutput = await runGitCommand(["diff", "--name-only"]);
    const modifiedFiles = modifiedOutput.trim() ? modifiedOutput.trim().split("\n") : [];

    return {
      currentBranch,
      status,
      recentCommits,
      stagedFiles,
      modifiedFiles
    };
  } catch (error) {
    logger.error("Errore nel recupero delle informazioni del repository Git:", error);
    throw error;
  }
}

/**
 * Restituisce il branch corrente
 */
export async function getCurrentBranch(): Promise<string> {
  if (!await isGitRepository()) {
    throw new Error("Directory corrente non è un repository Git");
  }

  const branchOutput = await runGitCommand(["branch", "--show-current"]);
  return branchOutput.trim();
}

/**
 * Ottiene informazioni su un commit specifico
 */
export async function getGitCommitInfo(commitRef: string = "HEAD"): Promise<GitCommitInfo> {
  if (!await isGitRepository()) {
    throw new Error("Directory corrente non è un repository Git");
  }

  try {
    // Informazioni base del commit
    const showOutput = await runGitCommand(["show", "--format=%H|%an|%ad|%s", "--date=iso", commitRef]);
    const [hash, author, date, message] = showOutput.split("\n")[0].split("|");

    // Diff del commit
    const diffOutput = await runGitCommand(["show", "--format=", commitRef]);
    const diff = diffOutput;

    // File modificati nel commit
    const nameOnlyOutput = await runGitCommand(["show", "--format=", "--name-only", commitRef]);
    const files = nameOnlyOutput.trim() ? nameOnlyOutput.trim().split("\n") : [];

    return {
      hash,
      author,
      date,
      message,
      diff,
      files
    };
  } catch (error) {
    logger.error(`Errore nel recupero delle informazioni del commit ${commitRef}:`, error);
    throw error;
  }
}

/**
 * Ottiene il diff tra due commit
 */
export async function getGitDiff(fromRef: string, toRef: string = "HEAD"): Promise<string> {
  if (!await isGitRepository()) {
    throw new Error("Directory corrente non è un repository Git");
  }

  try {
    return await runGitCommand(["diff", `${fromRef}..${toRef}`]);
  } catch (error) {
    logger.error(`Errore nel recupero del diff tra ${fromRef} e ${toRef}:`, error);
    throw error;
  }
}

/**
 * Ottiene il diff dei file staged
 */
export async function getStagedDiff(): Promise<string> {
  if (!await isGitRepository()) {
    throw new Error("Directory corrente non è un repository Git");
  }

  try {
    return await runGitCommand(["diff", "--cached"]);
  } catch (error) {
    logger.error("Errore nel recupero del diff dei file staged:", error);
    throw error;
  }
}

/**
 * Ottiene lo stato del repository in formato dettagliato
 */
export async function getDetailedGitStatus(): Promise<string> {
  if (!await isGitRepository()) {
    throw new Error("Directory corrente non è un repository Git");
  }

  try {
    return await runGitCommand(["status"]);
  } catch (error) {
    logger.error("Errore nel recupero dello stato del repository:", error);
    throw error;
  }
}

/**
 * Ottiene i branch locali e remoti
 */
export async function getGitBranches(): Promise<string> {
  if (!await isGitRepository()) {
    throw new Error("Directory corrente non è un repository Git");
  }

  try {
    return await runGitCommand(["branch", "-vv"]);
  } catch (error) {
    logger.error("Errore nel recupero dei branch:", error);
    throw error;
  }
}

/**
 * Verifica se un file è tracciato da Git
 */
export async function isFileTracked(filePath: string): Promise<boolean> {
  if (!await isGitRepository()) {
    return false;
  }

  try {
    await runGitCommand(["ls-files", "--error-unmatch", filePath]);
    return true;
  } catch {
    return false;
  }
}

/**
 * Ottiene gli ultimi N commits con i loro diffs completi
 */
export async function getRecentCommitsWithDiffs(count: number = 10): Promise<GitCommitInfo[]> {
  if (!await isGitRepository()) {
    throw new Error("Directory corrente non è un repository Git");
  }

  try {
    // Ottieni gli hash degli ultimi N commits
    const logOutput = await runGitCommand(["log", "--oneline", `-${count}`]);
    const hashes = logOutput
      .trim()
      .split("\n")
      .map(line => line.trim().split(" ")[0])
      .filter(hash => !!hash);

    // Per ogni hash, ottieni le informazioni complete
    const commits: GitCommitInfo[] = [];
    for (const hash of hashes) {
      const commitInfo = await getGitCommitInfo(hash);
      commits.push(commitInfo);
    }

    return commits;
  } catch (error) {
    logger.error(`Errore nel recupero degli ultimi ${count} commits:`, error);
    throw error;
  }
}

/**
 * Estrae il range di date da un array di commits
 */
export function getDateRangeFromCommits(commits: GitCommitInfo[]): { oldest: string; newest: string } | null {
  if (commits.length === 0) {
    return null;
  }

  // I commit sono già ordinati dal più recente al più vecchio
  const newest = commits[0].date;
  const oldest = commits[commits.length - 1].date;

  return { oldest, newest };
}

/**
 * Verifica la disponibilità dei comandi CLI necessari
 */
export async function checkCLIAvailability(): Promise<Record<string, boolean>> {
  const commands = ["qwen", "gemini", "acli"];
  const availability: Record<string, boolean> = {};

  for (const cmd of commands) {
    try {
      await executeCommand(cmd, ["--version"]);
      availability[cmd] = true;
    } catch {
      availability[cmd] = false;
    }
  }

  return availability;
}
