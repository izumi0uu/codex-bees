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
node ./src/index.js runtime:activity
node ./src/index.js runtime:assignment-pack --role executor --worker worker-1 --mode owner
node ./src/index.js runtime:closeout
node ./src/index.js runtime:closeout-pack
node ./src/index.js runtime:closeout-pack --workers '{"executor":"worker-executor","explore":"worker-explore"}'
node ./src/index.js runtime:control-pack
node ./src/index.js runtime:control-pack --workers '{"executor":"worker-executor","explore":"worker-explore"}'
node ./src/index.js runtime:alerts
node ./src/index.js runtime:dashboard
node ./src/index.js runtime:dispatch
node ./src/index.js runtime:dispatch-pack
node ./src/index.js runtime:dispatch-pack --workers '{"executor":"worker-executor","explore":"worker-explore"}'
node ./src/index.js runtime:execution-pack
node ./src/index.js runtime:execution-pack --workers '{"executor":"worker-executor","explore":"worker-explore"}'
node ./src/index.js runtime:focus
node ./src/index.js runtime:handoff-pack
node ./src/index.js runtime:handoffs
node ./src/index.js runtime:leader-pack
node ./src/index.js runtime:operator-pack
node ./src/index.js runtime:owner-pack --role executor --worker worker-1
node ./src/index.js runtime:pickup-pack --role executor --worker worker-1 --mode owner
node ./src/index.js runtime:queue-pack
node ./src/index.js runtime:queue-pack --workers '{"executor":"worker-executor","explore":"worker-explore"}'
node ./src/index.js runtime:recovery
node ./src/index.js runtime:recovery-pack
node ./src/index.js runtime:review-pack --role tester --worker tester-1
node ./src/index.js runtime:role-pack --role tester --worker tester-1 --mode verifier
node ./src/index.js runtime:session-pack --role tester --worker tester-1 --mode verifier
node ./src/index.js runtime:signal-pack
node ./src/index.js runtime:summary-pack
node ./src/index.js runtime:summary-pack --workers '{"executor":"worker-executor","explore":"worker-explore"}'
node ./src/index.js runtime:triage-pack
node ./src/index.js runtime:verifier-pack --role tester --worker tester-1
node ./src/index.js runtime:workspace-pack
node ./src/index.js runtime:workspace-pack --workers '{"executor":"worker-executor","explore":"worker-explore"}'
node ./src/index.js runtime:worker-pack --role executor --worker worker-1
node ./src/index.js runtime:review
node ./src/index.js runtime:roles
node ./src/index.js plan --task "Add a doctor smoke check to the CLI"
node ./src/index.js plan:queue --task "Queue a runtime change"
node ./src/index.js plan:swarm --task "Parallelize a runtime change"
node ./src/index.js plan:swarm:queue --task "Queue a planner-driven swarm"
node ./src/index.js task:add --title "Wire a new MCP tool" --owner executor --verifier tester --scope src/mcp.js
node ./src/index.js task:get --id task-1
node ./src/index.js task:pickup-preview --role executor --worker worker-1 --mode owner
node ./src/index.js task:history --id task-1
node ./src/index.js task:annotate --id task-1 --by worker-1 --kind context --content "needs follow-up"
node ./src/index.js task:report --id task-1
node ./src/index.js task:brief --id task-1
node ./src/index.js task:inbox --role executor --worker worker-1
node ./src/index.js task:next --role tester --worker tester-1 --mode verifier
node ./src/index.js task:assignment-preview --role executor --worker worker-1 --mode owner
node ./src/index.js task:assignment-pickup --role executor --worker worker-1 --mode owner
node ./src/index.js task:pickup --role executor --worker worker-1 --mode owner
node ./src/index.js worker:session --role executor --worker worker-1 --mode owner
node ./src/index.js worker:handoff --role executor --worker worker-1 --mode owner
node ./src/index.js worker:closeout --role executor --worker worker-1 --mode owner
node ./src/index.js verifier:bundle --role tester --worker tester-1
node ./src/index.js leader:assignment-dispatch --role executor --worker worker-1
node ./src/index.js leader:assignment-dispatch-bundle --workers '{"executor":"worker-executor","explore":"worker-explore"}'
node ./src/index.js leader:assignment-launch-plan --workers '{"executor":"worker-executor","explore":"worker-explore"}'
node ./src/index.js leader:assignment-dispatch-pack
node ./src/index.js leader:assignment-dispatch-pack --workers '{"executor":"worker-executor","explore":"worker-explore"}'
node ./src/index.js leader:assignments
node ./src/index.js leader:queue
node ./src/index.js leader:workspace
node ./src/index.js task:check --id task-1
node ./src/index.js swarm:init --objective "Ship a bounded runtime slice" --owner leader --max-workers 2 --lanes '[{"lane":"lane-1","summary":"Map scope","owner":"explore","verifier":"reviewer"}]'
node ./src/index.js swarm:check --id swarm-1
node ./src/index.js swarm:brief --id swarm-1
node ./src/index.js swarm:bundle --id swarm-1
node ./src/index.js swarm:blockers --id swarm-1
node ./src/index.js swarm:closeout --id swarm-1
node ./src/index.js swarm:dispatch-bundle --id swarm-1
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

