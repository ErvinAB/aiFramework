const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

async function runDataForger() {
    const statePath = path.resolve('artifacts/reports/app-state.json');
    if (!fs.existsSync(statePath)) {
        console.error('State file not found. Run explorer first.');
        process.exit(1);
    }

    const appState = JSON.parse(fs.readFileSync(statePath, 'utf-8'));
    const promptTemplate = fs.readFileSync(path.resolve('ai/prompts/data-forger.md'), 'utf-8');

    // Only extract inputs for data forgery
    const inputs = appState.interactableElements ? appState.interactableElements.filter(el => el.tag === 'input' || el.tag === 'textarea' || el.tag === 'select') : [];
    
    if (inputs.length === 0) {
        console.log('[Data Forger] No inputs found on page, skipping data generation.');
        return;
    }

    const fullPrompt = `${promptTemplate}
    
### Application Inputs
\`\`\`json
${JSON.stringify(inputs, null, 2)}
\`\`\`
`;

    console.log('[Data Forger] Fabricating realistic test dataset...');
    const response = await fetch('http://127.0.0.1:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'qwen2.5-coder:7b', prompt: fullPrompt, stream: false })
    });

    const data = await response.json();
    
    // Extract the javascript block
    const match = data.response.match(/```javascript\n([\s\S]*?)```/);
    if (!match) {
        console.error('[Data Forger] Failed to parse generated JS script.');
        return;
    }

    const scriptCode = match[1];
    const scriptPath = path.resolve('artifacts/scripts/forge-data.js');
    fs.mkdirSync(path.dirname(scriptPath), { recursive: true });
    fs.writeFileSync(scriptPath, scriptCode, 'utf-8');

    // Execute the script to generate the JSON
    try {
        const generatedJson = execSync(`node ${scriptPath}`).toString().trim();
        const fixturePath = path.resolve('artifacts/fixtures/test-data.json');
        fs.mkdirSync(path.dirname(fixturePath), { recursive: true });
        fs.writeFileSync(fixturePath, generatedJson, 'utf-8');
        console.log(`[Data Forger] Massive dataset fabricated successfully! Saved to: ${fixturePath}`);
    } catch (e) {
        console.error('[Data Forger] Failed to execute forging script:', e.message);
    }
}

runDataForger().catch(console.error);
