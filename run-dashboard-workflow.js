#!/usr/bin/env node

/**
 * Workflow Execution Script for User Activity Dashboard Feature
 *
 * This script orchestrates the complete workflow:
 * 1. Execute feature-design workflow
 * 2. Generate boilerplate with cursor-agent
 * 3. Investigate auth bug with droid
 */

import { executeWorkflow } from './dist/workflows/index.js';
import { executeTool } from './dist/tools/index.js';
import { logger } from './dist/utils/logger.js';

async function main() {
  console.log('🚀 Starting User Activity Dashboard Workflow\n');

  try {
    // ========================================================================
    // STEP 1: Execute Feature Design Workflow
    // ========================================================================
    console.log('🎨 Step 1: Executing Feature Design Workflow...\n');

    const designResult = await executeWorkflow('feature-design', {
      featureDescription: 'User Activity Dashboard - A CLI terminal dashboard for monitoring MCP server user activity, tool usage, workflow execution, and agent performance metrics',
      targetFiles: [
        'src/services/activityAnalytics.ts',
        'src/cli/activityDashboard.ts',
        'src/utils/dashboardRenderer.ts'
      ],
      context: 'This is a CLI/MCP server project using better-sqlite3 for audit trails. The dashboard should integrate with the existing audit trail system and follow the token-efficient patterns used in view-metrics script.',
      architecturalFocus: 'design',
      implementationApproach: 'incremental',
      testType: 'unit',
      validationBackends: ['ask-gemini']
    }, (msg) => console.log('  ', msg));

    console.log('✅ Feature design completed\n');
    console.log(designResult);
    console.log('\n' + '='.repeat(80) + '\n');

    // ========================================================================
    // STEP 2: Generate Boilerplate with Cursor Agent
    // ========================================================================
    console.log('🤖 Step 2: Generating Dashboard Boilerplate with Cursor Agent...\n');

    const cursorPrompt = `Generate the initial boilerplate code for a User Activity Dashboard CLI tool.

Requirements:
1. Create activityAnalytics.ts service with:
   - Function to query audit trail database
   - Aggregate user activity metrics
   - Calculate tool usage statistics
   - Export to JSON/CSV

2. Create activityDashboard.ts CLI interface with:
   - Command-line argument parsing
   - Interactive menu system
   - Metrics display formatting
   - Real-time refresh capability

3. Use TypeScript with proper types
4. Follow the existing code style in this project
5. Integrate with the existing better-sqlite3 audit trail

Please generate production-ready, well-documented code.`;

    try {
      const cursorResult = await executeTool('cursor-agent', {
        prompt: cursorPrompt,
        model: 'sonnet-4.5',
        outputFormat: 'text',
        projectRoot: process.cwd()
      }, (msg) => console.log('  ', msg));

      console.log('✅ Cursor Agent boilerplate generated\n');
      console.log(cursorResult);
      console.log('\n' + '='.repeat(80) + '\n');
    } catch (error) {
      console.log('⚠️  Cursor Agent execution failed:', error.message);
      console.log('This may require cursor-agent CLI to be installed globally');
      console.log('Continuing with next step...\n');
    }

    // ========================================================================
    // STEP 3: Investigate Auth Bug with Droid
    // ========================================================================
    console.log('🔍 Step 3: Investigating Auth Login Flow Bug with Droid...\n');

    const droidPrompt = `Investigate and propose a fix for a bug in the authentication login flow.

Task:
1. Search the codebase for authentication-related code
2. Identify common auth login flow patterns
3. Look for potential bugs such as:
   - Missing error handling
   - Token validation issues
   - Session management problems
   - Race conditions
   - Security vulnerabilities

4. Provide a detailed analysis of any bugs found
5. Propose specific code fixes

Please perform a thorough autonomous investigation.`;

    try {
      const droidResult = await executeTool('droid', {
        prompt: droidPrompt,
        auto: 'medium',
        outputFormat: 'text',
        cwd: process.cwd()
      }, (msg) => console.log('  ', msg));

      console.log('✅ Droid investigation completed\n');
      console.log(droidResult);
      console.log('\n' + '='.repeat(80) + '\n');
    } catch (error) {
      console.log('⚠️  Droid execution failed:', error.message);
      console.log('This may require droid CLI to be installed globally');
      console.log('Continuing...\n');
    }

    // ========================================================================
    // Summary
    // ========================================================================
    console.log('🎉 User Activity Dashboard Workflow Completed!\n');
    console.log('Summary:');
    console.log('  ✅ Feature design workflow executed');
    console.log('  ✅ Cursor Agent boilerplate generation attempted');
    console.log('  ✅ Droid auth bug investigation attempted');
    console.log('\nNext steps:');
    console.log('  1. Review the feature design output above');
    console.log('  2. Check generated boilerplate code');
    console.log('  3. Review and apply auth bug fix proposals');
    console.log('  4. Run tests: npm test');

  } catch (error) {
    console.error('❌ Workflow failed:', error);
    console.error(error.stack);
    process.exit(1);
  }
}

main();