`task:check` validates that a task is actually claimable before a worker takes it. A ready task needs a title, owner, verifier, scope, acceptance, and verification metadata; claiming an incomplete task is rejected. Owner and verifier must also match shipped local agent roles from `.codex/agents`, and the surface emits a machine-readable `recommendedReason` so automation can distinguish claim-ready tasks, role mismatches, claimed-task metadata gaps, and general validation failures without reparsing issue arrays by hand.

`task:list` / `task_list` return the explicit task retrieval view. They emit `kind: "task_view"` with `recommendedReason: "task_list_has_results"` or `recommendedReason: "task_list_empty"` so automation can distinguish non-empty and empty task listings without inferring from array length alone.

`task:get` / `task_get` return the explicit task detail view. They emit `kind: "task_detail"` with `recommendedReason: "task_detail_loaded"` so automation can distinguish one-task retrieval from list, brief, history, and report surfaces without inferring that only from nesting shape.

`task:add` / `task_add` return the explicit mutation result for creating a local coordination task. They emit a machine-readable `recommendedReason` so automation can branch on task creation without inferring intent only from the nested task snapshot.

`task:update` / `task_update` return the explicit mutation result for updating task metadata. They emit a machine-readable `recommendedReason` so automation can distinguish metadata edits from lifecycle moves without reparsing nested task fields alone.

`task:claim` / `task_claim` return the explicit lifecycle mutation result for taking ownership of a task. They emit a machine-readable `recommendedReason` so automation can treat claim as its own protocol step instead of inferring it only from the nested task queue status.

`task:block` / `task_block` return the explicit lifecycle mutation result for marking a claimed task blocked. They emit a machine-readable `recommendedReason` so automation can distinguish an intentional owner-side block from later recovery or handoff surfaces without reparsing only the nested task queue status.

`task:review` / `task_ready_for_review` return the explicit lifecycle mutation result for handing a claimed task to its verifier. They emit a machine-readable `recommendedReason` so automation can treat review handoff as its own protocol step instead of inferring it only from the nested task queue status.

`task:release` / `task_release` return the explicit lifecycle mutation result for returning a claimed task to the queue. They emit a machine-readable `recommendedReason` so automation can distinguish an intentional owner-side release from blocked recovery or verifier-return flows without reparsing only the nested task queue status.

`task:approve` / `task_approve` return the explicit lifecycle mutation result for verifier approval. They emit a machine-readable `recommendedReason` so automation can branch on explicit approval instead of inferring final acceptance only from the nested task queue status.

`task:done` / `task_done` return the explicit lifecycle mutation result for verifier completion through the done alias. They emit a machine-readable `recommendedReason` so automation can branch on explicit completion even when callers choose the done surface instead of the approve surface.

`task:reject` / `task_reject` return the explicit lifecycle mutation result for verifier-requested rework. They emit a machine-readable `recommendedReason` so automation can distinguish changes requested back to claimed work from release-for-rework or block-for-rework variants without reparsing only the nested task queue status.

`task:review` hands work from the owner to the named verifier. After that point, only the verifier can close the task with `task:approve` / `task:done`, or send it back with `task:reject`. Review outcomes persist reviewer identity and optional `--evidence` so completion carries fresh verification context instead of skipping straight from worker claim to done.

Swarm contracts can carry bounded parallel execution detail:

- `--owner leader`
- `--topology bounded-local`
- `--max-workers 2`
- `--lane-source manual`
- `--lanes '[{"lane":"lane-1","summary":"Map scope","owner":"explore","verifier":"reviewer","scope":["src/index.js"]}]'`

`swarm:check` validates that each lane has owner, verifier, scope, acceptance, and verification metadata before queueing. It also rejects overlapping lane scopes and unknown lane roles, and now emits a machine-readable `recommendedReason` so automation can distinguish queue-ready swarms, lane-level metadata failures, top-level swarm issues, and scope overlap conflicts before deciding whether queueing is safe.

`task:brief` / `task_brief` and `swarm:brief` / `swarm_brief` turn stored coordination state into execution-ready handoff payloads. Task briefs resolve shipped role prompt paths, summarize queue/review state, identify the next actor, suggest the next CLI action, and emit a machine-readable `recommendedReason` so automation can distinguish between claimable, claimed, verifier-pending, blocked, released, and completed execution states without inferring from queue status alone. Swarm briefs keep the same execution-handoff role for bounded parallel lanes and emit machine-readable reasons for queueing planned lanes, review-ready lanes, runnable dispatch lanes, active claimed lanes, blocked lanes, and completed swarms.

`task:history` / `task_history` expose structured handoff history for each task—claims, review handoff, changes requested, releases, and approvals—so local coordination stays auditable instead of collapsing into one final status field. They also emit a machine-readable `recommendedReason` for the latest recorded handoff event so automation can distinguish approval tails, changes-requested tails, review handoff tails, blocked tails, release tails, claim tails, and empty history state without reparsing the last history entry by hand.

