/**
 * Permission Manager per gestire l'autonomia dei workflow
 * Ispirato a Factory Droid exec con livelli di autonomia granulare
 */

export enum AutonomyLevel {
  READ_ONLY = "read-only",
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high"
}

export interface PermissionConfig {
  level: AutonomyLevel;
  allowedOperations: Set<string>;
  requiresConfirmation: boolean;
}

/**
 * Operazioni classificate per livello di rischio
 */
export const OPERATIONS = {
  // Read-only operations
  READ_FILE: "read_file",
  GIT_STATUS: "git_status",
  GIT_DIFF: "git_diff",
  GIT_LOG: "git_log",
  LIST_DIRECTORY: "list_directory",
  
  // Low level operations (modifica file locali)
  WRITE_FILE: "write_file",
  CREATE_FILE: "create_file",
  DELETE_FILE: "delete_file",
  MODIFY_FILE: "modify_file",
  
  // Medium level operations (operazioni Git locali)
  GIT_COMMIT: "git_commit",
  GIT_BRANCH: "git_branch",
  GIT_CHECKOUT: "git_checkout",
  GIT_MERGE: "git_merge",
  NPM_INSTALL: "npm_install",
  RUN_BUILD: "run_build",
  RUN_TESTS: "run_tests",
  
  // High level operations (operazioni con impatto esterno)
  GIT_PUSH: "git_push",
  GIT_FORCE_PUSH: "git_force_push",
  NPM_PUBLISH: "npm_publish",
  DEPLOY: "deploy",
  DELETE_BRANCH_REMOTE: "delete_branch_remote"
} as const;

export type Operation = typeof OPERATIONS[keyof typeof OPERATIONS];

/**
 * Definisce quali operazioni sono permesse per ogni livello di autonomia
 */
const LEVEL_PERMISSIONS: Record<AutonomyLevel, Set<Operation>> = {
  [AutonomyLevel.READ_ONLY]: new Set([
    OPERATIONS.READ_FILE,
    OPERATIONS.GIT_STATUS,
    OPERATIONS.GIT_DIFF,
    OPERATIONS.GIT_LOG,
    OPERATIONS.LIST_DIRECTORY
  ]),
  
  [AutonomyLevel.LOW]: new Set([
    OPERATIONS.READ_FILE,
    OPERATIONS.GIT_STATUS,
    OPERATIONS.GIT_DIFF,
    OPERATIONS.GIT_LOG,
    OPERATIONS.LIST_DIRECTORY,
    OPERATIONS.WRITE_FILE,
    OPERATIONS.CREATE_FILE,
    OPERATIONS.DELETE_FILE,
    OPERATIONS.MODIFY_FILE
  ]),
  
  [AutonomyLevel.MEDIUM]: new Set([
    OPERATIONS.READ_FILE,
    OPERATIONS.GIT_STATUS,
    OPERATIONS.GIT_DIFF,
    OPERATIONS.GIT_LOG,
    OPERATIONS.LIST_DIRECTORY,
    OPERATIONS.WRITE_FILE,
    OPERATIONS.CREATE_FILE,
    OPERATIONS.DELETE_FILE,
    OPERATIONS.MODIFY_FILE,
    OPERATIONS.GIT_COMMIT,
    OPERATIONS.GIT_BRANCH,
    OPERATIONS.GIT_CHECKOUT,
    OPERATIONS.GIT_MERGE,
    OPERATIONS.NPM_INSTALL,
    OPERATIONS.RUN_BUILD,
    OPERATIONS.RUN_TESTS
  ]),
  
  [AutonomyLevel.HIGH]: new Set([
    OPERATIONS.READ_FILE,
    OPERATIONS.GIT_STATUS,
    OPERATIONS.GIT_DIFF,
    OPERATIONS.GIT_LOG,
    OPERATIONS.LIST_DIRECTORY,
    OPERATIONS.WRITE_FILE,
    OPERATIONS.CREATE_FILE,
    OPERATIONS.DELETE_FILE,
    OPERATIONS.MODIFY_FILE,
    OPERATIONS.GIT_COMMIT,
    OPERATIONS.GIT_BRANCH,
    OPERATIONS.GIT_CHECKOUT,
    OPERATIONS.GIT_MERGE,
    OPERATIONS.NPM_INSTALL,
    OPERATIONS.RUN_BUILD,
    OPERATIONS.RUN_TESTS,
    OPERATIONS.GIT_PUSH,
    OPERATIONS.GIT_FORCE_PUSH,
    OPERATIONS.NPM_PUBLISH,
    OPERATIONS.DEPLOY,
    OPERATIONS.DELETE_BRANCH_REMOTE
  ])
};

/**
 * Classe per gestire i permessi dei workflow
 */
export class PermissionManager {
  private currentLevel: AutonomyLevel;
  private confirmationCallback?: (operation: Operation) => Promise<boolean>;

