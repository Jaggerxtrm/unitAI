import { spawn } from "child_process";
import { logger } from "./logger.js";
export async function executeCommand(command, args, options = {}) {
    const { onProgress, timeout = 600000 } = options; // 10 minute default timeout
    return new Promise((resolve, reject) => {
        logger.debug(`Executing: ${command} ${args.join(" ")}`);
        let stdout = "";
        let stderr = "";
        let progressInterval = null;
        const child = spawn(command, args, {
            shell: false,
            stdio: ["pipe", "pipe", "pipe"] // Changed from "ignore" to "pipe" for stdin
        });
        // Close stdin immediately - we don't need to send input
        // This prevents child processes from hanging waiting for input
        child.stdin?.end();
        // Progress monitoring
        if (onProgress) {
            progressInterval = setInterval(() => {
                const preview = stdout.slice(-200) || stderr.slice(-200);
                logger.progress(`Executing... (stdout: ${stdout.length} chars, stderr: ${stderr.length} chars) Latest: ${preview.slice(-100)}`);
            }, 5000);
        }
        // Timeout handling
        const timeoutHandle = setTimeout(() => {
            child.kill();
            reject(new Error(`Command timed out after ${timeout}ms`));
        }, timeout);
        // Capture stdout
        child.stdout?.on("data", (data) => {
            const chunk = data.toString();
            stdout += chunk;
            if (onProgress) {
                onProgress(chunk);
            }
        });
        // Capture stderr
        child.stderr?.on("data", (data) => {
            stderr += data.toString();
        });
        // Handle process errors
        child.on("error", (error) => {
            clearTimeout(timeoutHandle);
            if (progressInterval)
                clearInterval(progressInterval);
            logger.error(`Command error: ${error.message}`);
            reject(error);
        });
        // Handle process exit
        child.on("close", (exitCode, signal) => {
            clearTimeout(timeoutHandle);
            if (progressInterval)
                clearInterval(progressInterval);
            logger.debug(`Command exited with code ${exitCode}, signal ${signal}`);
            if (exitCode !== 0) {
                const errorMsg = `Command failed with exit code ${exitCode}: ${stderr}`;
                logger.error(errorMsg);
                reject(new Error(errorMsg));
            }
            else {
                resolve(stdout);
            }
        });
    });
}
//# sourceMappingURL=commandExecutor.js.map