---
name: swarm-orchestration
description: Coordinate Codex workers through explicit ownership, bounded parallel execution, and clean handoff rules.
---

# Swarm Orchestration

Use this skill when one Codex lane should coordinate multiple bounded workers against the same objective.

## Preconditions

- The work has at least two independent lanes.
- Each lane has a disjoint write scope or is read-only.
- The task brief and acceptance are already known.
- The leader can keep the critical path moving without waiting on every child result.

## Required lane contract

Every delegated lane must specify:

- task or work-item identifier when one exists
- owner role
- exact file or directory ownership
- acceptance target
- verifier or review expectation
- conflict rule: the worker is not alone in the codebase and must not revert unrelated edits

## Leader workflow

1. Load the objective and the active task brief.
2. Keep the critical path local; delegate sidecar lanes only.
3. Split work by concrete surfaces, not vague effort buckets.
4. Record ownership before parallel edits begin.
5. Integrate completed lanes only after reviewing their write scope and evidence.

## Worker expectations

1. Stay inside the assigned file boundary.
2. Report blockers, overlap, and follow-up recommendations upward.
3. Do not expand into another lane's file set without re-slicing ownership.
4. Return changed files and verification evidence, not just a status phrase.

## Verification

- Run the smallest checks that prove the claimed lane outcome.
- Prefer targeted validation before broader smoke checks.
- Do not mark a lane complete without fresh evidence and a handoff summary.

## Stop conditions

Stop and re-slice if:

- two lanes need the same file
- the delegated task is actually on the critical path
- the task scope is too vague to assign safely
- a worker's changes would violate the Codex-only boundary
