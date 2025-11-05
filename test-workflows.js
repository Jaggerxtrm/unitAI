#!/usr/bin/env node

// Script di test per i workflow Smart Workflows
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Funzione per testare un workflow
async function testWorkflow(workflowName, params = {}) {
  return new Promise((resolve, reject) => {
    console.log(`\n🧪 Testando workflow: ${workflowName}`);
    console.log(`📋 Parametri:`, JSON.stringify(params, null, 2));
    
    const request = {
      jsonrpc: "2.0",
      id: Date.now(),
      method: "tools/call",
      params: {
        name: "smart-workflows",
        arguments: {
          workflow: workflowName,
          params: params
        }
      }
    };
    
    // Esegui il server MCP
    const serverProcess = spawn('node', [join(__dirname, 'dist/index.js')], {
      stdio: ['pipe', 'pipe', 'pipe'],
      cwd: __dirname
    });
    
    let response = '';
    let hasResponded = false;
    
    // Gestisci l'output
    serverProcess.stdout.on('data', (data) => {
      response += data.toString();
      
      // Prova a processare le risposte
      const lines = response.trim().split('\n');
      for (const line of lines) {
        if (line.trim() && !hasResponded) {
          try {
            const parsed = JSON.parse(line);
            if (parsed.id === request.id) {
              hasResponded = true;
              console.log('\n✅ Risposta ricevuta:');
              if (parsed.result && parsed.result.content) {
                const content = parsed.result.content;
                console.log(content.substring(0, 500) + (content.length > 500 ? '...' : ''));
              }
              serverProcess.kill();
              resolve(parsed.result);
              return;
            }
          } catch (e) {
            // Ignora errori di parsing parziali
          }
        }
      }
    });
    
    serverProcess.stderr.on('data', (data) => {
      process.stderr.write(data);
    });
    
    // Invia la richiesta dopo che il server è avviato
    setTimeout(() => {
      if (!hasResponded) {
        serverProcess.stdin.write(JSON.stringify(request) + '\n');
      }
    }, 2000);
    
    // Timeout dopo 30 secondi
    setTimeout(() => {
      if (!hasResponded) {
        console.log('\n⏰ Timeout del test');
        serverProcess.kill();
        reject(new Error('Timeout del test'));
      }
    }, 30000);
    
    serverProcess.on('close', (code) => {
      if (!hasResponded) {
        console.log(`\n🔚 Server chiuso con codice: ${code}`);
        if (code !== 0) {
          reject(new Error(`Server terminato con errore: ${code}`));
        }
      }
    });
  });
}

// Test principali
async function runTests() {
  console.log('🚀 Inizio test dei Smart Workflows\n');
  
  try {
    // Test 1: init-session
    console.log('\n=== Test 1: init-session ===');
    await testWorkflow('init-session');
    
    // Attendi un po' tra i test
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Test 2: validate-last-commit
    console.log('\n=== Test 2: validate-last-commit ===');
    await testWorkflow('validate-last-commit');
    
    console.log('\n🏁 Test completati con successo');
  } catch (error) {
    console.error('\n❌ Errore durante i test:', error.message);
  }
}

// Esegui i test
runTests().catch(console.error);
