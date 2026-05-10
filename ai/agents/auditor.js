const fs = require('fs');
const path = require('path');

function getFilesRecursively(dir, fileList = []) {
    if (!fs.existsSync(dir)) return fileList;
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            getFilesRecursively(filePath, fileList);
        } else {
            if (file.endsWith('.spec.ts')) {
                const content = fs.readFileSync(filePath, 'utf-8');
                const isAuto = content.includes('@auto-generated');
                fileList.push({ path: path.relative(process.cwd(), filePath), isAuto });
            }
        }
    });
    return fileList;
}

async function runAuditor() {
    const strategyPath = path.resolve('artifacts/reports/test-strategy.md');
    if (!fs.existsSync(strategyPath)) {
        console.error('Strategy file not found. Run architect first.');
        process.exit(1);
    }

    const strategy = fs.readFileSync(strategyPath, 'utf-8');
    const existingFiles = getFilesRecursively(path.resolve('apps/web/tests'));
    const promptTemplate = fs.readFileSync(path.resolve('ai/prompts/auditor.md'), 'utf-8');

    const fullPrompt = `${promptTemplate}
    
### Desired Strategy
${strategy}

### Existing Files in apps/web/tests/
${JSON.stringify(existingFiles, null, 2)}
`;

    console.log('[Auditor] Comparing strategy against existing code...');
    const response = await fetch('http://127.0.0.1:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'qwen2.5-coder:7b', prompt: fullPrompt, stream: false })
    });

    const data = await response.json();
    const match = data.response.match(/```json\n([\s\S]*?)```/);
    const auditResult = match ? match[1] : JSON.stringify({ scenarios: [] }, null, 2);

    const outputPath = path.resolve('artifacts/reports/audit-result.json');
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, auditResult, 'utf-8');
    console.log(`[Auditor] Audit complete! Result saved to: ${outputPath}`);
}

runAuditor().catch(console.error);
