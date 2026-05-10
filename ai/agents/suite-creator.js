const fs = require('fs');
const path = require('path');

async function runSuiteCreator() {
    const suiteType = process.argv[2] || 'smoke';
    const statePath = path.resolve('artifacts/reports/app-state.json');
    const strategyPath = path.resolve('artifacts/reports/test-strategy.md');
    const pomPath = path.resolve('artifacts/reports/GeneratedPOM.md');

    if (!fs.existsSync(pomPath)) {
        console.error('POM missing. Run POM Generator first.');
        process.exit(1);
    }

    const auditPath = path.resolve('artifacts/reports/audit-result.json');
    const audit = fs.existsSync(auditPath) ? JSON.parse(fs.readFileSync(auditPath, 'utf-8')) : { scenarios: [] };
    
    // Simple check: if any scenario matching the suite name is marked as SKIP, we skip.
    const scenario = audit.scenarios.find(s => s.name.toLowerCase().includes(suiteType.toLowerCase()));
    if (scenario && scenario.action === 'SKIP') {
        console.log(`[Suite Creator] Skipping ${suiteType.toUpperCase()} suite as requested by Auditor.`);
        return;
    }

    const appState = JSON.parse(fs.readFileSync(statePath, 'utf-8'));
    const strategy = fs.readFileSync(strategyPath, 'utf-8');
    const pomCode = fs.readFileSync(pomPath, 'utf-8');
    const promptTemplate = fs.readFileSync(path.resolve('ai/prompts/suite-creator.md'), 'utf-8');

    // If updating, fetch existing code
    let existingCode = '';
    if (scenario && scenario.action === 'UPDATE' && fs.existsSync(path.resolve(scenario.file))) {
        existingCode = fs.readFileSync(path.resolve(scenario.file), 'utf-8');
        console.log(`[Suite Creator] Existing ${suiteType} test found. Instructing AI to update/improve it...`);
    }

    const trimmedAPIs = appState.apiRequests ? appState.apiRequests.slice(0, 20) : [];

    const fullPrompt = `${promptTemplate}
    
### Requested Suite Type
${suiteType.toUpperCase()}

### Action
${scenario ? scenario.action : 'CREATE'}

### Existing Test Code (if UPDATE)
\`\`\`typescript
${existingCode}
\`\`\`

### Architect's Strategy
${strategy}

### Captured API Requests
\`\`\`json
${JSON.stringify(trimmedAPIs, null, 2)}
\`\`\`

### Generated Page Object Model
${pomCode}

If the action is UPDATE, only improve or add the missing steps. Ensure the // @auto-generated tag is preserved.
`;

    console.log(`[Suite Creator] Writing ${suiteType.toUpperCase()} suite...`);
    const response = await fetch('http://127.0.0.1:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'qwen2.5-coder:7b', prompt: fullPrompt, stream: false })
    });

    const data = await response.json();
    const outputPath = path.resolve(`artifacts/reports/${suiteType}-suite-review.md`);
    fs.writeFileSync(outputPath, data.response, 'utf-8');
    console.log(`[Suite Creator] ${suiteType} suite saved to: ${outputPath}`);
}

runSuiteCreator().catch(console.error);
