/**
 * Base Repository Pattern
 * 
 * Abstract class for data access layers using better-sqlite3.
 */
import Database from 'better-sqlite3';

export abstract class BaseRepository {
    protected db: Database.Database;

    constructor(db: Database.Database) {
        this.db = db;
    }

    /**
     * Initialize tables - to be overridden by subclasses
     */
    abstract initializeSchema(): void;

    /**
     * Helper to run a transaction
     */
    protected transaction<T>(fn: () => T): T {
        return this.db.transaction(fn)();
    }
}