`task:annotate` / `task_annotate` add lightweight persistent execution notes to a task. Use them for local handoff context, verifier hints, or worker breadcrumbs that should survive beyond a single chat turn. They now return the explicit `task_mutation` envelope with `recommendedReason: "task_annotated"` so automation can detect note persistence without diffing the nested task by hand.

`task:report` / `task_report` build a delivery-ready package for one task: closure state, acceptance checklist, verification steps, review evidence, history, annotations, and the current next gate. They also emit a machine-readable `recommendedReason` so automation can distinguish between pending verifier decisions, approved closure readiness, changes-requested rework, blocked recovery, and plain execution-report states without inferring from queue status alone. It is the compact artifact for review-ready or done work.

`task:inbox` / `task_inbox` give each shipped role a prioritized local work queue, and `task:next` / `task_next` resolve the single best next claim-or-review candidate with its full execution brief attached. Both surfaces emit a machine-readable `recommendedReason`: inbox explains whether review, claimed, blocked, claimable, observe-only, next-candidate, or empty state currently dominates the worker-facing queue, while next explains the exact candidate class before mutating anything. This is the bridge from persisted coordination state to an actual Codex worker pickup loop.

`task:assignment-preview` / `task_assignment_preview` provide the read-only leader-dispatch preview path: they show the next leader-assigned lane for one role, its execution brief, and the exact next command without mutating queue ownership. They also emit a machine-readable `recommendedReason` so automation can distinguish between claimable, review, continue, blocked, observe-only, missing-task, and no-assignment preview states before dispatching work.

`task:assignment-pickup` / `task_assignment_pickup` provide the explicit leader-dispatch acceptance path: they pick the next leader-assigned lane for one role, claim it for the worker when it is dispatchable, and otherwise return the exact continue/review/release command for that assigned task instead of falling back to the broader inbox. They also emit a machine-readable `recommendedReason` so automation can distinguish between claimable assignment work, continue/review/blocked follow-up, observe-only fallback, missing-task errors, claim failures, and no-assignment idle states.

`task:pickup` / `task_pickup` turn that candidate into action: claimable owner work is auto-claimed for the worker, while claimed or review-ready work returns the exact next handoff command. They also emit a machine-readable `recommendedReason` so automation can distinguish between claimable work, continue/review/release follow-up, observe-only states, and empty pickup fallback without reparsing relation labels or summary prose. This keeps the pickup loop explicit without hiding lifecycle transitions.

`worker:session` / `worker_session` aggregate the real local workspace for one worker: active claimed tasks, review queue, recent handoff history, next candidate, and the current focus command. They also emit a machine-readable `recommendedReason` so automation can distinguish between active, review, blocked, awaiting-review, pickup-next, and idle worker focus states without reparsing the summary sentence. This is the closest surface yet to a repo-native agent console.

`worker:handoff` / `worker_handoff` package that workspace into a return-ready payload: current focus, task brief, recent history, recent annotations, next candidate, and one summary sentence that another worker or leader can pick up immediately. They also emit a machine-readable `recommendedReason` so automation can distinguish between active, review, blocked, awaiting-review, pickup-next, and idle handoff states without reparsing the summary sentence.

`worker:closeout` / `worker_closeout` add the closure layer on top: current handoff, task report, and the concrete closeout command. They also emit a machine-readable `recommendedReason` so automation can distinguish between review handoff, verifier decision, blocked release, closure-ready fallback, and empty closeout states without reparsing the summary prose. This is the bundle a worker can emit when returning work for review, approval, or final archive.

`verifier:bundle` / `verifier_bundle` provide the symmetric decision artifact for the verification lane: current review target, task report, recent context, and approve/reject commands. They also emit a machine-readable `recommendedReason` so automation can distinguish between decision-ready review targets, closure-report visibility, handoff-only fallback, and no-target idle states without reparsing summary prose. This keeps the reviewer side as productized as the worker side.

`leader:assignment-dispatch` / `leader_assignment_dispatch` provide the explicit leader-to-worker handoff package for one assignment: the chosen lane assignment plus the exact preview and pickup commands the target worker should run next. It also emits a machine-readable `recommendedReason` so automation can distinguish between a ready dispatch handoff, a missing requested assignment, a visible owner group without a chosen task, and a fully empty dispatch surface before expanding into batch dispatch packs.

`leader:assignment-dispatch-bundle` / `leader_assignment_dispatch_bundle` provide the parallel startup bundle for the leader lane: a flattened launch queue across owner groups with real worker-targeted preview, pickup, worker-session, and runtime-assignment-pack commands when `--workers` / `workerIds` are supplied. It also emits a machine-readable `recommendedReason` so automation can distinguish between parallel worker-launch readiness, owner-group visibility, single next-launch readiness, and empty launch fallback before expanding into a launch plan.

