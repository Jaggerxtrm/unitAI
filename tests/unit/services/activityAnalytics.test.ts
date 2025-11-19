/**
 * Tests for Activity Analytics Service
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ActivityAnalytics } from '../../../src/services/activityAnalytics.js';
import * as fs from 'fs';
import * as path from 'path';

describe('ActivityAnalytics', () => {
  let analytics: ActivityAnalytics;
  let testDbPath: string;

  beforeEach(() => {
    // Use temporary test database
    testDbPath = path.join(process.cwd(), 'data', 'test-activity.sqlite');
    analytics = new ActivityAnalytics(
      undefined,
      undefined,
      testDbPath
    );
  });

  afterEach(() => {
    // Cleanup
    analytics.close();
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
  });

  describe('recordActivity', () => {
    it('should record a tool invocation activity', () => {
      const activityId = analytics.recordActivity({
        activityType: 'tool_invocation',
        toolName: 'ask-gemini',
        success: true,
        duration: 1500,
        metadata: { prompt: 'test prompt' }
      });

      expect(activityId).toMatch(/^activity_/);
    });

    it('should record a workflow execution activity', () => {
      const activityId = analytics.recordActivity({
        activityType: 'workflow_execution',
        workflowName: 'bug-hunt',
        success: true,
        duration: 5000,
        metadata: { filesAnalyzed: 10 }
      });

      expect(activityId).toMatch(/^activity_/);
    });

    it('should record a failed activity with error message', () => {
      const activityId = analytics.recordActivity({
        activityType: 'tool_invocation',
        toolName: 'ask-qwen',
        success: false,
        errorMessage: 'Connection timeout',
        metadata: {}
      });

      expect(activityId).toMatch(/^activity_/);
    });
  });

  describe('queryActivities', () => {
    beforeEach(() => {
      // Add test data
      analytics.recordActivity({
        activityType: 'tool_invocation',
        toolName: 'ask-gemini',
        success: true,
        duration: 1000,
        metadata: {}
      });

      analytics.recordActivity({
        activityType: 'workflow_execution',
        workflowName: 'bug-hunt',
        success: true,
        duration: 3000,
        metadata: {}
      });
    });

    it('should query all activities', () => {
      const activities = analytics.queryActivities();
      expect(activities.length).toBeGreaterThanOrEqual(2);
    });

    it('should filter by activity type', () => {
      const activities = analytics.queryActivities({
        activityType: 'tool_invocation'
      });

      expect(activities.length).toBeGreaterThanOrEqual(1);
      expect(activities.every(a => a.activityType === 'tool_invocation')).toBe(true);
    });

    it('should filter by tool name', () => {
      const activities = analytics.queryActivities({
        toolName: 'ask-gemini'
      });

      expect(activities.length).toBeGreaterThanOrEqual(1);
      expect(activities.every(a => a.toolName === 'ask-gemini')).toBe(true);
    });

    it('should filter by success status', () => {
      analytics.recordActivity({
        activityType: 'tool_invocation',
        toolName: 'test-tool',
        success: false,
        metadata: {}
      });

      const failedActivities = analytics.queryActivities({
        success: false
      });

      expect(failedActivities.length).toBeGreaterThanOrEqual(1);
      expect(failedActivities.every(a => !a.success)).toBe(true);
    });

    it('should limit results', () => {
      const activities = analytics.queryActivities({ limit: 1 });
      expect(activities.length).toBe(1);
    });
  });

  describe('getActivitySummary', () => {
    beforeEach(() => {
      // Add varied test data
      for (let i = 0; i < 5; i++) {
        analytics.recordActivity({
          activityType: 'tool_invocation',
          toolName: 'ask-gemini',
          success: true,
          duration: 1000 + i * 100,
          metadata: {}
        });
      }

      for (let i = 0; i < 3; i++) {
        analytics.recordActivity({
          activityType: 'workflow_execution',
          workflowName: 'bug-hunt',
          success: i < 2, // 2 successful, 1 failed
          duration: 3000 + i * 500,
          metadata: {}
        });
      }
    });

    it('should generate activity summary', () => {
      const summary = analytics.getActivitySummary(7);

      expect(summary).toBeDefined();
      expect(summary.period).toBe('Last 7 days');
      expect(summary.toolInvocations).toBeGreaterThanOrEqual(5);
      expect(summary.workflowExecutions).toBeGreaterThanOrEqual(3);
    });

    it('should calculate success rate', () => {
      const summary = analytics.getActivitySummary(7);
      expect(summary.successRate).toBeGreaterThan(0);
      expect(summary.successRate).toBeLessThanOrEqual(1);
    });

    it('should include top tools', () => {
      const summary = analytics.getActivitySummary(7);
      expect(summary.topTools.length).toBeGreaterThan(0);
      
      const geminiTool = summary.topTools.find(t => t.toolName === 'ask-gemini');
      expect(geminiTool).toBeDefined();
      expect(geminiTool?.invocations).toBeGreaterThanOrEqual(5);
    });

    it('should include top workflows', () => {
      const summary = analytics.getActivitySummary(7);
      expect(summary.topWorkflows.length).toBeGreaterThan(0);
      
      const bugHuntWorkflow = summary.topWorkflows.find(w => w.workflowName === 'bug-hunt');
      expect(bugHuntWorkflow).toBeDefined();
      expect(bugHuntWorkflow?.executions).toBeGreaterThanOrEqual(3);
    });

    it('should include activity patterns', () => {
      const summary = analytics.getActivitySummary(7);
      
      expect(summary.activityByHour).toBeDefined();
      expect(summary.activityByHour.length).toBe(24); // All hours
      
      expect(summary.activityByDay).toBeDefined();
      expect(summary.activityByDay.length).toBeGreaterThan(0);
    });
  });

  describe('getToolStats', () => {
    beforeEach(() => {
      analytics.recordActivity({
        activityType: 'tool_invocation',
        toolName: 'test-tool',
        success: true,
        duration: 1000,
        metadata: {}
      });

      analytics.recordActivity({
        activityType: 'tool_invocation',
        toolName: 'test-tool',
        success: false,
        duration: 500,
        metadata: {}
      });
    });

    it('should return tool statistics', () => {
      const stats = analytics.getToolStats('test-tool', 7);

      expect(stats).toBeDefined();
      expect(stats?.toolName).toBe('test-tool');
      expect(stats?.invocations).toBe(2);
      expect(stats?.successRate).toBe(0.5); // 1 success out of 2
      expect(stats?.avgResponseTime).toBeDefined();
    });

    it('should return null for non-existent tool', () => {
      const stats = analytics.getToolStats('non-existent-tool', 7);
      expect(stats).toBeNull();
    });
  });

  describe('getWorkflowStats', () => {
    beforeEach(() => {
      analytics.recordActivity({
        activityType: 'workflow_execution',
        workflowName: 'test-workflow',
        success: true,
        duration: 3000,
        metadata: {}
      });

      analytics.recordActivity({
        activityType: 'workflow_execution',
        workflowName: 'test-workflow',
        success: true,
        duration: 2500,
        metadata: {}
      });
    });

    it('should return workflow statistics', () => {
      const stats = analytics.getWorkflowStats('test-workflow', 7);

      expect(stats).toBeDefined();
      expect(stats?.workflowName).toBe('test-workflow');
      expect(stats?.executions).toBe(2);
      expect(stats?.successCount).toBe(2);
      expect(stats?.failureCount).toBe(0);
      expect(stats?.avgDuration).toBeDefined();
    });

    it('should return null for non-existent workflow', () => {
      const stats = analytics.getWorkflowStats('non-existent-workflow', 7);
      expect(stats).toBeNull();
    });
  });

  describe('getRecentActivities', () => {
    beforeEach(() => {
      for (let i = 0; i < 10; i++) {
        analytics.recordActivity({
          activityType: 'tool_invocation',
          toolName: `tool-${i}`,
          success: true,
          metadata: {}
        });
      }
    });

    it('should return recent activities', () => {
      const activities = analytics.getRecentActivities(5);
      expect(activities.length).toBe(5);
    });

    it('should return activities in descending order', () => {
      const activities = analytics.getRecentActivities(10);
      
      for (let i = 0; i < activities.length - 1; i++) {
        expect(activities[i].timestamp.getTime()).toBeGreaterThanOrEqual(
          activities[i + 1].timestamp.getTime()
        );
      }
    });
  });

  describe('cleanup', () => {
    it('should remove old activities', () => {
      // Record an activity
      analytics.recordActivity({
        activityType: 'tool_invocation',
        toolName: 'test-tool',
        success: true,
        metadata: {}
      });

      // Cleanup activities older than 0 days (should remove all)
      const removed = analytics.cleanup(0);
      
      // Check that activities were removed
      const activities = analytics.queryActivities();
      expect(activities.length).toBe(0);
    });
  });
});
