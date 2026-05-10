const fs = require('fs');
const path = require('path');

async function generateTest() {
    const statePath = path.resolve('artifacts/reports/app-state.json');
    if (!fs.existsSync(statePath)) {
        console.error(`State file not found: ${statePath}. Run explorer.js first.`);
        process.exit(1);
    }

    const appState = JSON.parse(fs.readFileSync(statePath, 'utf-8'));
    const promptPath = path.resolve('ai/prompts/generate-test.md');
    const promptTemplate = fs.readFileSync(promptPath, 'utf-8');

    // We constrain the arrays to avoid blowing up the context window for local models
    const trimmedElements = appState.interactableElements.slice(0, 50); 
    const trimmedAPIs = appState.apiRequests.slice(0, 20);

    const fullPrompt = `${promptTemplate}

### EXPLORATION DATA
Target URL: ${appState.url}

Interactable Elements (DOM subset):
\`\`\`json
${JSON.stringify(trimmedElements, null, 2)}
\`\`\`

Intercepted API Requests (subset):
\`\`\`json
${JSON.stringify(trimmedAPIs, null, 2)}
\`\`\`

Please generate a smoke test for this page checking that key elements are visible and any crucial APIs are handled.
Put it in a file like 'apps/web/tests/auto-smoke.spec.ts'.
`;

    console.log('Sending context to Ollama (qwen2.5-coder:7b)...');
    
    try {
        const response = await fetch('http://127.0.0.1:11434/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'qwen2.5-coder:7b',
                prompt: fullPrompt,
                stream: false
            })
        });

        if (!response.ok) {
            console.error('Ollama request failed:', await response.text());
            process.exit(1);
        }

        const data = await response.json();
        const generatedCode = data.response;

        const outputPath = path.resolve('artifacts/reports/generated-test-review.md');
        fs.mkdirSync(path.dirname(outputPath), { recursive: true });
        fs.writeFileSync(outputPath, generatedCode, 'utf-8');

        console.log(`\n=== Test Generation Complete ===\n`);
        console.log(`Review the generated code at: ${outputPath}`);
    } catch (e) {
        console.error('Failed to communicate with Ollama. Make sure it is running locally.', e.message);
        process.exit(1);
    }
}

generateTest().catch(console.error);