`leader:assignment-launch-plan` / `leader_assignment_launch_plan` provide the leader-ready startup checklist: one ordered startup step per worker launch with the concrete runtime commands the leader should run first. It also emits a machine-readable `recommendedReason` so automation can distinguish between parallel startup-step readiness, parallel launch-bundle visibility, single next-step readiness, and empty startup fallback before executing the plan.

`leader:assignment-dispatch-pack` / `leader_assignment_dispatch_pack` provide the batch leader handoff package: one worker-targeted dispatch package per owner group so multiple workers can be started in parallel without re-deriving commands by hand. It also emits a machine-readable `recommendedReason` so automation can distinguish between parallel owner-group readiness, multi-assignment pressure, single next-assignment readiness, and empty dispatch fallback before opening larger runtime packs. Pass `--workers` on CLI or `workerIds` over MCP to inject real role-to-worker mappings into the generated preview and pickup commands.

`leader:workspace` / `leader_workspace` provide the symmetric orchestration artifact for the leader lane: multi-swarm counts, prioritized swarm focus, the next recommended action, and an embedded deep `swarm:bundle` for the current focus swarm. It also emits a machine-readable `recommendedReason` so automation can distinguish between review, dispatch, queue, closeout, blocked, active-monitoring, and empty-workspace arbitration without reparsing summary prose or nested focus fields.

`leader:queue` / `leader_queue` provide the leaner decision surface for the leader lane: a prioritized multi-swarm action queue with the current next item already selected. It also emits a machine-readable `recommendedReason` so automation can distinguish between multi-item queue pressure, a single ready next queue item, passive queue visibility, and an empty leader queue without reopening heavier leader workspaces.

`leader:assignments` / `leader_assignments` provide the owner-grouped dispatch surface for the leader lane: runnable lane work grouped by who should receive it next. It also emits a machine-readable `recommendedReason` so automation can distinguish between parallel owner-group pressure, multiple visible assignments, single next-assignment readiness, and empty dispatch state without re-deriving those branches from nested arrays.

`swarm:closeout` / `swarm_closeout` add the closure layer for swarm leadership: current swarm bundle, execution brief, and the concrete explicit closeout command when every lane is done. They also emit a machine-readable `recommendedReason` so automation can distinguish swarms that are ready to close, swarms that still require a follow-up action before closeout, and swarms with no closeout action available.

`swarm:blockers` / `swarm_blockers` add the blocker layer for swarm leadership: blocked lanes only, their task reports, and the next unblock/requeue action. They also emit a machine-readable `recommendedReason` so automation can distinguish a single unblock-ready lane, multiple blocked lanes, and empty blocker state without reparsing blocker arrays.

`swarm:bundle` / `swarm_bundle` package the leader-ready orchestration view with lane reports and a summary sentence. They also emit a machine-readable `recommendedReason` so automation can distinguish ready-to-complete swarms, review-waiting lanes, active claimed lanes, runnable dispatch lanes, and plain tracked swarm state without reparsing lane queues.

`swarm:dispatch-bundle` / `swarm_dispatch_bundle` add the dispatch layer for swarm leadership: the next runnable lane, its task brief, and the concrete dispatch command. They also emit a machine-readable `recommendedReason` so automation can distinguish runnable dispatch lanes, ready-to-complete swarms, passive dispatchable visibility, and empty dispatch state without reparsing lane payloads.

`plan` / `plan_task` return the explicit planner task payload. They emit a machine-readable `recommendedReason` so automation can distinguish single-lane and multi-lane planning outcomes without inferring that only from the returned lane array length.

`plan:queue` / `queue_plan` return the explicit planner queue result: the planned lanes plus the local tasks created from them. They emit a machine-readable `recommendedReason` so automation can distinguish single-lane and multi-lane planner queue events without inferring from the created-task array length alone.

`plan:swarm` / `plan_swarm` return the explicit planner swarm payload. They emit a machine-readable `recommendedReason` so automation can distinguish single-lane and multi-lane swarm planning outcomes without inferring that only from the returned lane array length.

`plan:swarm:queue` / `queue_plan_swarm` return the explicit planner swarm queue result: the generated swarm contract plus the local lane tasks created from it. They emit a machine-readable `recommendedReason` so automation can distinguish single-lane and multi-lane swarm queue events without inferring from the created-task array length alone.

`catalog` and the MCP `runtime_catalog` tool expose the explicit runtime catalog view for shipped local agents and skills. They emit `kind: "runtime_catalog_view"` with a machine-readable `recommendedReason` plus inventory counts so automation can distinguish a loaded catalog from an empty one without inferring state only from nested arrays. `doctor` now exposes the explicit runtime doctor view, embedding the public catalog and contract views so operators can confirm executable entrypoint health, state-file location, shipped roles/skills, and runtime delivery boundaries from one product-facing payload.

`runtime_contract` exposes the explicit runtime contract view. It emits `kind: "runtime_contract_view"` with a machine-readable `recommendedReason`, transport and responsibility counts, and the nested contract payload so automation can distinguish a loaded contract surface from ad hoc prose while sharing one stable contract shape across CLI doctor diagnostics and MCP.

