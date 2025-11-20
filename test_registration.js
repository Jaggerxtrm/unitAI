
import { listWorkflowsTool } from './dist/src/tools/index.js';

async function test() {
    try {
        const result = await listWorkflowsTool.execute({}, async () => { });
        console.log(result);
    } catch (error) {
        console.error(error);
    }
}

test();
