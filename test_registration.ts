
import { listWorkflowsTool } from './src/tools/meta/list_workflows.tool.js';

async function test() {
    try {
        const result = await listWorkflowsTool.execute({}, async () => { });
        console.log(result);
    } catch (error) {
        console.error(error);
    }
}

test();
