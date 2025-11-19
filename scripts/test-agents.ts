#!/usr/bin/env tsx
/**
 * Integration Test Script for Agent System
 *
 * This script validates:
 * - Agent factory instantiation
 * - Agent configuration
 * - Input validation
 * - Metadata structure
 *
 * Note: This is a smoke test that validates structure without calling AI backends
 */

import { AgentFactory, AgentType } from "../src/agents/index.js";
import { AutonomyLevel } from "../src/utils/permissionManager.js";
import type { AgentConfig } from "../src/agents/types.js";

// ANSI color codes for output
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m"
};

function log(message: string, color = colors.reset): void {
  console.log(`${color}${message}${colors.reset}`);
}

function logSection(title: string): void {
  console.log("\n" + "=".repeat(60));
  log(title, colors.cyan);
  console.log("=".repeat(60));
}

function logTest(name: string, passed: boolean): void {
  const icon = passed ? "✓" : "✗";
  const color = passed ? colors.green : colors.red;
  log(`${icon} ${name}`, color);
}

// Test results tracker
let totalTests = 0;
let passedTests = 0;

function test(name: string, fn: () => boolean | Promise<boolean>): void {
  totalTests++;
  try {
    const result = fn();
    if (result instanceof Promise) {
      result.then(passed => {
        logTest(name, passed);
        if (passed) passedTests++;
      });
    } else {
      logTest(name, result);
      if (result) passedTests++;
    }
  } catch (error) {
    logTest(name, false);
    log(`  Error: ${error}`, colors.red);
  }
}

// ============================================================================
// TEST 1: Factory Instantiation
// ============================================================================

logSection("TEST 1: Factory Instantiation");

test("Can create ArchitectAgent via factory", () => {
  const agent = AgentFactory.createArchitect();
  return agent.name === "ArchitectAgent" &&
         agent.description.length > 0 &&
         agent.preferredBackend === "gemini";
});

test("Can create ImplementerAgent via factory", () => {
  const agent = AgentFactory.createImplementer();
  return agent.name === "ImplementerAgent" &&
         agent.description.length > 0 &&
         agent.preferredBackend === "droid" &&
         agent.fallbackBackend === undefined;
});

test("Can create TesterAgent via factory", () => {
  const agent = AgentFactory.createTester();
  return agent.name === "TesterAgent" &&
         agent.description.length > 0 &&
         agent.preferredBackend === "cursor-agent";
});

test("Can create agents dynamically by type", () => {
  const architect = AgentFactory.createAgent(AgentType.ARCHITECT);
  const implementer = AgentFactory.createAgent(AgentType.IMPLEMENTER);
  const tester = AgentFactory.createAgent(AgentType.TESTER);

  return architect.name === "ArchitectAgent" &&
         implementer.name === "ImplementerAgent" &&
         tester.name === "TesterAgent";
});

test("Factory throws error for unknown agent type", () => {
  try {
    AgentFactory.createAgent("unknown" as any);
    return false;
  } catch (error) {
    return error instanceof Error && error.message.includes("Unknown agent type");
  }
});

// ============================================================================
// TEST 2: Agent Registry
// ============================================================================

logSection("TEST 2: Agent Registry");

test("getAvailableAgents returns all agents", () => {
  const agents = AgentFactory.getAvailableAgents();
  return agents.length === 3 &&
         agents.some(a => a.type === AgentType.ARCHITECT) &&
         agents.some(a => a.type === AgentType.IMPLEMENTER) &&
         agents.some(a => a.type === AgentType.TESTER);
});

test("Agent metadata contains required fields", () => {
  const agents = AgentFactory.getAvailableAgents();
  return agents.every(agent =>
    agent.type &&
    agent.name &&
    agent.description &&
    agent.preferredBackend &&
    agent.specialization
  );
});

test("getAgentByName finds agents correctly", () => {
  const byName = AgentFactory.getAgentByName("ArchitectAgent");
  const byType = AgentFactory.getAgentByName("architect");

  return byName?.name === "ArchitectAgent" &&
         byType?.name === "ArchitectAgent";
});

