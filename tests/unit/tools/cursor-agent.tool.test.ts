import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("cursorAgentTool", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should forward arguments to executeAIClient", async () => {
    const mockExecuteAIClient = vi.fn().mockResolvedValue("ok");

    vi.doMock("../../../src/utils/aiExecutor.js", async () => {
      const actual = await vi.importActual<any>(
        "../../../src/utils/aiExecutor.js"
      );
      return {
        ...actual,
        executeAIClient: mockExecuteAIClient
      };
    });

    const { cursorAgentTool } = await import(
      "../../../src/tools/cursor-agent.tool.js"
    );

    const result = await cursorAgentTool.execute({
      prompt: "Refactor the workflow",
      model: "gpt-5.1",
      projectRoot: "/repo",
      files: ["/repo/src/workflows/example.ts"],
      autoApprove: true,
      outputFormat: "json"
    });

    expect(result).toBe("ok");
    expect(mockExecuteAIClient).toHaveBeenCalledWith(
      expect.objectContaining({
        backend: "cursor-agent",
        prompt: "Refactor the workflow",
        attachments: ["/repo/src/workflows/example.ts"],
        projectRoot: "/repo",
        autoApprove: true,
        outputFormat: "json"
      })
    );
  });

  it("should throw when prompt is empty", async () => {
    const { cursorAgentTool } = await import(
      "../../../src/tools/cursor-agent.tool.js"
    );

    await expect(
      cursorAgentTool.execute({ prompt: "" })
    ).rejects.toThrow();
  });
});

