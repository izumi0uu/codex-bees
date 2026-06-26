# Migration matrix

This matrix maps the current repository surfaces into the future layered runtime model described in [Hybrid runtime strategy](./hybrid-runtime-strategy.md).

It is a planning artifact for **boundary extraction first**. It is **not** a move list for immediate rewrites.

## Migration rules

1. Do not move code across languages before the boundary exists in JS.
2. Do not create a second source of truth during transition.
3. Treat the current CLI/MCP/npm surface as a compatibility contract.
4. Prefer capability-level ownership decisions over file-by-file cargo-cult ports.

## Surface matrix

| Current surface | Current examples | Future owner | Why | Migration note |
| --- | --- | --- | --- | --- |
| Authoritative state persistence | `src/state-runtime-core.js`, `src/state/task/lifecycle*`, `src/state-transition-guards.js`, `src/state/write/*`, `src/state-restore-*` | Rust kernel | these define truth, legality, and mutation | extract a narrow kernel contract first; do not port projections with truth |
| Task/swarm legality | `src/state/task/lifecycle-core.js`, `src/state/swarm/core-*`, `src/state-rules-*` | Rust kernel | lifecycle legality belongs with truth | freeze schemas before porting |
| Truth-dependent history/event records | `src/state-builders.js`, mutation/history helpers | Rust kernel | history is part of authoritative transition output | port only after transition outputs are explicit |
| Read-oriented runtime views | `src/state-runtime-*`, `src/state/dashboard/*`, `src/state/task/*view*`, `src/state/swarm/overview-*` | TS/JS shell consuming kernel | these are presentation and operator surfaces | keep in JS unless they must be truth-coupled |
| CLI surface | `src/index.js`, `src/state/cli/*` | TS/JS shell | operator contract and npm bin surface | should remain stable across backend changes |
| MCP surface | `src/mcp.js`, `src/state/mcp/*` | TS/JS shell | stdio JSON-RPC adapter is a product shell concern | kernel should not own stdio framing |
| npm exports / JS API | `src/api.js`, package exports, `dist/*` | TS/JS shell | public package contract is JS-facing today | preserve import compatibility through migration |
| Planner heuristics | `src/planner.js`, `src/planner-*` | Python intelligence later, JS temporary now | adaptive strategy is policy, not truth | move only after kernel contract is stable |
| Ranking / recommendation policy | `src/state-runtime-focus-*`, recommendation helpers, ranking logic | Python intelligence later, JS temporary now | prioritization is optional policy | must stay non-authoritative |
| Bootstrap/init surface | `.codex/`, `src/init-*` | TS/JS shell | shipped product bootstrap contract | remains package-facing |
| Agent / skill catalog packaging | `.codex/agents/*`, `.codex/skills/*`, catalog views | TS/JS shell | shipped workspace payload | not a kernel concern |
| Docs / product narrative | `README.md`, `docs/*` | TS/JS shell / product docs | defines user-facing contract | should explain changes before implementation changes ship |

## Recommended first kernel boundary

The safest first kernel boundary is:

1. persisted state load/save
2. task lifecycle transition validation
3. swarm lifecycle transition validation
4. claim/review/release legality
5. normalized mutation results

This boundary is small enough to be testable and important enough to eliminate hidden truth duplication.

## Surfaces that should stay in JS longest

These should be the last things to move, if they move at all:

- CLI command routing
- MCP stdio framing
- npm export facade
- init/bootstrap packaging
- docs/skills/agents packaging surface

## Surfaces that should never become authoritative outside the kernel

Even during migration, these surfaces must not mutate truth directly:

- planner heuristics
- runtime dashboards and packs
- Python experimentation tools
- JS shell presentation adapters

## Read / suggest / commit model

| Layer | Can read | Can suggest | Can commit truth |
| --- | --- | --- | --- |
| Rust kernel | yes | limited internal derivation | yes |
| Python intelligence | yes | yes | no |
| TS/JS shell | yes | yes for UX-level defaults | no outside kernel contract |

## Pre-port checklist

Before porting any current JS surface into another layer, confirm:

- is this surface authoritative truth or only a view/policy?
- is its input/output shape frozen?
- is there a compatibility plan for current CLI/MCP/npm users?
- can this move happen without introducing a second writer of truth?

If any answer is no, the move is premature.
