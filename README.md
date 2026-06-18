# Codex Bees

Codex-native swarm starter for multi-agent coding workflows.

## What it is

`codex-bees` is a public starter for building a Codex-first agent control plane:

- `AGENTS.md` for project-wide operating rules
- `.codex/agents` for bounded role prompts
- `.codex/skills` for reusable workflows
- a tiny MCP server stub for memory and task tools

## Naming

The name keeps the "bees" swarm metaphor, but the project is intentionally practical: small roles, explicit handoffs, durable state.

## Layout

- `.codex/` Codex config, agents, and skills
- `src/index.js` local runtime entry
- `src/mcp.js` minimal MCP-like tool stub
- `scripts/` utility scripts

## Start

```bash
npm install
npm run dev
npm run build
```

## Next steps

- Replace the MCP stub with a real server
- Add durable task storage
- Add memory search and handoff records
- Add more role prompts under `.codex/agents`
