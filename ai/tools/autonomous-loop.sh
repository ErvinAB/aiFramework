#!/bin/bash
set -e

ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT_DIR"

TARGET_URL=${1:-"https://the-internet.herokuapp.com/login"}

echo "======================================"
echo " Starting Autonomous QA Pipeline "
echo " Target: $TARGET_URL"
echo "======================================"

echo "[1/3] Exploring the target URL..."
node ai/agents/explorer.js "$TARGET_URL"

echo "[2/3] Generating tests using local Ollama..."
node ai/agents/test-generator.js

echo "======================================"
echo " Pipeline paused for human review."
echo " Please check artifacts/reports/generated-test-review.md"
echo " To execute the generated tests, manually save them to apps/web/tests/ and run:"
echo " npm run test:web"
echo "======================================"
