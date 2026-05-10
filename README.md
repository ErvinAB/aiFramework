<div align="center">
  <h1>🐝 Swarm QA Framework</h1>
  <p><strong>A Professional-Grade, Local-First, Autonomous AI QA Swarm</strong></p>
  <p><i>Autonomous Exploration • Multi-Agent Strategy • State-Aware Patching • Self-Healing</i></p>
</div>

<br />

The **Swarm QA Framework** is an elite, multi-agent pipeline designed to automate the entire lifecycle of QA engineering. Powered by local AI models (Ollama/`qwen2.5-coder`), it doesn't just "generate code"—it functions as a state-aware engineering team that explores your application, architects a strategy, manages test data, builds Page Objects, and maintains your test suite through self-healing loops.

---

## 🏗️ Multi-Agent Architecture

Our "Swarm" consists of specialized agents that collaborate to ensure maximum coverage and zero flakiness.

### 1. 🕷️ The Explorer Agent (`explorer.js`)
Navigates the target URL, extracts interactive elements, and intercepts network traffic to build a comprehensive **Application State Map**.

### 2. 🧠 The QA Architect Agent (`architect.js`)
Analyzes the state map and designs a **High-Level Test Strategy**, identifying critical paths and essential verification points.

### 3. 🔍 The Code Auditor Agent (`auditor.js`)
**The brain of incremental updates.** It scans your existing codebase and compares it against the desired strategy.
- **Action Logic**: Decides whether to **CREATE** a new test, **UPDATE** an existing one, or **SKIP** if coverage is already sufficient.
- **Ownership Tagging**: Respects your manual work. It only modifies files containing the `// @auto-generated` tag.

### 4. 🏭 The Data Forger Agent (`data-forger.js`)
Automatically fabricates realistic, randomized test data using `@faker-js/faker` based on the actual inputs found on your page.
- *Output: `artifacts/fixtures/test-data.json`*

### 5. 🏗️ The POM Generator Agent (`pom-generator.js`)
Builds and maintains a reusable **Page Object Model (POM)**. It is additive, meaning it merges new locators into your existing POM classes without deleting your custom methods.

### 6. 👨‍💻 The Suite Creator Agent (`suite-creator.js`)
Generates 5 distinct, specialized test suites:
- 💨 **Smoke**: Fast, high-level UI verification.
- 🌐 **API**: Network request & payload validation.
- 🐛 **Regression**: Deep functional and edge-case testing.
- ♿ **Accessibility**: WCAG compliance scans via `@axe-core/playwright`.
- 📸 **Visual**: Pixel-perfect regression via Playwright snapshots.

### 7. 🏥 The Healer Agent (`healer.js`)
**The Self-Healing Loop.** When a test fails, the Healer re-explores the page, identifies if a locator changed (e.g., "Submit" became "Send"), and proposes a direct code fix to repair the test automatically.

---

## 🚀 Usage

### Full Swarm Execution (The "Full Monty")
To let the AI handle everything from exploration to multi-suite generation:
```bash
./ai/tools/swarm-loop.sh "https://your-app.com/target-page"
```

### Partial Usage (Modular Mode)
You can call agents individually to assist your manual workflow:

- **Just need a POM?**
  `node ai/agents/explorer.js <URL> && node ai/agents/pom-generator.js`
- **Just need Test Data?**
  `node ai/agents/explorer.js <URL> && node ai/agents/data-forger.js`
- **Just need an Accessibility scan?**
  `node ai/agents/suite-creator.js a11y`

### Self-Healing a Failure
If a test at `tests/my-test.spec.ts` fails, run:
```bash
node ai/agents/healer.js tests/my-test.spec.ts path/to/failure.log "https://your-app.com"
```

---

## 🛠️ Stack & Principles

- **Privacy First**: 100% local. Your code and UI data never leave your machine.
- **Framework**: Playwright + TypeScript.
- **Models**: Optimized for Ollama (`qwen2.5-coder:7b`).
- **Resilience**: Enforces web-first assertions and user-centric locators (`getByRole`) to ensure zero flakiness.

---

## 📜 Project Structure

```text
ai/
├── agents/    # Specialized AI agents (Architect, Auditor, Healer, etc.)
├── prompts/   # Expert-tuned prompt templates for local models
└── tools/     # Orchestration and shell scripts
artifacts/     # Logs, Reports, Generated POMs, and Test Data Fixtures
apps/web/
├── pages/     # Page Object Model (POM) files
└── tests/     # Categorized test suites (Smoke, API, etc.)
```

---

<div align="center">
  <p>Built with ❤️ for advanced SDETs who want to leverage the power of local AI Swarms.</p>
</div>