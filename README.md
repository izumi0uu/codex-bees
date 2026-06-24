# Codex Bees

Codex-native local bounded orchestration for explicit multi-agent work.

`codex-bees` packages a small CLI, a local MCP stdio server, shipped Codex skills/agents, and a local state model for tasks, swarms, and memory. The goal is not to be a giant meta-harness. The goal is to make bounded coordination inside one repo inspectable and reusable.

## What it is

`codex-bees` is a **Codex-only product** built around a **local bounded orchestration kernel**.

It gives you:

- a local CLI for planning, tasking, swarms, and runtime inspection
- a local MCP surface that mirrors the same runtime over stdio JSON-RPC
- shipped `.codex` workspace assets you can bootstrap into a repo
- narrow agent roles and skill contracts that keep ownership explicit
- persistent local state for tasks, swarms, and memory

## Who it is for

Use `codex-bees` if you want:

- Codex-first orchestration inside one repository
- explicit owner/verifier boundaries
- small local runtime state instead of a hosted platform
- inspectable CLI and MCP surfaces
- reusable shipped skills and role contracts

## Who it is not for

`codex-bees` is **not** trying to be:

- a multi-host abstraction layer
- a hosted control plane
- a cross-machine federation runtime
- a plugin-market style product
- an everything-and-the-kitchen-sink agent harness

## What ships

### Product-facing shipped surface

- CLI binary: `codex-bees`
- MCP server: `codex-bees mcp --stdio`
- bootstrap command: `codex-bees init`
- shipped agents:
  - `explore`
  - `executor`
  - `reviewer`
  - `tester`
- shipped skills:
  - `project-development`
  - `swarm-orchestration`
- local runtime state:
  - `.codex-bees/state.json`

### Repo-internal implementation surface

These power the product, but are not the product boundary themselves:

- `src/`
- `scripts/`
- `.omx/`

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

Inspect the product surface:

```bash
npx codex-bees --help
npx codex-bees status
npx codex-bees catalog
npx codex-bees mcp --help
```

## Core concepts

| Concept | Meaning |
| --- | --- |
| Task | one bounded work item with owner, verifier, scope, acceptance, and verification |
| Swarm | one multi-lane coordination envelope |
| Role | one shipped agent contract used by the runtime and planner |
| Skill | one shipped workflow contract that shapes execution behavior |
| Runtime pack | a read-oriented bundle or dashboard derived from current state |
| Memory | a persistent local note stored outside task/swarm records |

## CLI / MCP / skill / agent relationship

- **CLI**: the operator-facing command surface
- **MCP**: the same runtime exposed to tool-driven hosts over stdio JSON-RPC
- **Skills**: the workflow contracts that define how work should proceed
- **Agents**: the role contracts that define who owns which kind of work

A useful mental model:

- CLI and MCP are the **transport surfaces**
- tasks, swarms, and memory are the **runtime state surfaces**
- skills and agents are the **behavior contracts**

## Minimal workflow example

Bootstrap a repo and shape one objective into queued work:

```bash
npx codex-bees init --preview
npx codex-bees init
npx codex-bees plan --task "Ship grouped CLI help"
npx codex-bees plan:queue --task "Ship grouped CLI help"
npx codex-bees task:next --role executor --worker worker-1
npx codex-bees task:pickup --role executor --worker worker-1
```

When implementation is done, move the task into review with the shipped lifecycle commands.

## Documentation

- [Architecture](./docs/architecture.md)
- [Runtime model](./docs/runtime-model.md)
- [CLI](./docs/cli.md)
- [MCP](./docs/mcp.md)
- [Skills](./docs/skills.md)
- [Agents](./docs/agents.md)
- [Hybrid runtime strategy](./docs/hybrid-runtime-strategy.md)
- [First kernel boundary](./docs/first-kernel-boundary.md)
- [Migration matrix](./docs/migration-matrix.md)
- [Boundary review checklist](./docs/boundary-review-checklist.md)

## Public import surface

The package also exposes JavaScript entrypoints for catalog, commands, init, planner, state, MCP, runtime guidance, runtime status, and runtime contract helpers.

Use the README for orientation first; use the subpath exports when you need library integration.
