# aiFramework

Local-first AI QA automation framework.

## Stack
- Playwright + TypeScript
- OpenCode
- Ollama
- Antigravity as editor shell

## Principles
- deterministic automation first
- AI assistance second
- local-first by default
- minimal, reviewable changes




----- for nikola if needed ------ 

mkdir -p .opencode/agents .opencode/commands .opencode/skills .opencode/tools \
  apps/web ai/agents ai/prompts ai/tools artifacts/{screenshots,traces,videos,reports} docs

cat > opencode.json <<'EOF'
{
  "$schema": "https://opencode.ai/config.json",
  "default_agent": "build",
  "model": "ollama/qwen2.5-coder:7b",
  "small_model": "ollama/gemma3:4b",
  "provider": {
    "ollama": {
      "options": {
        "baseURL": "http://127.0.0.1:11434/api"
      }
    }
  },
  "share": "disabled"
}
EOF

cat > AGENTS.md <<'EOF'
# AI Framework Rules

- Default to local Ollama models only
- Prefer qwen2.5-coder:7b for code-heavy tasks
- Use gemma3:4b for lighter reasoning
- Keep changes small and reviewable
- Do not rewrite unrelated files
- Prefer deterministic Playwright code over AI cleverness
- Do not add paid providers unless explicitly requested
EOF

cat > .gitignore <<'EOF'
.DS_Store
.env
.env.*
node_modules/
dist/
build/
coverage/
playwright-report/
test-results/
blob-report/
__pycache__/
*.pyc
.venv/
venv/

artifacts/screenshots/*
artifacts/traces/*
artifacts/videos/*
artifacts/reports/*

!artifacts/screenshots/.gitkeep
!artifacts/traces/.gitkeep
!artifacts/videos/.gitkeep
!artifacts/reports/.gitkeep
EOF

touch artifacts/screenshots/.gitkeep \
  artifacts/traces/.gitkeep \
  artifacts/videos/.gitkeep \
  artifacts/reports/.gitkeep

cat > README.md <<'EOF'
# aiFramework

Local-first AI QA automation framework.

## Stack
- Playwright + TypeScript
- OpenCode
- Ollama
- Antigravity as editor shell

## Principles
- deterministic automation first
- AI assistance second
- local-first by default
- minimal, reviewable changes
EOF