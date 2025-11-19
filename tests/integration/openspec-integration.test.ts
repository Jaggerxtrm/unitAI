import { describe, it, expect, beforeAll } from "vitest";
import "../../src/tools/index.js";
import { toolRegistry } from "../../src/tools/registry.js";
import { listWorkflows, getWorkflow, getWorkflowSchema } from "../../src/workflows/index.js";
import {
  openspecInitTool,
  openspecProposalTool,
  openspecApplyTool,
  openspecArchiveTool,
  openspecListTool,
  openspecShowTool
} from "../../src/tools/openspec/index.js";

describe("OpenSpec Integration Tests", () => {
  describe("Tool Registration", () => {
    it("should have all OpenSpec tools registered", () => {
      const registeredToolNames = toolRegistry.map(tool => tool.name);

      expect(registeredToolNames).toContain("openspec-init");
      expect(registeredToolNames).toContain("openspec-proposal");
      expect(registeredToolNames).toContain("openspec-apply");
      expect(registeredToolNames).toContain("openspec-archive");
      expect(registeredToolNames).toContain("openspec-list");
      expect(registeredToolNames).toContain("openspec-show");
    });

    it("should export all OpenSpec tools", () => {
      expect(openspecInitTool).toBeDefined();
      expect(openspecInitTool.name).toBe("openspec-init");
      expect(openspecInitTool.description).toContain("initialize");

      expect(openspecProposalTool).toBeDefined();
      expect(openspecProposalTool.name).toBe("openspec-proposal");

      expect(openspecApplyTool).toBeDefined();
      expect(openspecApplyTool.name).toBe("openspec-apply");

      expect(openspecArchiveTool).toBeDefined();
      expect(openspecArchiveTool.name).toBe("openspec-archive");

      expect(openspecListTool).toBeDefined();
      expect(openspecListTool.name).toBe("openspec-list");

      expect(openspecShowTool).toBeDefined();
      expect(openspecShowTool.name).toBe("openspec-show");
    });

    it("should have valid Zod schemas for all tools", () => {
      const tools = [openspecInitTool, openspecProposalTool, openspecApplyTool, openspecArchiveTool, openspecListTool, openspecShowTool];

      for (const tool of tools) {
        expect(tool.zodSchema).toBeDefined();
        expect(typeof tool.zodSchema.parse).toBe("function");

        // Test basic schema validation
        if (tool.name === "openspec-init") {
          expect(() => tool.zodSchema.parse({})).not.toThrow();
          expect(() => tool.zodSchema.parse({ aiTools: ["claude-code"] })).not.toThrow();
        }

        if (tool.name === "openspec-proposal") {
          expect(() => tool.zodSchema.parse({ description: "test" })).not.toThrow();
          expect(() => tool.zodSchema.parse({})).toThrow(); // description required
        }
      }
    });
  });

  describe("Workflow Registration", () => {
    it("should have openspec-driven-development workflow registered", () => {
      const workflows = listWorkflows();
      expect(workflows).toContain("openspec-driven-development");
    });

    it("should be able to get the workflow definition", () => {
      const workflow = getWorkflow("openspec-driven-development");
      expect(workflow).toBeDefined();
      expect(workflow?.name).toBe("openspec-driven-development");
      expect(workflow?.description).toContain("spec-driven development");
    });

    it("should have valid workflow schema", () => {
      const schema = getWorkflowSchema("openspec-driven-development");
      expect(schema).toBeDefined();

      // Test schema validation
      expect(() => schema?.parse({
        featureDescription: "Test feature",
        changeType: "feature",
        implementationApproach: "incremental",
        autonomyLevel: "low"
      })).not.toThrow();

      // Test required fields
      expect(() => schema?.parse({})).toThrow(); // featureDescription required
    });
  });

  describe("Tool Functionality", () => {
    it("should handle openspec-init tool execution (basic validation)", async () => {
      // Test that the tool can be called without throwing
      // Note: Actual execution may fail due to missing OpenSpec CLI, but the tool structure should be valid

      let progressMessage = "";
      const onProgress = (msg: string) => { progressMessage = msg; };

      try {
        // This may fail due to missing OpenSpec CLI, but should not throw structural errors
        await openspecInitTool.execute({}, onProgress);
      } catch (error: any) {
        // Expected to fail in test environment without OpenSpec CLI
        expect(error.message).toContain("OpenSpec");
        expect(progressMessage).toContain("Initializing");
      }
    });

    it("should handle openspec-list tool execution (basic validation)", async () => {
      let progressMessage = "";
      const onProgress = (msg: string) => { progressMessage = msg; };

      try {
        await openspecListTool.execute({}, onProgress);
      } catch (error: any) {
        expect(error.message).toContain("OpenSpec");
        expect(progressMessage).toContain("Listing");
      }
    });
  });

  describe("Workflow Integration", () => {
    it("should validate workflow parameters correctly", () => {
      const schema = getWorkflowSchema("openspec-driven-development");

      // Valid parameters
      const validParams = {
        featureDescription: "Add user authentication",
        changeType: "feature" as const,
        implementationApproach: "incremental" as const,
        autonomyLevel: "low" as const,
        validationBackends: ["ask-gemini"]
      };

      expect(() => schema?.parse(validParams)).not.toThrow();

      // Invalid parameters
      expect(() => schema?.parse({})).toThrow(); // missing required fields
      expect(() => schema?.parse({
        featureDescription: "Test",
        changeType: "invalid" as any // invalid enum value
      })).toThrow();
    });

    it("should have proper workflow metadata", () => {
      const workflow = getWorkflow("openspec-driven-development");

      expect(workflow?.name).toBe("openspec-driven-development");
      expect(workflow?.description).toContain("spec-driven development");
      expect(workflow?.description).toContain("OpenSpec integration");
      expect(typeof workflow?.execute).toBe("function");
    });
  });

  describe("Error Handling", () => {
    it("should handle invalid tool parameters gracefully", async () => {
      // Test openspec-show with missing required parameter
      try {
        await openspecShowTool.execute({}, () => {});
        expect.fail("Should have thrown error for missing changeId");
      } catch (error: any) {
        expect(error.message).toContain("changeId");
      }

      // Test openspec-apply with missing required parameter
      try {
        await openspecApplyTool.execute({}, () => {});
        expect.fail("Should have thrown error for missing changeId");
      } catch (error: any) {
        expect(error.message).toContain("changeId");
      }
    });
  });

  describe("Language Agnostic Design", () => {
    it("should have tools designed for multiple languages", () => {
      // Verify that tools don't have hardcoded language assumptions
      const allTools = [openspecInitTool, openspecProposalTool, openspecApplyTool, openspecArchiveTool, openspecListTool, openspecShowTool];

      for (const tool of allTools) {
        // Tools should work with any programming language
        expect(tool.description).not.toMatch(/javascript|typescript|python|go|rust/i);
        expect(tool.name).toMatch(/^openspec-/);
      }
    });

    it("should have workflow that supports multiple implementation approaches", () => {
      const workflow = getWorkflow("openspec-driven-development");
      const description = workflow?.description || "";

      // Should mention multiple languages or language-agnostic nature
      expect(description).toMatch(/multiple|various|any|agnostic/i);
    });
  });
});
