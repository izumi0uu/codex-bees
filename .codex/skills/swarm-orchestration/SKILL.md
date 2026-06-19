---
name: swarm-orchestration
description: Coordinate Codex workers through explicit ownership, bounded parallel execution, queue-based claiming, and clean handoff rules.
---

# Swarm Orchestration

Use this skill when one Codex lane should coordinate multiple bounded workers against the same objective.

## When to use it

Use a swarm only when parallel work is actually helpful.

- The work has at least two independent lanes.
- Each lane can be owned by one worker at a time.
- Write scopes are disjoint, or some lanes are read-only.
- The objective and acceptance criteria are already known.
- The leader can keep the main path moving without blocking on every child result.

Do not start a swarm for vague work, one-file work, or tasks that still need discovery before they can be sliced safely.

## Core model

Treat the swarm as a small queue of bounded lanes. A swarm may be created manually or generated from planner output with `laneSource: "planner"`.

- **Leader**: owns the objective, queue, lane assignment, and final integration.
- **Worker**: claims one lane, stays inside its boundary, and returns evidence.
- **Lane**: one bounded unit of work with a clear outcome and scope.
- **Queue**: the ordered list of lanes waiting to be claimed, in progress, blocked, or `ready_for_review`.

Keep the model product-facing and reusable. Slice by user-visible surface, system boundary, or validation target — not by organization-specific labels or admin categories.

## Lane contract

Every delegated lane must include:

- lane identifier
- outcome to achieve
- owner role
- exact file, directory, or read-only boundary
- dependencies or prerequisites
- acceptance target
- required verification
- conflict rule: do not revert or overwrite unrelated changes

If any of these are missing, the lane is not ready to claim.

## Queue states

Use simple queue semantics for lane tasks, and keep them distinct from swarm-level status.

- **queued**: ready for a worker to claim
- **claimed**: owned by one worker and in progress
- **blocked**: cannot proceed without a dependency, clarification, or re-slice
- **ready_for_review**: worker finished and returned evidence
- **done**: leader reviewed the result and accepted the lane
- **released**: lane ownership returned to the queue without being accepted

A lane can only have one active owner at a time.


## Swarm-level lifecycle

A swarm has its own lifecycle separate from lane task states.

- **planned**: swarm contract exists but execution has not started
- **active**: swarm is live and can queue or work lanes
- **blocked**: swarm cannot progress without dependency or re-slice
- **completed**: swarm objective is satisfied
- **cancelled**: swarm was intentionally stopped

Do not confuse a blocked lane with a blocked swarm. Escalate to swarm-level `blocked` only when the swarm as a whole cannot continue.

## Claim rules

1. Claim only one lane at a time unless the leader explicitly bundles more than one.
2. Record ownership before edits begin.
3. Do not claim a lane whose scope overlaps another claimed lane.
4. If a lane turns out to be larger or less clear than expected, stop and return it for re-slicing.
5. If the lane is actually on the leader's critical path, keep it local instead of delegating it.

## Release rules

Release a lane back to the queue when:

- the lane is blocked by a missing dependency or decision
- the write scope overlaps another lane
- the lane needs to be split into smaller lanes
- the worker cannot complete it without leaving the assigned boundary
- the claimed work no longer matches the current objective

A release should include:

- current state of the lane
- files touched, if any
- blocker or reason for release
- recommendation for re-queue, re-slice, or reassignment


## Planner-generated swarms

When a planner already mapped disjoint lane ownership, the leader may generate a swarm directly from planner output instead of manually rewriting the same lanes. In that path:

- preserve planner lane identifiers unless re-slicing is necessary
- keep `laneSource` as `planner` so later audits can distinguish planned vs manual swarms
- queue swarm lanes into tasks only after reviewing that the generated scopes are still valid

Use manual swarm authoring only when the planner output is missing lane detail or needs structural changes before execution.

## Leader workflow

1. Load the objective, acceptance criteria, and known constraints.
2. Use swarm overview to confirm current lane status before delegating or re-slicing.
3. Keep the critical path local; delegate only bounded side lanes.
4. Break work into concrete lanes with explicit ownership.
5. Queue lanes before parallel work starts.
6. Allow workers to claim only ready lanes.
7. Review returned evidence before marking a lane done.
8. Integrate completed lanes only after scope and verification checks pass.
9. Sync swarm status when task reality has moved farther than the stored swarm status.

## Worker workflow

Use runtime helpers when available:

- `swarm:overview` / `swarm_overview` to inspect lane progress, derived status, and the next runnable lane
- `swarm:dispatch` / `swarm_dispatch` to claim the next runnable lane task for one worker
- `swarm:sync` / `swarm_sync` to align swarm status with task reality after lane progress changes

1. Claim one ready lane.
2. Restate the lane boundary before editing.
3. Stay inside the assigned scope.
4. Report blockers, overlap, and follow-up recommendations upward.
5. Return changed files, verification evidence, and any residual risks.
6. Release the lane instead of freelancing beyond the assignment.

## Verification

Every lane needs fresh evidence.

- Run the smallest check that proves the claimed outcome.
- Prefer targeted validation before broader smoke checks.
- Verify the specific surface the lane was meant to change.
- Do not mark a lane complete with intent alone, partial output, or stale results.
- The leader accepts a lane only after reviewing both scope and evidence.

A lane handoff should return:

- lane identifier
- summary of what changed
- changed files
- verification performed
- result or output snippet
- remaining risks or follow-ups

## Re-slice triggers

Stop, release, and re-slice when:

- two lanes need the same file or tight shared context
- the lane boundary is vague
- the work depends on hidden discovery
- verification cannot be defined at lane level
- the delegated work becomes the critical path
- the worker would need to expand into another lane's scope to finish
