#!/bin/bash

set -u

ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
WEB_DIR="$ROOT_DIR/apps/web"
ARTIFACT_DIR="$ROOT_DIR/artifacts"
LOG_DIR="$ARTIFACT_DIR/logs"
LOG_FILE="$LOG_DIR/latest-failure.log"

mkdir -p "$LOG_DIR"
: > "$LOG_FILE"

cd "$WEB_DIR" || exit 1

echo "Running Playwright tests..."
echo "Writing log to: $LOG_FILE"

tail -f "$LOG_FILE" &
TAIL_PID=$!

npx playwright test > "$LOG_FILE" 2>&1
TEST_EXIT_CODE=$?

kill "$TAIL_PID" 2>/dev/null
wait "$TAIL_PID" 2>/dev/null

if [ ! -s "$LOG_FILE" ]; then
  echo "Log file is empty or not created: $LOG_FILE"
  exit 1
fi

echo ""
if [ "$TEST_EXIT_CODE" -eq 0 ]; then
  echo "Tests passed."
  echo "Log saved to $LOG_FILE"
else
  echo "Tests failed."
  echo "Failure log saved to $LOG_FILE"
  cd "$ROOT_DIR" || exit 1
  node ai/agents/failure-analyzer.js "$LOG_FILE"
fi