`tools` and `mcp --tools` expose the explicit tool catalog view for human and automation-side inspection of the shipped MCP surface. They emit `kind: "tool_catalog_view"` with a machine-readable `recommendedReason`, top-level tool counts grouped by tool prefix, and the nested tool inventory so consumers can branch on catalog presence and coarse tool families without reparsing the full list first.

`coordination_overview` and `worker_guidelines` expose explicit MCP guidance views for the shipped local coordination model. They emit `kind: "coordination_overview_view"` and `kind: "worker_guidelines_view"` with machine-readable `recommendedReason` values and small aggregate counts so MCP consumers can treat runtime guidance as stable product protocol instead of unstructured advisory prose.

`status` and the MCP `runtime_status` tool expose the explicit runtime status view. They emit `kind: "runtime_status_view"` with a machine-readable `recommendedReason`, top-level aggregate counts, and the nested runtime summary so automation can distinguish an empty local state from a stateful runtime without inferring that only from the nested task/swarm/memory maps. `capabilities` and `runtime_capabilities` expose the explicit runtime capabilities view. They emit `kind: "runtime_capabilities_view"` with a machine-readable `recommendedReason`, category counts, and the nested capability inventory so automation can distinguish a loaded capability surface from an empty one without reparsing the full array first.

`runtime:dashboard` / `runtime_dashboard` provide the top-level operator console: leader queue and assignments plus blocked, review-pending, and actively claimed task slices in one payload. They also emit a machine-readable `recommendedReason` so automation can distinguish whether blocked tasks, pending review, active claimed work, leader queue pressure, leader assignments, or an empty workspace currently dominate the dashboard.

`runtime:dispatch` / `runtime_dispatch` provide the owner-grouped dispatch workspace: which owner roles have ready work, the next dispatch candidate for each role, and the task brief already attached for handoff. It also emits a machine-readable `recommendedReason` so automation can distinguish between parallel owner-group pressure, multiple visible assignments, a single ready dispatch candidate, and an empty dispatch workspace without reopening leader startup packs.

`runtime:dispatch-pack` / `runtime_dispatch_pack` provide the dispatch-oriented package: dispatch groups, leader startup plans when multiple owner groups are ready, role pressure, and next-actor handoffs combined into one leader/automation payload with a recommended next surface. It also emits a machine-readable `recommendedReason` so automation can distinguish between parallel launch readiness, parallel dispatch bundling, dispatch pressure, handoff pressure, and role-pressure fallback without parsing the nested dispatch summary. Pass `--workers` on CLI or `workerIds` over MCP to replace placeholder worker ids with real worker-targeted launch commands inside the nested dispatch and launch-plan surfaces.

`runtime:execution-pack` / `runtime_execution_pack` provide the execution-oriented package: focus, dispatch, leader startup plans when parallel startup is ready, role pressure, and queue control combined into one start-work entrypoint with a recommended next surface. It also emits a machine-readable `recommendedReason` so automation can distinguish between launch readiness, focus-driven urgency, dispatch pressure, role pressure, and simple leader-queue visibility without parsing the nested queue and focus summaries. Pass `--workers` on CLI or `workerIds` over MCP when this entrypoint should emit concrete worker launch commands instead of placeholder worker ids.

`runtime:activity` / `runtime_activity` provide the recent event stream: claims, blocks, review handoffs, approvals, and changes-requested events compressed into one top-level chronological feed. It also emits a machine-readable `recommendedReason` so automation can distinguish whether the newest event signals blocked recovery, review-state change, fresh claim activity, newly created work, or merely generic recent activity before drilling into the stream.

`runtime:closeout` / `runtime_closeout` provide the final closure workspace: approved done tasks and ready-to-complete swarms gathered into one operator view for explicit archive or finish actions. It also emits a machine-readable `recommendedReason` so automation can distinguish approved task closeout, generic task closeout, swarm closeout, plain closeout visibility, and empty closeout state without reparsing next-item structure.

`runtime:closeout-pack` / `runtime_closeout_pack` provide the closeout-oriented package: closeout readiness plus summary-pack and leader-pack closeout context combined into one finalization-ready payload with a recommended next surface. It also emits a machine-readable `recommendedReason` so automation can distinguish between task-ready closeout, swarm-ready closeout, inherited summary/leader closeout context, and empty-closeout fallback without parsing the pack summary. Pass `--workers` on CLI or `workerIds` over MCP to preserve real worker mappings in the nested leader-pack launch-plan surfaces.

`runtime:control-pack` / `runtime_control_pack` provide the automation/control package: summary-pack, workspace-pack, operator-pack, and leader-pack combined into one highest-level control entrypoint with a recommended next surface, while preserving leader launch bundle context inside the nested orchestration surfaces. It also emits a machine-readable `recommendedReason` so automation can tell whether summary, workspace, operator, or leader priority produced the top-level control recommendation without inferring from nested pack shape. Pass `--workers` on CLI or `workerIds` over MCP when the nested workspace-pack and leader-pack should carry real worker-targeted launch plans.

