export class BaseRepository {
    db;
    constructor(db) {
        this.db = db;
    }
    /**
     * Helper to run a transaction
     */
    transaction(fn) {
        return this.db.transaction(fn)();
    }
}
//# sourceMappingURL=base.js.map