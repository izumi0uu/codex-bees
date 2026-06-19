---
name: project-development
description: Drive bounded repository development from a concrete task brief through intake, planning, execution, verification, and handoff. Use when Codex needs to implement or coordinate real product work in this repository with explicit file ownership, parallel-safe task slicing, claim/release discipline, and evidence-based completion.
---

# Project Development

Use this skill to turn a concrete development request into a small, verifiable execution loop.

Keep the repository product-facing. Implement runtime behavior, tests, docs, and execution contracts that directly help the product. Do not turn the repo into a planning archive, legacy porting diary, or admin-process dump.

## Trigger conditions

Use this skill when the work requires one or more of the following:

- implementing a bounded feature or runtime slice
- coordinating multiple narrow agents against one concrete objective
- translating a task brief into exact file ownership and verification
- moving from planning into actual repo changes
- deciding whether a requested artifact belongs in the product repo or should stay outside it

Do not use this skill for:

- vague ideation with no concrete task brief
- tracker-only administration with no repo-facing product change
- unsupported host or multi-host compatibility work
- broad refactors without scoped acceptance criteria

## Required inputs

Before executing, make sure the task has:

- a concrete objective
- explicit acceptance criteria or a close equivalent
- a Codex-only boundary
- a likely write scope or a way to discover it
- a verification path

If any of these are missing, stop and tighten the brief before editing.

## Stage 1: Intake

1. Restate the objective in one sentence.
2. List the user-visible or runtime-visible outcome.
3. List constraints that cannot be violated.
4. Reject work that would turn the repo into admin clutter.
5. Decide whether the task is:
   - local single-lane work
   - multi-lane work that benefits from subagents
   - tracker-only work that should not expand the repo surface

### Intake stop conditions

Stop and escalate when:

- the task brief is too vague to map safely
- the request would require unsupported multi-host behavior
- the requested artifact is clearly admin residue rather than product surface
- the acceptance target cannot be stated concretely

## Stage 2: Planning

Map the task to exact files and verification.

If the work clearly benefits from bounded parallel execution, prefer a planner→swarm path instead of manually recreating lanes later. Use a generated swarm when the plan already identifies disjoint lane ownership and you want those lanes to become executable local tasks without re-slicing.

For each lane, define:

- lane identifier
- owner role
- scope files or directories
- intended outcome
- acceptance target
- verifier
- exact verification command or inspection

Keep the critical path local. Delegate only bounded side lanes with disjoint write scope.

### Planning rules

- One active writer per file.
- Prefer deletion, simplification, and existing patterns before new abstractions.
- Keep diffs small enough that reviewer/tester can verify them quickly.
- If the write scope overlaps another lane, re-slice before editing.
- If the work is really tracker-only bookkeeping or release evidence, do not encode it as permanent product repo content.

## Stage 3: Execution

Implement only inside the claimed scope.

Execution checklist:

1. Claim the lane or task before edits begin.
2. Run `task:check` / `task_check` first when the runtime task already exists, so incomplete ownership or verification metadata gets fixed before claim.
3. Run `swarm:check` / `swarm_check` before queueing or dispatching swarm lanes, especially for planner-generated swarms.
4. Reconfirm the allowed files.
5. Make the smallest change that satisfies acceptance.
6. Preserve unrelated edits.
7. If new scope appears, stop and return a follow-up instead of absorbing it silently.

### Queue and ownership rules

When using the local task runtime:

- `queued` means ready to be claimed
- `claimed` means one owner is actively working it
- `released` means ownership returned without completion
- `blocked` means work cannot continue without dependency or clarification
- `ready_for_review` means the owner is done and the verifier now owns the acceptance decision
- `done` means acceptance was met and evidence reviewed

Use release instead of freelancing when:

- the lane boundary is wrong
- another owner already controls the needed file
- the work needs to be split smaller
- the task no longer matches the objective

## Stage 4: Verification

Require fresh evidence.

Preferred order:

1. targeted command or inspection for the changed surface
2. `task:check` / `swarm:check` when the change affects execution readiness, claimability, or queue safety
3. CLI or MCP contract check if the change affects runtime behavior
4. smoke validation when the changed surface participates in the public command surface
5. swarm/task parity check when planner output is meant to become executable lanes
6. README/help parity check when commands or behavior changed

Do not mark work complete from intent alone.

### Verification evidence must include

- what was changed
- files changed
- commands or inspections run
- exact result
- remaining gaps or risks

## Stage 5: Handoff

Return a handoff that another agent could act on without re-discovery.

Every handoff should include:

- task or lane identifier
- status: done, needs-fix, blocked, or released
- changed files
- acceptance summary
- verification evidence
- follow-up or next owner

## Parallel execution rules

Use subagents only when the user has allowed them and parallel work materially helps.

Parallel-safe rules:

- split by disjoint write scope
- keep one owner per file
- do not delegate the immediate blocking critical-path edit if local work can proceed faster
- assign exact ownership in the prompt
- require subagents to preserve unrelated edits and report blockers upward
- integrate returned work only after checking scope and verification

Good parallel slices:

- repo analysis while the leader implements a different file set
- doc alignment while runtime behavior changes land elsewhere
- verification sidecar while implementation continues on unshared files

Bad parallel slices:

- two workers editing the same file
- vague “help with this feature” assignments
- delegating unresolved architectural decisions as if they were implementation tasks

## Repo cleanliness rule

Keep only product-relevant execution surfaces in the repo:

- runtime code
- tests and smoke checks
- user-facing or operator-facing docs
- agent and skill contracts that directly affect execution

Keep out of the repo unless the user explicitly wants them there:

- legacy porting diaries
- organization-specific governance doctrine
- tracker administration instructions
- long-lived admin clutter that does not change product behavior

## Completion rule

A development slice is complete only when:

- the scoped acceptance is satisfied
- verification is fresh and relevant
- changed files stay within the claimed boundary
- docs/help are updated if the public surface changed
- follow-up work, if any, is explicitly separated instead of hidden inside the claim

## Planner to swarm handoff

When the planning stage already produces bounded lane ownership, prefer one of these execution bridges:

- `plan:queue` when the plan should become local tasks directly
- `plan:swarm` when the plan should become an inspectable swarm contract first
- `plan:swarm:queue` when the plan should become a swarm and immediately queue executable lane tasks

Use the swarm path when you need:

- a durable multi-lane coordination envelope
- explicit swarm-level status separate from task-level status
- future worker claiming against lanes that were planned, not improvised

Do not create a swarm just to wrap one trivial local edit.
