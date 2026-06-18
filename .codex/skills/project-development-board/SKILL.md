---
name: project-development-board
description: Execute Jira-driven Codex work in this repository with explicit board rules, story hygiene, file ownership, validation gates, proactive subagent delegation rules, and parallel multi-agent handoff discipline. Use when Codex is asked to implement, coordinate, claim, split, verify, or hand off work from the CB Jira board or from repo stories/tasks that must run safely in parallel.
---

# Project Development Board

Use this skill to turn CB Jira work items into safe, parallel Codex execution.

## Required Inputs

Load these before editing:
- the Jira issue key and current issue body
- the parent long-story when the issue is a task or subtask
- relevant planning artifacts under `.omx/plans/` when the issue references rebuild scope
- repo-local AGENTS.md guidance

Do not start implementation when the issue is missing any of these:
- clear problem
- clear outcome
- bounded scope
- testable acceptance

If the issue body is too vague, stop and tighten the Jira issue first.

## Canonical Issue Shape

Every executable Jira task should stay readable in this shape:
- Problem
- Outcome
- Scope
- Non-goals
- Dependencies
- Acceptance
- Notes

Do not treat a one-line ticket title as sufficient authority for edits.

## Stage Model

### 1. Intake

- Confirm the issue belongs to project `CB`.
- Confirm the issue still fits the Codex-only boundary.
- Confirm dependencies are either done or explicitly non-blocking.
- Extract the exact repo surfaces allowed to change.
- Translate acceptance into concrete verification commands.

### 2. Planning

- Map the issue to files, commands, and likely risks.
- Decide whether the issue is single-owner or needs parallel lanes.
- If parallel lanes are needed, split by surface, not by vague effort buckets.
- Record which lane owns which files before editing.
- Decide whether the leader should work directly or proactively open subagents.

### 3. Execution

- Change only the files owned by the claimed lane.
- Prefer deletion, replacement, and boundary repair over additive abstraction.
- Keep diffs small and reversible.
- Keep the Jira issue scope tighter than the parent long-story scope.

### 4. Verification

- Run the smallest checks that prove the issue acceptance.
- Read command output instead of assuming success.
- Re-run checks after meaningful follow-up edits.
- Do not move the issue forward without fresh evidence.

### 5. Handoff

- Summarize changed files.
- Summarize what passed.
- Name remaining risks, blockers, or dependent next issues.
- Update Jira comment/status only with evidence-backed facts.

## Board Rules

### Work item hierarchy

For this repo's CB board, use the real hierarchy:
- `长篇故事` = lane / epic-scale outcome
- `任务` = executable story-sized deliverable
- `子任务` = bounded implementation action inside one task

Do not invent a second hierarchy in chat.

### Claim rules

- One agent owns one Jira issue at a time.
- One issue should map to one primary verification cluster.
- One file should have one active writer at a time unless a leader explicitly coordinates a merge boundary.
- If two issues need the same file, the narrower issue yields or the leader re-slices the work.

### Parallel rules

Run in parallel only when lanes have distinct ownership, such as:
- docs vs runtime
- skill surface vs runtime surface
- tests/verification evidence vs implementation lane
- separate directories with no shared write targets

Do not run in parallel when agents would touch:
- the same file
- the same exported API surface
- the same README section
- the same skill body
- the same Jira issue body

## Subagent Delegation Rules

Default to direct execution.

### Proactively open subagents when all of these are true

- the task has at least two independent lanes
- each lane has a disjoint write scope or a purely read-only scope
- the leader can keep the critical path moving locally without waiting
- delegation will materially reduce total time or improve verification quality

Typical good delegation patterns:
- implementation lane + verification lane
- README or docs lane + runtime lane
- skill lane + agent-prompt lane
- Jira hygiene or board update lane + repo implementation lane

### Do not open subagents when any of these are true

- the next local step is blocked on the result
- the work is small enough that direct execution is faster
- the task requires tightly coupled reasoning across the same files
- multiple lanes would edit the same file or the same public interface
- the only split is artificial effort splitting rather than real ownership splitting

### Critical-path rule

- Keep urgent blocking work local.
- Delegate sidecar work, not the immediate blocker.
- While subagents run, continue non-overlapping local work instead of waiting by reflex.

### Delegation limit

- Keep the number of active child agents small and intentional.
- Prefer one to three active lanes.
- Do not exceed the repo-wide maximum concurrent child-agent limit.

### Required delegation contract

Every delegated lane must state:
- Jira issue key
- owner role
- exact files or directories owned
- acceptance target
- verifier or review expectation
- conflict rule: the agent is not alone in the repo and must not revert unrelated work from other lanes

Use concise assignment shapes like:
- `Owner: executor | Issue: CB-10 | Scope: src/index.js, package.json | Goal: define runtime contract | Verifier: tester`
- `Owner: writer | Issue: CB-8 | Scope: README.md | Goal: rewrite Codex-only narrative | Blocked by: none`

### Waiting rule

- Do not wait on a subagent unless the next critical-path action truly depends on its result.
- Prefer integrating completed delegated work after finishing the current local non-overlapping step.

### Merge rule

- One lane owns final edits for any shared file.
- If two delegated lanes discover overlapping write scope, stop one lane, re-slice ownership, and record the new boundary before continuing.

### Status discipline

