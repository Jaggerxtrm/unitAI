/**
 * Activity Repository
 *
 * Data access layer for MCP Activities.
 */
import { BaseRepository } from "./base.js";
import { MCPActivity } from "../services/activityAnalytics.js";
export declare class ActivityRepository extends BaseRepository {
    initializeSchema(): void;
    create(activity: Omit<MCPActivity, 'id' | 'timestamp'> & {
        id: string;
        timestamp: number;
    }): void;
    query(filters: {
        activityType?: string;
        toolName?: string;
        workflowName?: string;
        startTime?: number;
        endTime?: number;
        success?: boolean;
        limit?: number;
    }): MCPActivity[];
    cleanup(cutoffTimestamp: number): number;
    private rowToActivity;
}
//# sourceMappingURL=activity.d.ts.map