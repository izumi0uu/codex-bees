# Codex Bees

Codex-native multi-agent runtime for explicit local orchestration.

Codex Bees packages a small command surface, a local MCP server, reusable skills, and narrow agent roles so complex work can be split into bounded lanes without turning the project into a black box.

## What it does

- runs a local CLI for orchestration and diagnostics
- exposes an MCP stdio surface for tool-driven workflows
- can generate bounded execution plans and queue them into local work items
- can stage bounded local swarms and queue their lanes into executable local tasks
- stores persistent local memory for later recall across execution lanes
- keeps a small local task queue with explicit lifecycle states, single-owner transitions, and local state recovery
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
node ./src/index.js plan --task "Add a doctor smoke check to the CLI"
node ./src/index.js plan:queue --task "Queue a runtime change"
node ./src/index.js task:add --title "Wire a new MCP tool" --owner executor --verifier tester --scope src/mcp.js
node ./src/index.js swarm:init --objective "Ship a bounded runtime slice" --owner leader --max-workers 2 --lanes '[{"lane":"lane-1","summary":"Map scope","owner":"explore","verifier":"reviewer"}]'
node ./src/index.js swarm:queue --id swarm-1
node ./src/index.js memory:store --content "Remember the MCP contract" --namespace runtime --tags mcp,contract
node ./src/index.js memory:search --query "MCP contract" --namespace runtime
node ./src/index.js task:claim --id task-1 --by explore
node ./src/index.js task:block --id task-1 --by explore --notes "waiting on dependency"
node ./src/index.js task:review --id task-1 --by explore
node ./src/index.js task:done --id task-1 --by explore
node ./src/index.js task:release --id task-1 --by explore
node ./src/index.js mcp
```

Task metadata can carry lane-ready execution detail:

- `--owner` / `--verifier`
- `--objective` / `--lane`
- `--scope src/index.js,src/mcp.js`
- `--acceptance "first check|second check"`
- `--verification "targeted command|smoke check"`


Swarm contracts can carry bounded parallel execution detail:

- `--owner leader`
- `--topology bounded-local`
- `--max-workers 2`
- `--lane-source manual`
- `--lanes '[{"lane":"lane-1","summary":"Map scope","owner":"explore","verifier":"reviewer","scope":["src/index.js"]}]'`

Queued swarm lane tasks automatically persist `swarmId`, lane metadata, and task ownership so CLI/MCP workers can claim them without re-slicing.

Memory records can carry reusable execution context:

- `--namespace runtime`
- `--kind note`
- `--agent tester`
- `--tags mcp,contract`

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
- a planner that maps task briefs to bounded lanes and can queue those lanes as local tasks
- a bounded local swarm surface that can register lanes and queue them into executable local tasks
- a persistent local memory surface with namespace/tag filters and text search
- a local task queue with explicit claim, block, review, release, and completion states plus persisted lane metadata
- a versioned local state store with recovery for corrupt state files
- a project-local development skill for intake, planning, execution, verification, and handoff
- local skills and agent prompts for bounded orchestration
- MCP tools with discoverable input schemas
- smoke checks for the current command surface

## Why this project exists

Most multi-agent coding setups either hide too much logic in prompts or spread too much behavior across external systems.

Codex Bees keeps the core runtime, roles, and workflow surfaces in the repository, where they can be inspected, reviewed, versioned, and improved like any other part of the product.
