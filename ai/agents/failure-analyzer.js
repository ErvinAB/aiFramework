const fs = require('fs');
const path = require('path');

async function main() {
    const reportPath = process.argv[2];

    if (!reportPath) {
        console.error('Usage: node ai/agents/failure-analyzer.js <path-to-failure-log>');
        process.exit(1);
    }

    const absoluteReportPath = path.resolve(reportPath);

    if (!fs.existsSync(absoluteReportPath)) {
        console.error(`File not found: ${absoluteReportPath}`);
        process.exit(1);
    }

    const promptPath = path.resolve('ai/prompts/debug-failure.md');
    const promptTemplate = fs.readFileSync(promptPath, 'utf-8');
    const failureText = fs.readFileSync(absoluteReportPath, 'utf-8');

    const fullPrompt = `${promptTemplate}

Failure log:
\`\`\`
${failureText}
\`\`\`
`;

    const response = await fetch('http://127.0.0.1:11434/api/generate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: 'qwen2.5-coder:7b',
            prompt: fullPrompt,
            stream: false
        })
    });

    if (!response.ok) {
        const text = await response.text();
        console.error('Ollama request failed:', text);
        process.exit(1);
    }

    const data = await response.json();
    const analysis = data.response;

    const outputPath = path.resolve('artifacts/reports/ai-failure-analysis.md');
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, analysis, 'utf-8');

    console.log('\n=== AI Failure Analysis ===\n');
    console.log(analysis);
    console.log(`\nSaved to: ${outputPath}`);
}

main().catch((err) => {
    console.error('Unexpected error:', err);
    process.exit(1);
});