/**
 * Tests for Token Savings Metrics Collection
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TokenSavingsMetrics, getMetricsCollector } from '../../src/utils/tokenEstimator.js';
import * as fs from 'fs';
import * as path from 'path';

describe('TokenSavingsMetrics', () => {
  let metrics: TokenSavingsMetrics;
  const testDbPath = path.join(process.cwd(), 'data', 'token-metrics-test.sqlite');

  beforeEach(() => {
    // Clean up test database if it exists
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
    metrics = new TokenSavingsMetrics(testDbPath);
  });

  afterEach(() => {
    metrics.close();
    // Clean up test database
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
  });

  describe('record', () => {
    it('should record a token savings metric', () => {
      const metricId = metrics.record({
        source: 'enforcer-hook',
        blockedTool: 'Read',
        recommendedTool: 'serena',
        target: 'src/utils/tokenEstimator.ts',
        estimatedSavings: 120,
        suggestionFollowed: false,
        metadata: { fileType: 'code' }
      });

      expect(metricId).toMatch(/^metric_/);
    });

    it('should store metric with all fields', () => {
      metrics.record({
        source: 'enforcer-hook',
        blockedTool: 'Grep',
        recommendedTool: 'claude-context',
        target: 'search pattern',
        estimatedSavings: 1500,
        actualTokensAvoided: 1450,
        suggestionFollowed: true,
        metadata: { pattern: 'test' }
      });

      const results = metrics.query({ limit: 1 });
      expect(results).toHaveLength(1);
      expect(results[0].blockedTool).toBe('Grep');
      expect(results[0].recommendedTool).toBe('claude-context');
      expect(results[0].estimatedSavings).toBe(1500);
      expect(results[0].actualTokensAvoided).toBe(1450);
      expect(results[0].suggestionFollowed).toBe(true);
    });
  });

  describe('query', () => {
    beforeEach(() => {
      // Insert test data
      metrics.record({
        source: 'enforcer-hook',
        blockedTool: 'Read',
        recommendedTool: 'serena',
        target: 'file1.ts',
        estimatedSavings: 100,
        suggestionFollowed: true,
        metadata: {}
      });

      metrics.record({
        source: 'workflow',
        blockedTool: 'Bash',
        recommendedTool: 'serena',
        target: 'file2.ts',
        estimatedSavings: 200,
        suggestionFollowed: false,
        metadata: {}
      });

      metrics.record({
        source: 'enforcer-hook',
        blockedTool: 'Grep',
        recommendedTool: 'claude-context',
        target: 'pattern',
        estimatedSavings: 1500,
        suggestionFollowed: true,
        metadata: {}
      });
    });

    it('should query all metrics without filters', () => {
      const results = metrics.query();
      expect(results).toHaveLength(3);
    });

    it('should filter by source', () => {
      const results = metrics.query({ source: 'enforcer-hook' });
      expect(results).toHaveLength(2);
      expect(results.every(r => r.source === 'enforcer-hook')).toBe(true);
    });

    it('should filter by blocked tool', () => {
      const results = metrics.query({ blockedTool: 'Read' });
      expect(results).toHaveLength(1);
      expect(results[0].blockedTool).toBe('Read');
    });

    it('should filter by suggestion followed', () => {
      const results = metrics.query({ suggestionFollowed: true });
      expect(results).toHaveLength(2);
      expect(results.every(r => r.suggestionFollowed)).toBe(true);
    });

    it('should limit results', () => {
      const results = metrics.query({ limit: 2 });
      expect(results).toHaveLength(2);
    });

    it('should filter by time range', () => {
      const startTime = new Date(Date.now() - 1000);
      const results = metrics.query({ startTime });
      expect(results).toHaveLength(3);
    });
  });

  describe('getStats', () => {
    beforeEach(() => {
      // Insert varied test data
      metrics.record({
        source: 'enforcer-hook',
        blockedTool: 'Read',
        recommendedTool: 'serena',
        target: 'file1.ts',
        estimatedSavings: 100,
        actualTokensAvoided: 95,
        suggestionFollowed: true,
        metadata: {}
      });

      metrics.record({
        source: 'enforcer-hook',
        blockedTool: 'Read',
        recommendedTool: 'serena',
        target: 'file2.ts',
        estimatedSavings: 150,
        suggestionFollowed: false,
        metadata: {}
      });

      metrics.record({
        source: 'workflow',
        blockedTool: 'Grep',
        recommendedTool: 'claude-context',
        target: 'pattern',
        estimatedSavings: 1500,
        actualTokensAvoided: 1400,
        suggestionFollowed: true,
        metadata: {}
      });
    });

    it('should calculate overall statistics', () => {
      const stats = metrics.getStats();

      expect(stats.totalSuggestions).toBe(3);
      expect(stats.suggestionsFollowed).toBe(2);
      expect(stats.suggestionsIgnored).toBe(1);
      expect(stats.totalEstimatedSavings).toBe(1750);
      expect(stats.totalActualSavings).toBe(1495);
      expect(stats.followRate).toBe(67); // 2/3 = 66.67% rounded to 67
    });

    it('should group by blocked tool', () => {
      const stats = metrics.getStats();

      expect(stats.byBlockedTool['Read']).toEqual({
        count: 2,
        savings: 250
      });
      expect(stats.byBlockedTool['Grep']).toEqual({
        count: 1,
        savings: 1500
      });
    });

    it('should group by recommended tool', () => {
      const stats = metrics.getStats();

      expect(stats.byRecommendedTool['serena']).toEqual({
        count: 2,
        savings: 250
      });
      expect(stats.byRecommendedTool['claude-context']).toEqual({
        count: 1,
        savings: 1500
      });
    });

    it('should calculate average savings', () => {
      const stats = metrics.getStats();
      expect(stats.averageSavingsPerSuggestion).toBe(583); // 1750 / 3 = 583.33 rounded
    });

    it('should filter stats by source', () => {
      const stats = metrics.getStats({ source: 'enforcer-hook' });
      expect(stats.totalSuggestions).toBe(2);
      expect(stats.totalEstimatedSavings).toBe(250);
    });
  });

  describe('updateActualSavings', () => {
    it('should update actual token savings for a metric', () => {
      const metricId = metrics.record({
        source: 'enforcer-hook',
        blockedTool: 'Read',
        recommendedTool: 'serena',
        target: 'file.ts',
        estimatedSavings: 100,
        suggestionFollowed: true,
        metadata: {}
      });

      metrics.updateActualSavings(metricId, 95);

      const results = metrics.query({ limit: 1 });
      expect(results[0].actualTokensAvoided).toBe(95);
    });
  });

  describe('getSummaryReport', () => {
    beforeEach(() => {
      metrics.record({
        source: 'enforcer-hook',
        blockedTool: 'Read',
        recommendedTool: 'serena',
        target: 'file.ts',
        estimatedSavings: 100,
        suggestionFollowed: true,
        metadata: {}
      });
    });

    it('should generate a summary report', () => {
      const report = metrics.getSummaryReport(7);

      expect(report).toContain('Token Savings Report');
      expect(report).toContain('Total suggestions: 1');
      expect(report).toContain('Total estimated savings: 100 tokens');
      expect(report).toContain('By Blocked Tool:');
      expect(report).toContain('Read:');
    });
  });

  describe('getMetricsCollector singleton', () => {
    it('should return the same instance', () => {
      const instance1 = getMetricsCollector();
      const instance2 = getMetricsCollector();
      expect(instance1).toBe(instance2);
    });
  });
});
