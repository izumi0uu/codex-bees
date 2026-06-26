# Codex Bees

[![GitHub stars](https://img.shields.io/github/stars/izumi0uu/codex-bees?style=flat-square)](https://github.com/izumi0uu/codex-bees/stargazers)
[![GitHub last commit](https://img.shields.io/github/last-commit/izumi0uu/codex-bees?style=flat-square)](https://github.com/izumi0uu/codex-bees/commits/main)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](./LICENSE)
[![Surface](https://img.shields.io/badge/surface-CLI%20%2B%20MCP-0f766e?style=flat-square)](./docs/cli.md)
[![Runtime](https://img.shields.io/badge/runtime-local%20state-1d4ed8?style=flat-square)](./docs/runtime-model.md)
[![Boundary](https://img.shields.io/badge/boundary-codex--only-7c3aed?style=flat-square)](./docs/runtime-model.md)

Codex-native local bounded orchestration for explicit multi-agent work.

`codex-bees` helps you run explicit, inspectable multi-agent coordination inside one repository.

## What it is

It ships:

- a local CLI
- a local MCP stdio server
- bootstrapable `.codex` workspace assets
- a local state model for tasks, swarms, and memory

If you want Codex-first orchestration without a hosted control plane, this is the product.

## What it includes

- **CLI:** `codex-bees`
- **MCP server:** `codex-bees mcp --stdio`
- **Bootstrap command:** `codex-bees init`
- **Shipped agents:** `explore`, `executor`, `reviewer`, `tester`
- **Shipped skills:** `project-development`, `swarm-orchestration`
- **Local runtime state:** `.codex-bees/state.json`

## Why it feels different

- **Local-first** — state lives in the repo, not in a hidden service
- **Explicit ownership** — tasks and lanes keep owner / verifier boundaries visible
- **Inspectable** — CLI, MCP, packs, and views are derived from local state
- **Small surface area** — it stays focused on bounded coordination, not generic agent sprawl

## Who it is for

Use `codex-bees` when you want:

- Codex-first orchestration inside one repo
- explicit owner / verifier boundaries
- inspectable local runtime state instead of a hosted control plane
- the same coordination model available through both CLI and MCP
- reusable shipped agent and skill contracts

## Who it is not for

`codex-bees` is intentionally **not**:

- a multi-host abstraction layer
- a hosted control plane
- a cross-machine federation runtime
- a generic plugin marketplace
- an everything-and-the-kitchen-sink agent harness

## Quick start

```bash
npm install
npm run check
npm run build
npm run smoke
```

Preview and install the shipped workspace assets:

```bash
npx codex-bees init --preview
npx codex-bees init
```

Inspect the shipped surface:

```bash
npx codex-bees --help
npx codex-bees status
npx codex-bees catalog
npx codex-bees mcp --help
```

## Core concepts

- **Task** — the smallest tracked work item with owner, verifier, scope, and lifecycle
- **Swarm** — a bounded local coordination envelope for related tasks
- **Lane** — a planner-produced slice of work such as implementation, verification, or documentation
- **Memory** — durable local notes and state artifacts stored with the repo

## CLI / MCP / skill / agent relationship

- **CLI** gives you local commands for planning, queueing, pickup, review, and status
- **MCP** exposes the same runtime through `codex-bees mcp --stdio`
- **Skills** such as `project-development` and `swarm-orchestration` shape how work gets executed
- **Agents** such as `explore`, `executor`, `reviewer`, and `tester` give each lane an explicit role boundary

## What it looks like

```bash
$ npx codex-bees plan --task "Ship grouped CLI help"

kind: task_plan
recommendedReason: multi_lane_plan_ready
planner: bounded-local
executionShape: parallel-handoff
waves: 2
```

## Minimal workflow example

Shape one objective into queued work:

```bash
npx codex-bees plan --task "Ship grouped CLI help"
npx codex-bees plan:queue --task "Ship grouped CLI help"
npx codex-bees task:next --role executor --worker worker-1
npx codex-bees task:pickup --role executor --worker worker-1
```

When implementation is done, move the task into review and close it with the shipped lifecycle commands.

## Documentation

- [Architecture](./docs/architecture.md) — product shape and system boundaries
- [Runtime model](./docs/runtime-model.md) — tasks, swarms, lanes, and lifecycle
- [CLI](./docs/cli.md) — command surface and examples
- [MCP](./docs/mcp.md) — stdio JSON-RPC tool surface
- [Skills](./docs/skills.md) / [Agents](./docs/agents.md) — shipped workflow and ownership contracts
- [Deeper design notes](./docs/hybrid-runtime-strategy.md) — strategy, boundaries, and migration context

The package also exposes JavaScript entrypoints for catalog, commands, init, planner, state, MCP, runtime guidance, runtime status, and runtime contract helpers.

If you want the deeper runtime model, start with the docs rather than the README.
