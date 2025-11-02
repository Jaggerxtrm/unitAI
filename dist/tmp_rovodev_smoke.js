import { getToolDefinitions, executeTool } from "./tools/index.js";
import { logger } from "./utils/logger.js";
async function main() {
    // Ensure tools are registered by importing the tools index
    const tools = getToolDefinitions();
    logger.info(`Smoke Test: ${tools.length} tools registered`);
    const names = tools.map(t => t.name).sort();
    logger.info(`Tools: ${names.join(", ")}`);
    // Run a simple tool that doesn't require external CLIs
    const output = await executeTool("ping", { prompt: "smoke-test" });
    logger.info(`Ping output: ${output.trim()}`);
}
main().catch(err => {
    logger.error(`Smoke test failed: ${err instanceof Error ? err.message : String(err)}`);
    process.exit(1);
});
//# sourceMappingURL=tmp_rovodev_smoke.js.map