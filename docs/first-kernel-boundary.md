# First kernel boundary

This document turns the hybrid-runtime strategy into one concrete next step.

It defines the **first authoritative kernel slice** that should be extracted in JS before any Rust implementation work begins.

## Goal

Create one explicit boundary for **authoritative runtime truth** so later migration can harden invariants without moving shell or policy code too early.

This boundary should be small enough to freeze and test, but large enough to eliminate the most dangerous hidden duplication of truth.

## Chosen first boundary

The first kernel boundary should own:

1. persisted state load/save
2. task lifecycle legality
3. swarm lifecycle legality
4. claim/review/release legality
5. normalized mutation results and transition errors

It should **not** own yet:

- CLI routing
- MCP stdio framing
- runtime dashboards and packs
- planner heuristics
- memory ranking policy
- README/docs/skills/agents packaging

## Why this boundary first

This boundary is the best first cut because it covers the part of the product where correctness matters most:

- one source of truth for state
- legal lifecycle transitions
- review and claim rules
- mutation-time history consistency

At the same time, it avoids early churn in the user-facing shell:

- CLI stays JS
- MCP stays JS
- npm/import surface stays JS
- runtime views stay JS

## Current file clusters that belong to this boundary

These current modules are the strongest candidates for the first authoritative kernel slice.

### State entry / persistence

- `src/state-runtime-core.js`
- `src/state-storage.js`
- `src/state-normalize.js`

What they contribute:

- state file path handling
- normalized load/save behavior
- default-state recovery behavior

### Task lifecycle truth

- `src/state-transition-task-lifecycle-core.js`
- `src/state-transition-task-write-helpers.js`
- `src/state-transition-guards.js`
- `src/state-transition-helpers.js`
- `src/state-task-core.js`

What they contribute:

- queue transition legality
- claim/review/release validation
- claimed-by resolution
- history append behavior during transitions
- mutation-time task updates

### Swarm lifecycle truth

- `src/state-write-operations-swarm.js`
- `src/state-swarm-core-dispatch.js`
- `src/state-swarm-core-queue.js`
- `src/state-swarm-core-sync.js`
- `src/state-swarm-core.js`
- `src/state-transition-guards.js`

What they contribute:

- swarm queue/dispatch legality
- lane task creation from swarm contracts
- derived swarm status sync
- transition-time history behavior

### Restore / reopen truth

- `src/state-restore-task-core.js`
- `src/state-restore-swarm-core.js`

What they contribute:

- archive restore legality
- reopen safety checks
- active/archive conflict rules
- dependency-sensitive reopen protection

## Current surfaces that should stay outside the boundary

These should remain shell or policy surfaces while the first kernel boundary is extracted:

### JS product shell

- `src/index.js`
- `src/mcp.js`
- `src/state-cli-*`
- `src/state-mcp-*`
- `src/api.js`
- package exports / subpath exports

### Derived runtime views

- `src/state-runtime-*`
- `src/state-dashboard-*`
- `src/state-task-*view*`
- `src/state-swarm-overview-*`
- `src/runtime-*.js`

### Planner and policy

- `src/planner.js`
- `src/planner-*`
- recommendation/ranking helpers
- future Python intelligence surfaces

## Boundary contract shape

The first JS-extracted kernel contract should probably expose a small set of operations like:

### State operations

- `loadAuthoritativeState()`
- `saveAuthoritativeState(state)`

### Task truth operations

- `transitionTask(request)`
- `updateTaskMetadata(request)`
- `restoreTask(request)`
- `reopenTask(request)`

### Swarm truth operations

- `initSwarm(request)`
- `updateSwarm(request)`
- `queueSwarm(request)`
- `dispatchSwarmLane(request)`
- `syncSwarm(request)`
- `restoreSwarm(request)`
- `reopenSwarm(request)`

### Result contract expectations

Every authoritative mutation result should normalize:

- `kind`
- `recommendedReason` when applicable
- authoritative mutated entities
- validation failures / structured errors
- transition history side effects

## Extraction sequence inside JS

Before any language port, the boundary should be made explicit in JS in this order:

### Step 1 — isolate authoritative entrypoints

Group the current truth-bearing state operations behind one small module family that shell layers call.

### Step 2 — freeze mutation request/response shapes

Define fixture-backed schemas for:

- task lifecycle transitions
- swarm lifecycle transitions
- restore/reopen flows
- validation and conflict errors

### Step 3 — separate truth from views

Make read-only packs, dashboards, and CLI/MCP adapters depend on the extracted truth contract instead of reaching across mixed internals.

### Step 4 — freeze compatibility expectations

Document which JS shell surfaces must not regress while the backend changes:

- CLI command behavior
- MCP stdio behavior
- npm export behavior
- JS import behavior

## Acceptance criteria for boundary extraction

The first kernel boundary is ready only when:

1. authoritative writes flow through one explicit JS contract
2. runtime views do not directly own lifecycle legality
3. CLI/MCP surfaces call the extracted truth layer instead of mixed internals
4. task and swarm lifecycle fixtures are frozen
5. restore/reopen rules are covered by the same contract family
6. there is still exactly one source of truth

## Explicit non-goals for this step

This step does **not** include:

- implementing Rust yet
- adding Python runtime intelligence
- changing the public CLI or MCP contract
- redesigning planner behavior
- changing the product boundary from local bounded orchestration

## Recommended immediate next tasks

1. identify the exact JS module that will become the authoritative facade
2. define task transition fixture cases
3. define swarm transition fixture cases
4. define restore/reopen fixture cases
5. route one shell surface through the facade first as the pilot

If these are not done, a Rust kernel MVP is still premature.
