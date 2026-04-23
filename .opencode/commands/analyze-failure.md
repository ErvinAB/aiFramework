---
name: analyze-failure
description: Run Playwright tests and analyze failures using local AI
---

Run the following shell command:

npm run analyze:local

Then:

1. Read the output log
2. Read artifacts in artifacts/test-results
3. Summarize:
   - root cause
   - classification
   - suggested fix
4. Keep output short and structured