`runtime:focus` / `runtime_focus` provide the single next-action workspace: one chosen current priority across blocked work, review pressure, dispatchable lanes, role pressure, and leader queue context. They also emit a machine-readable `recommendedReason` so automation can distinguish whether blocked alerts, review pressure, dispatch pressure, role pressure, leader queue context, or idle state won the global focus decision.

`runtime:handoff-pack` / `runtime_handoff_pack` provide the handoff-oriented package: handoffs, dispatch, review, and recovery combined into one next-actor transfer entrypoint with a recommended next surface. It also emits a machine-readable `recommendedReason` so automation can distinguish between reviewer handoff pressure, review queue pressure, recovery queue pressure, and dispatch-ready transfer pressure without parsing summary prose.

`runtime:handoffs` / `runtime_handoffs` provide the next-actor transfer workspace: queued pickups, blocked recoveries, and verifier decisions grouped by who should take the next action. It also emits a machine-readable `recommendedReason` so automation can distinguish whether the current handoff head is a verifier decision, blocked recovery, owner claim, or merely grouped transfer visibility before escalating into larger handoff packs.

`runtime:leader-pack` / `runtime_leader_pack` provide the leader-oriented package: leader workspace, leader queue, dispatch pressure, leader startup plans when parallel startup is ready, and closeout readiness combined into one role-shaped payload with a recommended next surface. It also emits a machine-readable `recommendedReason` so automation can distinguish between parallel launch readiness, review-driven workspace pressure, dispatch pressure, closeout readiness, and plain leader-queue visibility without parsing the pack summary.

`runtime:operator-pack` / `runtime_operator_pack` provide the operator-oriented package: current focus plus dashboard, alerts, handoffs, and closeout readiness combined into one top-level operator payload with a recommended next surface. It also emits a machine-readable `recommendedReason` so automation can distinguish between blocked/review focus, handoff pressure, closeout readiness, high-alert pressure, and plain dashboard visibility without inferring from the summary prose.

`runtime:owner-pack` / `runtime_owner_pack` provide the owner-oriented package: owner-mode worker session, handoff, closeout, and next pickup candidate combined into one role-scoped payload with a recommended next surface. It also emits a machine-readable `recommendedReason` so automation can distinguish between active/blocked owner work, awaiting-review transitions, closeout pressure, and pickup-next pressure without parsing the pack summary.

`runtime:assignment-pack` / `runtime_assignment_pack` provide the leader-to-worker assignment package: current leader assignment context plus one worker's live session, next candidate, and assignment-scoped preview combined into one dispatch-ready payload with a recommended next surface. It also emits a machine-readable `recommendedReason` so automation can distinguish between active/review session focus, explicit leader assignment readiness, generic pickup readiness, and next-candidate fallback without parsing the pack summary. When leader-assigned lane work exists for that role, the package now recommends the explicit `task:assignment-pickup` surface instead of a generic pickup loop.

`runtime:pickup-pack` / `runtime_pickup_pack` provide the start-work pickup package: one worker's current session, next candidate, read-only pickup preview, and role context combined into one immediate start-work payload with a recommended next surface. It also emits a machine-readable `recommendedReason` so automation can distinguish between claimable pickup readiness, current session focus, pickup-command readiness, and fallback-next visibility without parsing the pack summary.

`runtime:queue-pack` / `runtime_queue_pack` provide the queue-oriented package: leader startup launch context, leader queue, dashboard queue context, and current focus combined into one queue-control payload with a recommended next surface. It also emits a machine-readable `recommendedReason` so automation can distinguish between parallel launch readiness, single-launch readiness, and plain queue review without parsing prose. When parallel startup is ready it prefers `leader:assignment-launch-plan`; when a single ready launch exists it prefers `leader:assignment-dispatch-bundle`; otherwise it falls back to the raw leader queue review surface. Pass `--workers` on CLI or `workerIds` over MCP when the nested launch context should emit concrete worker-targeted startup commands instead of placeholder worker ids.

`runtime:recovery` / `runtime_recovery` provide the recovery workspace: blocked tasks, released tasks, and changes-requested returns grouped by the kind of recovery path they need next. It also emits a machine-readable `recommendedReason` so automation can distinguish blocked recovery priority, changes-requested rework priority, released re-pickup priority, grouped recovery visibility, and empty recovery state without recomputing recovery ordering from nested entries.

`runtime:recovery-pack` / `runtime_recovery_pack` provide the recovery-oriented package: recovery groups, next-actor handoffs, and current focus combined into one restart-friendly payload with a recommended next surface. It also emits a machine-readable `recommendedReason` so automation can distinguish between blocked-recovery pressure, changes-requested returns, released repickup work, handoff fallback pressure, and blocked-focus fallback without parsing the pack summary.

`runtime:review-pack` / `runtime_review_pack` provide the review-oriented package: review groups, role pressure, and optional verifier-scoped control bundle combined into one verifier-control payload with a recommended next surface. It also emits a machine-readable `recommendedReason` so automation can distinguish between verifier-bundle readiness, review queue pressure, and verifier-role pressure without parsing the pack summary.

