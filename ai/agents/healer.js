const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

async function runHealer() {
    const failedTestPath = process.argv[2];
    const logPath = process.argv[3];
    const targetUrl = process.argv[4];

    if (!failedTestPath || !logPath || !targetUrl) {
        console.error('Usage: node ai/agents/healer.js <test-file> <log-file> <url>');
        process.exit(1);
    }

    console.log(`[Healer] Test failed: ${failedTestPath}`);
    console.log(`[Healer] Fetching latest DOM from ${targetUrl} to understand what changed...`);
    
    // 1. Re-explore to get latest state
    try {
        execSync(`node ai/agents/explorer.js "${targetUrl}"`, { stdio: 'inherit' });
    } catch (e) {
        console.error('[Healer] Explorer failed, proceeding with previous state if available.');
    }

    const statePath = path.resolve('artifacts/reports/app-state.json');
    const appState = fs.existsSync(statePath) ? JSON.parse(fs.readFileSync(statePath, 'utf-8')) : {};
    const trimmedElements = appState.interactableElements ? appState.interactableElements.slice(0, 50) : [];

    const failureLog = fs.readFileSync(path.resolve(logPath), 'utf-8');
    const originalCode = fs.readFileSync(path.resolve(failedTestPath), 'utf-8');
    const promptTemplate = fs.readFileSync(path.resolve('ai/prompts/healer.md'), 'utf-8');

    const fullPrompt = `${promptTemplate}
    
### Failure Log
\`\`\`
${failureLog}
\`\`\`

### Original Code
\`\`\`typescript
${originalCode}
\`\`\`

### Latest Application State (Current DOM Reality)
\`\`\`json
${JSON.stringify(trimmedElements, null, 2)}
\`\`\`
`;

    console.log('[Healer] Consulting AI to forge a fix...');
    const response = await fetch('http://127.0.0.1:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'qwen2.5-coder:7b', prompt: fullPrompt, stream: false })
    });

    const data = await response.json();
    const outputPath = path.resolve('artifacts/reports/healed-test-review.md');
    fs.writeFileSync(outputPath, data.response, 'utf-8');
    
    console.log(`[Healer] Fix proposed! Review it at: ${outputPath}`);
}

runHealer().catch(console.error);
