# Runtime model

## Core idea

`codex-bees` runs a **local bounded multi-agent coordination model**:

- work is split into explicit tasks or swarm lanes
- each task has an owner and a verifier
- state is persisted locally
- runtime packs and dashboards summarize the state without becoming the source of truth

## Main runtime objects

| Object | Meaning |
| --- | --- |
| Task | One bounded work item with owner, verifier, scope, acceptance, and verification |
| Swarm | One multi-lane coordination envelope that can queue tasks |
| Lane | One purpose-specific slice inside a swarm or planner output |
| Memory | One persistent local note or retrieval record |
| Runtime pack | A read-oriented workspace or handoff bundle derived from current state |

## Role model

Shipped roles:

- `explore` — read-only discovery and scope mapping
- `executor` — implementation owner
- `reviewer` — boundary/risk review owner
- `tester` — verification owner

The planner and runtime assume these role ids exist in the shipped local catalog.

## Task lifecycle

Valid task queue states:

| State | Meaning |
| --- | --- |
| `queued` | Ready to be claimed |
| `claimed` | Owned by one active worker |
| `blocked` | Cannot proceed without dependency or clarification |
| `ready_for_review` | Owner finished; verifier now decides |
| `released` | Ownership returned without completion |
| `done` | Accepted and closed |

Important rules:

- only one active owner at a time
- verifier actions happen after `ready_for_review`
- `released` returns the task to the queue without pretending the work is done

## Swarm lifecycle

Valid swarm states:

| State | Meaning |
| --- | --- |
| `planned` | Contract exists but execution has not started |
| `active` | Lanes can be queued or worked |
| `blocked` | The swarm as a whole cannot progress |
| `completed` | Objective is satisfied |
| `cancelled` | Execution stopped intentionally |

A blocked lane is not automatically a blocked swarm. Swarm-level status is derived from overall lane/task reality.

## Lane purposes

The shipped runtime validates these lane purpose categories:

- `discovery`
- `implementation`
- `verification`
- `documentation`

The planner uses these to keep work explicit and bounded.

## Planner defaults

Shipped planner profiles:

- `bounded-local` — adaptive local bounded planner for default execution
- `coordination-local` — parallel-biased bounded planner for swarm-heavy work

Typical default ownership shape:

- discovery: `explore` → `reviewer`
- implementation: `executor` → `tester`
- verification: `tester` → `reviewer`
- documentation: `reviewer` → `tester`

## Runtime views vs state

Runtime dashboards and packs are **derived views**, not the source of truth.

Source of truth:

- `.codex-bees/state.json`

Derived surfaces:

- `runtime:*` commands
- `leader:*`, `worker:*`, `verifier:*` bundles
- MCP runtime/status/pack tools

This separation matters because the product aims for inspectability: a pack can be regenerated from state instead of becoming a hidden workflow artifact.

## Local storage

By default the runtime keeps its persisted state at:

```text
.codex-bees/state.json
```

That state tracks tasks, swarms, memories, and transition history.

## Boundaries

The runtime model intentionally excludes:

- multi-host execution guarantees
- hosted backend coordination
- external marketplace/plugin distribution
- hidden autonomous state outside the local repo/runtime contract