Use this progression:
- `待办` or equivalent backlog state: issue is ready but unclaimed
- `进行中` or equivalent active state: exactly one active owner is implementing
- `已阻止` or equivalent blocked state: blocked by dependency, missing authority, or failing prerequisite
- `已完成` or equivalent done state: acceptance evidence exists and handoff is written

Do not move to done because code merely exists.

## Multi-Agent Ownership Contract

When multiple agents are involved, assign these roles explicitly:
- implementation owner
- verification owner
- review or handoff owner
- leader or coordinator owner when multiple child lanes exist

A single agent may hold more than one role only when the task is small and no parallel benefit exists.

### File ownership note format

Use a concise note or comment pattern like:
- `Owner: executor | Scope: src/index.js, package.json | Verifier: tester`
- `Owner: writer | Scope: README.md | Blocked by: CB-10`

Keep ownership concrete and file-based.

### Recommended lane shapes

Use these lane shapes by default in this repo:
- `writer` for README, docs, migration notes, and Jira-copy cleanup
- `executor` for runtime, MCP, and code implementation
- `tester` or equivalent verification owner for checks, evidence, and regression confirmation
- `reviewer` for final integration or handoff review when the issue spans multiple surfaces

## Jira Comment Rules

When adding a Jira comment:
- state what changed
- state what was verified
- state what remains or what is blocked
- include exact issue keys for dependencies

Do not add vague progress comments like:
- "working on this"
- "mostly done"
- "should be fixed"

## Dependency Rules

- If an issue depends on unfinished structural work, stop and link to the blocking issue.
- If a dependency is soft, name the risk explicitly.
- If a task uncovers missing planning, add a precise Jira follow-up instead of silently expanding scope.

## Validation Rules

Minimum validation before handoff:
- issue scope reviewed against current Jira body
- changed files listed
- at least one fresh command or inspection proves acceptance
- blockers and residual risks documented when present

When code changes exist, prefer this order:
1. targeted test
2. typecheck or lint
3. build or smoke check
4. review of changed files against issue acceptance

## Stop Conditions

Stop and escalate when:
- the Jira issue conflicts with the Codex-only boundary
- acceptance cannot be inferred safely
- another active lane already owns the same file set
- verification repeatedly fails and the issue likely needs rescoping
- the task would require destructive or out-of-scope product decisions

## Outputs / Handoff

At the end of a task, produce:
- issue key
- files changed
- verification evidence
- unresolved risks or blockers
- recommended next issue or next lane

At the end of a long-story, produce:
- completed child tasks
- remaining child tasks
- integration risks across lanes
- whether the long-story is ready for closure

## Repo-Specific Conventions

- Preserve the Codex-only first-pass boundary.
- Do not add Claude Code compatibility work unless a future Jira issue explicitly changes the boundary.
- Treat Jira as the execution ledger and the repo as the implementation surface.
- Keep planning in `.omx/`; keep reusable operational behavior in `.codex/skills/` and `.codex/agents/`.
- Prefer updating Jira and skill artifacts over keeping critical execution state only in chat.

## Rebuild Fidelity Standard

Treat this project as a high-fidelity Codex-specific rebuild of the source project.

### Rebuild goal

- Reproduce the source project's core capabilities, operator flows, command surfaces, module boundaries, and execution model as completely as practical.
- Rebuild from the inside out: runtime, contracts, modules, orchestration, then docs and presentation surfaces.
- Preserve user-visible behavior and system intent even when the internal Codex-native implementation changes.

### Do replicate

- CLI behavior
- core workflows
- module structure and boundaries
- config model
- command system
- tool or MCP surface
- agent and skill orchestration logic
- major user-facing functionality

### Do not blindly copy

- host-specific legacy glue that conflicts with the Codex-only boundary
- obsolete compatibility layers
- low-value technical debt that can be replaced by a cleaner Codex-native implementation
- source details that exist only for another host ecosystem

### Practical rule

- Aim for system-level completeness, not byte-level duplication.
- Preserve behavior first, then improve implementation shape where the Codex version benefits from it.
- If you intentionally diverge from the source implementation, record why in the commit message or Jira comment.

## Commit Cadence Protocol

This repo is allowed to use extremely fine-grained commits when the changes are real, bounded, and reversible.

### Commit target

- Default assumption: many small commits rather than a few large ones.
- For the full rebuild path, a 300+ commit history is acceptable when each commit represents a real atomic step.
- Do not create empty, cosmetic, or fake-separation commits just to inflate count.

### Atomic commit rule

Each commit should ideally do one of these:
- create one boundary or directory surface
- add one contract or schema
- wire one command or adapter
- implement one bounded behavior
- add one focused validation or regression check
- update one documentation or skill surface tied to the code change

### Good micro-commit examples

- scaffold one command file
- add one config parser
- add one serializer
- add one error mapper
- add one test fixture
- add one regression test
- rewrite one README section
- refine one agent prompt surface

### Bad micro-commit examples

- meaningless formatting-only churn with no decision value
- arbitrary line shuffling
- splitting one inseparable change into multiple broken intermediate states
- commits that knowingly leave the tree in a confusing or deceptive state without explanation

### Push cadence

- Commit after each real atomic step.
- Push after each verified base layer or functional slice.
- Prefer branch names that map to Jira work, such as `cb/CB-10-runtime-contract`.
- Let the leader integrate and push shared branch state after local verification.

### Commit message rule

- Use the Lore commit protocol.
- Explain why the atomic change exists, not just what changed.
- When a commit is one tiny step in a longer rebuild chain, state the layer it unlocks next.