test("getAgentByName returns undefined for unknown name", () => {
  const agent = AgentFactory.getAgentByName("NonExistentAgent");
  return agent === undefined;
});

// ============================================================================
// TEST 3: Agent Configuration
// ============================================================================

logSection("TEST 3: Agent Configuration");

test("AgentConfig accepts all autonomy levels", () => {
  const levels = [
    AutonomyLevel.READ_ONLY,
    AutonomyLevel.LOW,
    AutonomyLevel.MEDIUM,
    AutonomyLevel.HIGH
  ];

  return levels.every(level => {
    const config: AgentConfig = {
      autonomyLevel: level,
      onProgress: (msg) => {},
      timeout: 5000
    };
    return config.autonomyLevel === level;
  });
});

test("AgentConfig accepts optional onProgress", () => {
  const config1: AgentConfig = {
    autonomyLevel: AutonomyLevel.LOW
  };

  const config2: AgentConfig = {
    autonomyLevel: AutonomyLevel.LOW,
    onProgress: (msg) => console.log(msg)
  };

  return config1.onProgress === undefined && typeof config2.onProgress === "function";
});

// ============================================================================
// TEST 4: Input Validation
// ============================================================================

logSection("TEST 4: Input Validation");

test("ArchitectAgent validates empty task", () => {
  const agent = AgentFactory.createArchitect();
  const valid1 = agent.validateInput?.({ task: "" });
  const valid2 = agent.validateInput?.({ task: "Design system architecture" });

  return valid1 === false && valid2 === true;
});

test("ImplementerAgent validates empty task and files", () => {
  const agent = AgentFactory.createImplementer();
  const valid1 = agent.validateInput?.({ task: "", targetFiles: [] });
  const valid2 = agent.validateInput?.({ task: "Implement feature", targetFiles: [] });
  const valid3 = agent.validateInput?.({ task: "Implement feature", targetFiles: ["file.ts"] });

  return valid1 === false && valid2 === false && valid3 === true;
});

test("TesterAgent validates empty targetCode", () => {
  const agent = AgentFactory.createTester();
  const valid1 = agent.validateInput?.({ targetCode: "" });
  const valid2 = agent.validateInput?.({ targetCode: "function test() {}" });

  return valid1 === false && valid2 === true;
});

// ============================================================================
// TEST 5: Backend Configuration
// ============================================================================

logSection("TEST 5: Backend Configuration");

test("ArchitectAgent uses Gemini with no fallback", () => {
  const agent = AgentFactory.createArchitect();
  return agent.preferredBackend === "gemini" && agent.fallbackBackend === undefined;
});

test("ImplementerAgent uses Droid with no fallback", () => {
  const agent = AgentFactory.createImplementer();
  return agent.preferredBackend === "droid" && agent.fallbackBackend === undefined;
});

test("TesterAgent uses Cursor-Agent with no fallback", () => {
  const agent = AgentFactory.createTester();
  return agent.preferredBackend === "cursor-agent" && agent.fallbackBackend === undefined;
});

// ============================================================================
// SUMMARY
// ============================================================================

setTimeout(() => {
  logSection("TEST SUMMARY");
  const percentage = Math.round((passedTests / totalTests) * 100);
  const allPassed = passedTests === totalTests;

  log(`Total Tests: ${totalTests}`, colors.blue);
  log(`Passed: ${passedTests}`, allPassed ? colors.green : colors.yellow);
  log(`Failed: ${totalTests - passedTests}`, allPassed ? colors.green : colors.red);
  log(`Success Rate: ${percentage}%`, allPassed ? colors.green : colors.yellow);

  console.log("\n" + "=".repeat(60) + "\n");

  if (allPassed) {
    log("🎉 All tests passed! Agent system is ready for use.", colors.green);
  } else {
    log("⚠️  Some tests failed. Please review the errors above.", colors.yellow);
  }

  process.exit(allPassed ? 0 : 1);
}, 100);