`runtime:role-pack` / `runtime_role_pack` provide the role-oriented package: role pressure plus optional session, owner, and verifier runtime views combined into one role-scoped workbench with a recommended next surface. It also emits a machine-readable `recommendedReason` so automation can distinguish between session-driven priority, explicit role-action pressure, verifier priority, and owner priority without parsing the pack summary.

`runtime:session-pack` / `runtime_session_pack` provide the per-worker session package: worker, owner, verifier, and role-pressure views combined into one personal runtime entrypoint with a recommended next surface. It also emits a machine-readable `recommendedReason` so automation can distinguish between worker/owner/verifier priority, review-next pressure, and pickup-next pressure without parsing the pack summary.

`runtime:signal-pack` / `runtime_signal_pack` provide the signal-oriented package: focus, alerts, activity, and role pressure combined into one monitoring entrypoint with a recommended next surface. It also emits a machine-readable `recommendedReason` so automation can distinguish between blocked/review focus, alert pressure, role pressure, and plain recent activity visibility without parsing summary prose.

`runtime:summary-pack` / `runtime_summary_pack` provide the automation-first rollup: current focus plus dashboard, alert, handoff, recovery, closeout, and compact leader launch-context counts in one single payload with a recommended next surface. It also emits a machine-readable `recommendedReason` so automation can tell whether blocked focus, recovery, handoff pressure, closeout readiness, or dashboard queue visibility won the top-level priority decision. It also accepts `--workers` on CLI or `workerIds` over MCP so the surfaced assignment dispatch bundle and launch plan can retain concrete worker mappings when downstream automation needs a lightweight startup handoff without opening the larger leader-oriented packs.

`runtime:triage-pack` / `runtime_triage_pack` provide the triage-oriented package: focus, alerts, review, and recovery combined into one issue-first operator entrypoint with a recommended next surface. It also emits a machine-readable `recommendedReason` so automation can distinguish between blocked/review focus, recovery pressure, review queue pressure, and high/medium alert pressure without parsing the pack summary.

`runtime:verifier-pack` / `runtime_verifier_pack` provide the verifier-oriented package: review pressure, current verifier decision bundle, closeout-ready approval payload, and next review candidate combined into one role-scoped payload with a recommended next surface. It also emits a machine-readable `recommendedReason` so automation can distinguish between decision-bundle readiness, closeout-readiness, review-queue pressure, and next-candidate pressure without parsing the pack summary.

`runtime:workspace-pack` / `runtime_workspace_pack` provide the orchestration workspace package: dashboard, dispatch, leader startup plans when parallel startup is ready, review, and recovery combined into one broad control surface with a recommended next surface. It also emits a machine-readable `recommendedReason` so automation can distinguish between parallel launch readiness, review pressure, blocked recovery pressure, dispatch pressure, and plain dashboard visibility without parsing the nested pack summaries. Pass `--workers` on CLI or `workerIds` over MCP to turn nested assignment launch plans into concrete worker-targeted startup steps.

`runtime:worker-pack` / `runtime_worker_pack` provide the worker-oriented package: worker session, handoff, closeout, and next candidate combined into one role-scoped payload with a recommended next surface. It also emits a machine-readable `recommendedReason` so automation can distinguish between active/blocked work, review-task closeout pressure, handoff pressure, and pickup-next pressure without parsing the pack summary.

`runtime:review` / `runtime_review` provide the verifier-grouped decision workspace: which verifier roles currently own pending review decisions, which task is next, and the task brief already attached for approve/reject handoff. They also emit a machine-readable `recommendedReason` so automation can distinguish between decision-ready review work, visible grouped review pressure, and empty review state without parsing the summary.

`task:pickup-preview` / `task_pickup_preview` provide a read-only next-pickup preview: which task a worker would pick or review next, the execution brief already attached, and the exact next command without mutating queue ownership. They also emit a machine-readable `recommendedReason` so automation can distinguish between claimable, review, continue, blocked, observe-only, and no-candidate preview states before deciding whether to mutate queue ownership.

`runtime:alerts` / `runtime_alerts` provide the compressed top-level alert stream: blocked tasks first, then pending review and swarm-ready-to-complete signals. They also emit a machine-readable `recommendedReason` so automation can distinguish blocked-task priority, pending-review priority, swarm-closeout priority, plain alert visibility, and empty alert state without reparsing the sorted alert list.

`runtime:roles` / `runtime_roles` provide the role-level execution pressure view: which shipped roles currently have verifier load, blocked owner work, claimable owner work, and the next task lane each role should move. It also emits a machine-readable `recommendedReason` so automation can distinguish verifier pressure, blocked owner pressure, claimable owner pressure, active owner pressure, and plain tracked-role visibility without reparsing per-role counts first.

