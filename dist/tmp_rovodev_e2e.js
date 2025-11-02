import { executeTool } from "./tools/index.js";
import { logger } from "./utils/logger.js";
async function runTool(name, args) {
    try {
        logger.info(`Running tool: ${name}`);
        const out = await executeTool(name, args);
        logger.info(`SUCCESS: ${name} ->\n${out.substring(0, 400)}${out.length > 400 ? "..." : ""}`);
        return { name, ok: true };
    }
    catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        logger.error(`FAIL: ${name} -> ${msg}`);
        return { name, ok: false, error: msg };
    }
}
async function main() {
    const results = [];
    // Help tools (do not require prompts)
    results.push(await runTool("gemini-help", {}));
    results.push(await runTool("qwen-help", {}));
    results.push(await runTool("rovodev-help", {}));
    // ask-gemini should now default to PRO
    results.push(await runTool("ask-gemini", { prompt: "Say hello from E2E test (expect PRO default)" }));
    const summary = results.map(r => `${r.name}: ${r.ok ? "OK" : `ERROR (${r.error})`}`).join("\n");
    logger.info(`E2E summary:\n${summary}`);
}
main().catch(err => {
    logger.error(`E2E runner crashed: ${err instanceof Error ? err.message : String(err)}`);
    process.exit(1);
});
//# sourceMappingURL=tmp_rovodev_e2e.js.map