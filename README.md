# Codex Bees

Codex-native multi-agent runtime for explicit local orchestration.

Codex Bees packages a small command surface, a local MCP server, reusable skills, and narrow agent roles so complex work can be split into bounded lanes without turning the project into a black box.

## What it does

- runs a local CLI for orchestration and diagnostics
- exposes an MCP stdio surface for tool-driven workflows
- keeps agent roles narrow, explicit, and reviewable
- favors small, observable coordination steps over opaque automation

## Project principles

- Codex-first execution
- explicit file ownership and handoff boundaries
- local, inspectable runtime behavior
- small reversible changes instead of monolithic automation

## Non-goals

Current scope does **not** include:

- multi-host orchestration
- hosted control planes
- marketplace/plugin-distribution surfaces

## Quick start

```bash
npm install
npm run check
npm run build
npm run smoke
```

## CLI

```bash
node ./src/index.js run
node ./src/index.js tools
node ./src/index.js doctor
node ./src/index.js mcp
```

## Repository layout

```text
.codex/
  agents/       role prompts for explore, execute, review, and test lanes
  skills/       reusable workflow skills for local coordination
src/
  index.js      CLI/runtime entrypoint
  mcp.js        local MCP stdio server
scripts/
  build.mjs
  smoke.mjs
```

## Current status

The foundation layer is in place:

- a real CLI entrypoint
- a minimal MCP stdio runtime
- local skills and agent prompts for bounded orchestration
- smoke checks for the current command surface

## Why this project exists

Most multi-agent coding setups either hide too much logic in prompts or spread too much behavior across external systems.

Codex Bees keeps the core runtime, roles, and workflow surfaces in the repository, where they can be inspected, reviewed, versioned, and improved like any other part of the product.
