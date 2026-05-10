#!/bin/bash
set -e

ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT_DIR"

TARGET_URL=${1:-"https://the-internet.herokuapp.com/login"}

echo "======================================"
echo " 🐝 Swarm QA Framework Executing 🐝 "
echo " Target: $TARGET_URL"
echo "======================================"

echo "[1/4] 🕷️  Explorer Agent crawling DOM..."
node ai/agents/explorer.js "$TARGET_URL"

echo "[2/9] 🧠 Architect Agent designing strategy..."
node ai/agents/architect.js

echo "[2.5/9] 🔍 Auditor Agent checking existing tests..."
node ai/agents/auditor.js

echo "[3/9] 🏭 Data Forger Agent creating test data..."
node ai/agents/data-forger.js

echo "[4/9] 🏗️  POM Generator Agent building Page Objects..."
node ai/agents/pom-generator.js

echo "[5/9] 💨 Suite Creator Agent writing SMOKE tests..."
node ai/agents/suite-creator.js smoke

echo "[6/9] 🌐 Suite Creator Agent writing API tests..."
node ai/agents/suite-creator.js api

echo "[7/9] 🐛 Suite Creator Agent writing REGRESSION tests..."
node ai/agents/suite-creator.js regression

echo "[8/9] ♿ Suite Creator Agent writing ACCESSIBILITY tests..."
node ai/agents/suite-creator.js a11y

echo "[9/9] 📸 Suite Creator Agent writing VISUAL tests..."
node ai/agents/suite-creator.js visual

echo "======================================"
echo " 🏁 Enterprise Swarm Phase Complete!"
echo " Check artifacts/reports/ GeneratedPOM.md"
echo " Check artifacts/reports/ [smoke|api|regression|a11y|visual]-suite-review.md"
echo " Check artifacts/fixtures/ test-data.json"
echo "======================================"
echo " 2. Break a locator in that file intentionally."
echo " 3. Run: npx playwright test > artifacts/logs/failure.log 2>&1 || node ai/agents/healer.js apps/web/tests/smoke.spec.ts artifacts/logs/failure.log \"$TARGET_URL\""
