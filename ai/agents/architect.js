const fs = require('fs');
const path = require('path');

async function runArchitect() {
    const statePath = path.resolve('artifacts/reports/app-state.json');
    if (!fs.existsSync(statePath)) {
        console.error('State file not found. Run explorer first.');
        process.exit(1);
    }

    const appState = JSON.parse(fs.readFileSync(statePath, 'utf-8'));
    const promptPath = path.resolve('ai/prompts/architect.md');
    const promptTemplate = fs.readFileSync(promptPath, 'utf-8');

    const trimmedElements = appState.interactableElements.slice(0, 50); 

    const fullPrompt = `${promptTemplate}\n\n### Application State (Target: ${appState.url})\n\`\`\`json\n${JSON.stringify(trimmedElements, null, 2)}\n\`\`\``;

    console.log('Architect Agent is designing the strategy...');
    const response = await fetch('http://127.0.0.1:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'qwen2.5-coder:7b', prompt: fullPrompt, stream: false })
    });

    const data = await response.json();
    const strategyPath = path.resolve('artifacts/reports/test-strategy.md');
    fs.writeFileSync(strategyPath, data.response, 'utf-8');
    console.log(`Strategy saved to: ${strategyPath}`);
}

runArchitect().catch(console.error);
