# Codex Bees

Codex-native multi-agent runtime for explicit local orchestration.

Codex Bees packages a small command surface, a local MCP server, reusable skills, and narrow agent roles so complex work can be split into bounded lanes without turning the project into a black box.

## What it does

- runs a local CLI for orchestration and diagnostics
- exposes an MCP stdio surface for tool-driven workflows
- can generate bounded execution plans and queue them into local work items
- can generate planner-driven swarm contracts and queue them into executable local tasks
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
node ./src/index.js catalog
node ./src/index.js doctor
node ./src/index.js status
node ./src/index.js capabilities
node ./src/index.js plan --task "Add a doctor smoke check to the CLI"
node ./src/index.js plan:queue --task "Queue a runtime change"
node ./src/index.js plan:swarm --task "Parallelize a runtime change"
node ./src/index.js plan:swarm:queue --task "Queue a planner-driven swarm"
node ./src/index.js task:add --title "Wire a new MCP tool" --owner executor --verifier tester --scope src/mcp.js
node ./src/index.js task:get --id task-1
node ./src/index.js task:history --id task-1
node ./src/index.js task:annotate --id task-1 --by worker-1 --kind context --content "needs follow-up"
node ./src/index.js task:report --id task-1
node ./src/index.js task:brief --id task-1
node ./src/index.js task:inbox --role executor --worker worker-1
node ./src/index.js task:next --role tester --worker tester-1 --mode verifier
node ./src/index.js task:pickup --role executor --worker worker-1 --mode owner
node ./src/index.js worker:session --role executor --worker worker-1 --mode owner
node ./src/index.js worker:handoff --role executor --worker worker-1 --mode owner
node ./src/index.js worker:closeout --role executor --worker worker-1 --mode owner
node ./src/index.js task:check --id task-1
node ./src/index.js swarm:init --objective "Ship a bounded runtime slice" --owner leader --max-workers 2 --lanes '[{"lane":"lane-1","summary":"Map scope","owner":"explore","verifier":"reviewer"}]'
node ./src/index.js swarm:check --id swarm-1
node ./src/index.js swarm:brief --id swarm-1
node ./src/index.js swarm:queue --id swarm-1
node ./src/index.js swarm:list --detailed
node ./src/index.js swarm:overview --id swarm-1
node ./src/index.js swarm:dispatch --id swarm-1 --by worker-1 --owner explore
node ./src/index.js swarm:sync --id swarm-1
node ./src/index.js memory:store --content "Remember the MCP contract" --namespace runtime --tags mcp,contract
node ./src/index.js memory:search --query "MCP contract" --namespace runtime
node ./src/index.js task:claim --id task-1 --by explore
node ./src/index.js task:block --id task-1 --by explore --notes "waiting on dependency"
node ./src/index.js task:review --id task-1 --by explore
node ./src/index.js task:approve --id task-1 --by tester --evidence "targeted check|smoke check"
node ./src/index.js task:reject --id task-1 --by tester --status claimed --notes "needs another pass"
node ./src/index.js task:done --id task-1 --by tester --evidence "targeted check|smoke check"
node ./src/index.js task:release --id task-1 --by explore
node ./src/index.js mcp
```

Task metadata can carry lane-ready execution detail:

- `--owner` / `--verifier`
- `--objective` / `--lane`
- `--scope src/index.js,src/mcp.js`
- `--acceptance "first check|second check"`
- `--verification "targeted command|smoke check"`

`task:check` validates that a task is actually claimable before a worker takes it. A ready task needs a title, owner, verifier, scope, acceptance, and verification metadata; claiming an incomplete task is rejected. Owner and verifier must also match shipped local agent roles from `.codex/agents`, so runtime ownership stays aligned with the repo’s real Codex execution surface.

`task:review` hands work from the owner to the named verifier. After that point, only the verifier can close the task with `task:approve` / `task:done`, or send it back with `task:reject`. Review outcomes persist reviewer identity and optional `--evidence` so completion carries fresh verification context instead of skipping straight from worker claim to done.

Swarm contracts can carry bounded parallel execution detail:

- `--owner leader`
- `--topology bounded-local`
- `--max-workers 2`
- `--lane-source manual`
- `--lanes '[{"lane":"lane-1","summary":"Map scope","owner":"explore","verifier":"reviewer","scope":["src/index.js"]}]'`

`swarm:check` validates that each lane has owner, verifier, scope, acceptance, and verification metadata before queueing. It also rejects overlapping lane scopes and unknown lane roles, so planner-generated and manually-authored swarms stay parallel-safe before execution begins.

`task:get` / `task_brief` and `swarm:get` / `swarm_brief` turn stored coordination state into execution-ready handoff payloads. Briefs resolve shipped role prompt paths, summarize queue/review state, identify the next actor, and suggest the next CLI action so a Codex worker can pick up work without re-discovering scope.

`task:history` / `task_history` expose structured handoff history for each task—claims, review handoff, changes requested, releases, and approvals—so local coordination stays auditable instead of collapsing into one final status field.

`task:annotate` / `task_annotate` add lightweight persistent execution notes to a task. Use them for local handoff context, verifier hints, or worker breadcrumbs that should survive beyond a single chat turn.

`task:report` / `task_report` build a delivery-ready package for one task: closure state, acceptance checklist, verification steps, review evidence, history, annotations, and the current next gate. It is the compact artifact for review-ready or done work.

`task:inbox` / `task_inbox` give each shipped role a prioritized local work queue, and `task:next` / `task_next` resolve the single best next claim-or-review candidate with its full execution brief attached. This is the bridge from persisted coordination state to an actual Codex worker pickup loop.

`task:pickup` / `task_pickup` turn that candidate into action: claimable owner work is auto-claimed for the worker, while claimed or review-ready work returns the exact next handoff command. This keeps the pickup loop explicit without hiding lifecycle transitions.

`worker:session` / `worker_session` aggregate the real local workspace for one worker: active claimed tasks, review queue, recent handoff history, next candidate, and the current focus command. This is the closest surface yet to a repo-native agent console.

`worker:handoff` / `worker_handoff` package that workspace into a return-ready payload: current focus, task brief, recent history, recent annotations, next candidate, and one summary sentence that another worker or leader can pick up immediately.

`worker:closeout` / `worker_closeout` add the closure layer on top: current handoff, task report, and the concrete closeout command. This is the bundle a worker can emit when returning work for review, approval, or final archive.

`catalog` and the MCP `runtime_catalog` tool expose the shipped local agent and skill inventory. `doctor` includes the same catalog so operators can confirm which Codex roles and skills the runtime will accept.

`status` and the MCP `runtime_status` tool summarize the current local runtime: shipped tool/agent/skill counts, persisted task/swarm/memory counts, and queue status distribution. `capabilities` and `runtime_capabilities` provide a product-facing inventory of what this Codex-only runtime actually supports today.

Queued swarm lane tasks automatically persist `swarmId`, lane metadata, and task ownership so CLI/MCP workers can claim them without re-slicing. Swarm-linked task lifecycle changes automatically keep swarm status close to task reality, `swarm:list --detailed` gives leaders a multi-swarm dashboard, `swarm:overview` summarizes one swarm, `swarm:dispatch` claims the next runnable lane task for a worker, and `swarm:sync` provides an idempotent reconciliation step when leaders want an explicit status check.

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
- a planner that maps task briefs to bounded lanes, can emit swarm contracts, and can queue those lanes as local tasks
- readiness checks that reject incomplete tasks, incomplete swarm lanes, and overlapping swarm scopes before claim, queue, or dispatch
- a bounded local swarm surface that can register lanes and queue them into executable local tasks
- a persistent local memory surface with namespace/tag filters and text search
- a local task queue with explicit claim, block, review, release, and completion states plus persisted lane metadata
- a versioned local state store with recovery for corrupt state files
- a project-local development skill for intake, planning, execution, verification, and handoff
- local skills and agent prompts for bounded orchestration
- a repo-native runtime catalog that discovers shipped agents and skills and validates role ownership against them
- MCP tools with discoverable input schemas
- smoke checks for the current command surface

## Why this project exists

Most multi-agent coding setups either hide too much logic in prompts or spread too much behavior across external systems.

Codex Bees keeps the core runtime, roles, and workflow surfaces in the repository, where they can be inspected, reviewed, versioned, and improved like any other part of the product.