Queued swarm lane tasks automatically persist `swarmId`, lane metadata, and task ownership so CLI/MCP workers can claim them without re-slicing. Swarm-linked task lifecycle changes automatically keep swarm status close to task reality, `swarm:list --detailed` gives leaders a multi-swarm dashboard, `leader:assignments` / `leader_assignments` expose runnable work grouped by owner role, `leader:queue` / `leader_queue` expose the prioritized cross-swarm action list, `leader:workspace` / `leader_workspace` choose the current orchestration focus across those swarms, `swarm:overview` summarizes one swarm and emits a machine-readable `recommendedReason` so automation can distinguish closeout-ready, review-waiting, blocked, dispatch-ready, claimed, and still-unqueued lane states without reopening heavier swarm surfaces, `swarm:brief` provides the next execution handoff, `swarm:bundle` / `swarm_bundle` package the leader-ready orchestration view with lane reports and a summary sentence, `swarm:blockers` / `swarm_blockers` isolate blocked lanes for unblock work, `swarm:closeout` / `swarm_closeout` provide explicit swarm closure packaging, `swarm:dispatch-bundle` / `swarm_dispatch_bundle` package the next runnable dispatch target, `swarm:dispatch` claims the next runnable lane task for a worker, and `swarm:sync` provides an idempotent reconciliation step with a machine-readable `recommendedReason` so automation can distinguish newly synced completion/blocking/activation from unchanged steady-state swarm status.

`swarm:list` / `swarm_list` return the explicit swarm retrieval view. They emit `kind: "swarm_view"` with `recommendedReason: "swarm_list_has_results"` or `recommendedReason: "swarm_list_empty"`, plus a `detailed` flag so automation can distinguish empty vs non-empty swarm listings and plain vs overview-style list mode without inferring from array shape alone.

`swarm:queue` / `swarm_queue_tasks` return the explicit queue mutation result: the activated swarm plus the queued lane tasks that were created. They also emit a machine-readable `recommendedReason` so automation can distinguish one-lane queue events, multi-lane queue events, and passive queue visibility without inferring from created-array length alone.

`swarm:dispatch` / `swarm_dispatch` return the explicit dispatch mutation result: the claimed lane, the claimed task snapshot, and the updated swarm state. They also emit a machine-readable `recommendedReason` so automation can distinguish first-time dispatch claims from released-lane reclaims without reparsing prior queue status by hand.

`swarm:get` / `swarm_get` return the explicit swarm detail view. They emit `kind: "swarm_detail"` with `recommendedReason: "swarm_detail_loaded"` so automation can distinguish one-swarm retrieval from list, brief, bundle, blocker, closeout, and overview surfaces without inferring that only from nesting shape.

`swarm:init` / `swarm_init` return the explicit swarm creation mutation result. They emit `kind: "swarm_mutation"` with `recommendedReason: "swarm_created"` so automation can distinguish durable swarm creation from later activation, queueing, and dispatch steps without inferring from the nested swarm snapshot alone.

`swarm:update` / `swarm_update` return the explicit swarm metadata mutation result. They emit `kind: "swarm_mutation"` with `recommendedReason: "swarm_updated"` so automation can distinguish contract edits from lifecycle moves like activation, blocking, completion, or cancellation without reparsing the nested swarm state alone.

`swarm:start` / `swarm_activate` return the explicit lifecycle mutation result for activating a swarm. They emit a machine-readable `recommendedReason` so automation can treat activation as a first-class protocol step instead of inferring it only from the nested swarm status field.

`swarm:block` / `swarm_block` return the explicit lifecycle mutation result for blocking a swarm. They emit a machine-readable `recommendedReason` so automation can distinguish an intentional lifecycle block from task-derived blocked state that might later surface through `swarm:sync` or `swarm:overview`.

`swarm:done` / `swarm_done` return the explicit lifecycle mutation result for completing a swarm. They emit a machine-readable `recommendedReason` so automation can treat explicit closeout as its own protocol step instead of inferring final completion only from nested swarm status.

`swarm:cancel` / `swarm_cancel` return the explicit lifecycle mutation result for cancelling a swarm. They emit a machine-readable `recommendedReason` so automation can branch on intentional cancellation instead of conflating it with blocked or unfinished derived swarm state.

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

`memory:store` / `memory_store` return the explicit memory mutation result. They emit `kind: "memory_mutation"` with `recommendedReason: "memory_stored"` so automation can distinguish durable memory writes from later search/list retrieval surfaces without inferring from the nested memory payload alone.

`memory:list` / `memory_list` return the explicit memory retrieval view. They emit `kind: "memory_view"` with `recommendedReason: "memory_list_has_results"` or `recommendedReason: "memory_list_empty"` so automation can distinguish non-empty and empty filtered memory listings without inferring from array length alone.

`memory:search` / `memory_search` return the explicit memory search view. They emit `kind: "memory_search_view"` with `recommendedReason: "memory_search_has_results"` or `recommendedReason: "memory_search_empty"` so automation can distinguish successful and empty filtered searches without inferring from result-array length alone.

## Why this project exists

Most multi-agent coding setups either hide too much logic in prompts or spread too much behavior across external systems.

Codex Bees keeps the core runtime, roles, and workflow surfaces in the repository, where they can be inspected, reviewed, versioned, and improved like any other part of the product.
