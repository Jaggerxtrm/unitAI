/**
 * Dashboard Renderer Utility
 *
 * Provides terminal-based rendering for the activity dashboard.
 * Supports real-time updates, charts, and formatted output.
 */
import type { UserActivitySummary } from '../services/activityAnalytics.js';
/**
 * Dashboard rendering options
 */
export interface DashboardOptions {
    useColors: boolean;
    compactMode: boolean;
    showCharts: boolean;
    refreshInterval?: number;
}
/**
 * Dashboard Renderer
 *
 * Renders activity data in a user-friendly terminal dashboard format
 */
export declare class DashboardRenderer {
    private options;
    constructor(options?: Partial<DashboardOptions>);
    /**
     * Render complete activity dashboard
     */
    renderDashboard(summary: UserActivitySummary): string;
    /**
     * Render dashboard header
     */
    private renderHeader;
    /**
     * Render overall statistics
     */
    private renderOverallStats;
    /**
     * Render tool usage statistics
     */
    private renderToolUsage;
    /**
     * Render workflow statistics
     */
    private renderWorkflowStats;
    /**
     * Render token savings statistics
     */
    private renderTokenSavings;
    /**
     * Render audit trail summary
     */
    private renderAuditSummary;
    /**
     * Render activity charts
     */
    private renderActivityCharts;
    /**
     * Render a simple horizontal bar chart
     */
    private renderBarChart;
    /**
     * Render dashboard footer
     */
    private renderFooter;
    /**
     * Format duration in human-readable format
     */
    private formatDuration;
    /**
     * Format relative time
     */
    private formatRelativeTime;
    /**
     * Apply color to text
     */
    private color;
}
/**
 * Export a simple function for quick dashboard rendering
 */
export declare function renderActivityDashboard(summary: UserActivitySummary, options?: Partial<DashboardOptions>): string;
//# sourceMappingURL=dashboardRenderer.d.ts.map