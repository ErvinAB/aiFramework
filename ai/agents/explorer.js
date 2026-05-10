const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function explore(url) {
    console.log(`Starting exploration of: ${url}`);
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    const networkRequests = [];
    page.on('request', request => {
        if (request.resourceType() === 'fetch' || request.resourceType() === 'xhr') {
            networkRequests.push({
                url: request.url(),
                method: request.method(),
                postData: request.postData()
            });
        }
    });

    try {
        await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
        
        // Extract interactable elements to build a map of what a user can do
        const elements = await page.evaluate(() => {
            const interactables = document.querySelectorAll('button, a, input, select, textarea, [role="button"]');
            return Array.from(interactables).map(el => {
                return {
                    tag: el.tagName.toLowerCase(),
                    text: el.innerText ? el.innerText.trim() : null,
                    id: el.id || null,
                    name: el.name || null,
                    type: el.type || null,
                    placeholder: el.placeholder || null,
                    href: el.href || null,
                    ariaLabel: el.getAttribute('aria-label') || null
                };
            }).filter(el => el.text || el.id || el.name || el.placeholder || el.ariaLabel); // filter useless nodes
        });

        const output = {
            url,
            interactableElements: elements,
            apiRequests: networkRequests
        };

        const outputPath = path.resolve('artifacts/reports/app-state.json');
        fs.mkdirSync(path.dirname(outputPath), { recursive: true });
        fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));

        console.log(`Exploration complete. Found ${elements.length} interactable elements and ${networkRequests.length} API requests.`);
        console.log(`Saved state to: ${outputPath}`);

    } catch (e) {
        console.error("Exploration failed:", e.message);
    } finally {
        await browser.close();
    }
}

const targetUrl = process.argv[2];
if (!targetUrl) {
    console.error('Usage: node ai/agents/explorer.js <url>');
    process.exit(1);
}

explore(targetUrl).catch(console.error);