  constructor(
    level: AutonomyLevel = AutonomyLevel.READ_ONLY,
    confirmationCallback?: (operation: Operation) => Promise<boolean>
  ) {
    this.currentLevel = level;
    this.confirmationCallback = confirmationCallback;
  }

  /**
   * Verifica se un'operazione è permessa al livello corrente
   */
  isAllowed(operation: Operation): boolean {
    const allowedOps = LEVEL_PERMISSIONS[this.currentLevel];
    return allowedOps.has(operation);
  }

  /**
   * Richiede il permesso per eseguire un'operazione
   * Solleva un'eccezione se l'operazione non è permessa
   */
  async requestPermission(operation: Operation, context?: string): Promise<void> {
    if (!this.isAllowed(operation)) {
      throw new PermissionDeniedError(
        operation,
        this.currentLevel,
        context
      );
    }

    // Se è richiesta conferma per operazioni critiche
    if (this.requiresConfirmation(operation) && this.confirmationCallback) {
      const confirmed = await this.confirmationCallback(operation);
      if (!confirmed) {
        throw new PermissionDeniedError(
          operation,
          this.currentLevel,
          "User denied confirmation"
        );
      }
    }
  }

  /**
   * Verifica se un'operazione richiede conferma
   */
  private requiresConfirmation(operation: Operation): boolean {
    // Operazioni critiche che richiedono sempre conferma
    const criticalOps = new Set([
      OPERATIONS.GIT_PUSH,
      OPERATIONS.GIT_FORCE_PUSH,
      OPERATIONS.NPM_PUBLISH,
      OPERATIONS.DEPLOY,
      OPERATIONS.DELETE_BRANCH_REMOTE
    ]);

    return criticalOps.has(operation);
  }

  /**
   * Ottiene il livello di autonomia corrente
   */
  getLevel(): AutonomyLevel {
    return this.currentLevel;
  }

  /**
   * Imposta un nuovo livello di autonomia
   */
  setLevel(level: AutonomyLevel): void {
    this.currentLevel = level;
  }

  /**
   * Ottiene tutte le operazioni permesse al livello corrente
   */
  getAllowedOperations(): Set<Operation> {
    return new Set(LEVEL_PERMISSIONS[this.currentLevel]);
  }

  /**
   * Ottiene una descrizione testuale del livello corrente
   */
  getLevelDescription(): string {
    switch (this.currentLevel) {
      case AutonomyLevel.READ_ONLY:
        return "Solo lettura: può leggere file e informazioni Git";
      case AutonomyLevel.LOW:
        return "Autonomia bassa: può modificare file locali";
      case AutonomyLevel.MEDIUM:
        return "Autonomia media: può eseguire operazioni Git locali e gestire dipendenze";
      case AutonomyLevel.HIGH:
        return "Autonomia alta: può eseguire operazioni con impatto esterno (push, deploy)";
      default:
        return "Livello sconosciuto";
    }
  }

  /**
   * Crea un report delle operazioni permesse
   */
  getPermissionReport(): string {
    const allowed = this.getAllowedOperations();
    const allOps = Object.values(OPERATIONS);
    const denied = allOps.filter(op => !allowed.has(op));

    return `
Livello di Autonomia: ${this.currentLevel}
${this.getLevelDescription()}

Operazioni Permesse (${allowed.size}):
${Array.from(allowed).map(op => `  - ${op}`).join("\n")}

Operazioni Negate (${denied.length}):
${denied.map(op => `  - ${op}`).join("\n")}
`.trim();
  }
}

/**
 * Errore lanciato quando un'operazione non è permessa
 */
export class PermissionDeniedError extends Error {
  constructor(
    public operation: Operation,
    public currentLevel: AutonomyLevel,
    public context?: string
  ) {
    super(
      `Operazione '${operation}' non permessa al livello '${currentLevel}'${context ? `: ${context}` : ""}`
    );
    this.name = "PermissionDeniedError";
  }
}

/**
 * Istanza globale del PermissionManager
 * Può essere configurata all'avvio del server MCP
 */
let globalPermissionManager: PermissionManager | null = null;

/**
 * Inizializza il PermissionManager globale
 */
export function initializePermissionManager(
  level: AutonomyLevel = AutonomyLevel.READ_ONLY,
  confirmationCallback?: (operation: Operation) => Promise<boolean>
): PermissionManager {
  globalPermissionManager = new PermissionManager(level, confirmationCallback);
  return globalPermissionManager;
}

/**
 * Ottiene il PermissionManager globale
 */
export function getPermissionManager(): PermissionManager {
  if (!globalPermissionManager) {
    globalPermissionManager = new PermissionManager();
  }
  return globalPermissionManager;
}

/**
 * Helper per verificare rapidamente un permesso
 */
export async function checkPermission(
  operation: Operation,
  context?: string
): Promise<void> {
  const pm = getPermissionManager();
  await pm.requestPermission(operation, context);
}
