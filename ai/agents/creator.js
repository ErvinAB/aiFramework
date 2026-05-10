const fs = require('fs');
const path = require('path');

async function runCreator() {
    const statePath = path.resolve('artifacts/reports/app-state.json');
    const strategyPath = path.resolve('artifacts/reports/test-strategy.md');

    if (!fs.existsSync(statePath) || !fs.existsSync(strategyPath)) {
        console.error('Required context files missing. Run Architect first.');
        process.exit(1);
    }

    const appState = JSON.parse(fs.readFileSync(statePath, 'utf-8'));
    const strategy = fs.readFileSync(strategyPath, 'utf-8');
    const promptTemplate = fs.readFileSync(path.resolve('ai/prompts/creator.md'), 'utf-8');

    const trimmedElements = appState.interactableElements.slice(0, 50); 

    const fullPrompt = `${promptTemplate}
    
### QA Architect Strategy
${strategy}

### Application State (Target: ${appState.url})
\`\`\`json
${JSON.stringify(trimmedElements, null, 2)}
\`\`\`
`;

    console.log('Creator Agent is writing the tests...');
    const response = await fetch('http://127.0.0.1:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'qwen2.5-coder:7b', prompt: fullPrompt, stream: false })
    });

    const data = await response.json();
    const outputPath = path.resolve('artifacts/reports/generated-test-review.md');
    fs.writeFileSync(outputPath, data.response, 'utf-8');
    console.log(`Test Code saved to: ${outputPath}`);
}

runCreator().catch(console.error);
