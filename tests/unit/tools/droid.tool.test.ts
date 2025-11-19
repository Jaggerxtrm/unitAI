import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("droidTool", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should pass auto level and attachments to executeAIClient", async () => {
    const mockExecuteAIClient = vi.fn().mockResolvedValue("droid-ok");

    vi.doMock("../../../src/utils/aiExecutor.js", async () => {
      const actual = await vi.importActual<any>(
        "../../../src/utils/aiExecutor.js"
      );
      return {
        ...actual,
        executeAIClient: mockExecuteAIClient
      };
    });

    const { droidTool } = await import(
      "../../../src/tools/droid.tool.js"
    );

    const result = await droidTool.execute({
      prompt: "Generate remediation plan",
      auto: "medium",
      files: ["/repo/logs/error.log"],
      sessionId: "session-1",
      skipPermissionsUnsafe: false,
      cwd: "/repo"
    });

    expect(result).toBe("droid-ok");
    expect(mockExecuteAIClient).toHaveBeenCalledWith(
      expect.objectContaining({
        backend: "droid",
        prompt: "Generate remediation plan",
        auto: "medium",
        attachments: ["/repo/logs/error.log"],
        sessionId: "session-1",
        cwd: "/repo"
      })
    );
  });

  it("should throw when prompt is empty", async () => {
    const { droidTool } = await import(
      "../../../src/tools/droid.tool.js"
    );

    await expect(
      droidTool.execute({ prompt: "" })
    ).rejects.toThrow();
  });
});

