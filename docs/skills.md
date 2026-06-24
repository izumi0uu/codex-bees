# Skills

## Shipped skills

`codex-bees` currently ships two product-facing skills inside `.codex/skills/`:

| Skill | Purpose |
| --- | --- |
| `project-development` | Drive one bounded repo-development slice from intake through verification and handoff |
| `swarm-orchestration` | Coordinate multiple bounded lanes with explicit ownership and queue discipline |

These are part of the shipped workspace bootstrap surface. They are not repo-only notes.

## 1. `project-development`

Use it when the task is a concrete product change and you need a disciplined execution loop.

It enforces five stages:

1. intake
2. planning
3. execution
4. verification
5. handoff

Key expectations:

- keep the repo product-facing
- reject admin clutter and tracker-style residue
- keep one active writer per file
- update docs/help when the public surface changes
- require fresh verification before closure

Use it for:

- bounded features
- runtime slices
- docs/help/product-surface work
- task-to-file mapping with explicit verifier ownership

Do not use it for:

- vague ideation
- unsupported multi-host work
- tracker-only administration

## 2. `swarm-orchestration`

Use it when the work has multiple independent lanes and parallel execution actually helps.

Core concepts:

- leader
- worker
- lane
- queue
- swarm-level lifecycle

Key expectations:

- split only by disjoint scope
- keep one owner per file
- release and re-slice instead of freelancing
- preserve planner-generated lane identity when useful
- treat verifier closure as distinct from worker completion

Use it for:

- bounded multi-lane implementation
- planner-to-swarm execution
- leader/worker handoff discipline

Do not use it for:

- one-file work
- vague work with no acceptance target
- parallelism for its own sake

## Product surface vs repo-internal artifacts

### Product-facing skill surface

- `.codex/skills/project-development/SKILL.md`
- `.codex/skills/swarm-orchestration/SKILL.md`

### Repo-internal execution residue

Not part of the shipped skill product surface:

- `.omx/` planning logs
- chat-derived planning notes
- temporary task breakdowns that are not encoded into the shipped skills

## How to inspect them

```bash
codex-bees catalog:skills
codex-bees catalog:skill --id project-development
codex-bees catalog:skill-doc --id project-development
```
