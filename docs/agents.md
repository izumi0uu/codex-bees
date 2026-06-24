# Agents

## Shipped agents

`codex-bees` ships four narrow local agent contracts in `.codex/agents/`:

| Agent | Owns | Does not own |
| --- | --- | --- |
| `explore` | read-only discovery, scope mapping, verification anchors | code edits, final acceptance |
| `executor` | bounded implementation inside claimed files | broad redesign, unclaimed edits |
| `reviewer` | scope/risk/handoff review | hidden implementation work |
| `tester` | targeted validation and regression evidence | acceptance by intuition, broad implementation |

These are the role ids the planner and runtime expect.

## Why the roles are narrow

The product intentionally keeps roles small so lane ownership is auditable:

- discovery is distinct from implementation
- implementation is distinct from review
- review is distinct from verification
- verification is distinct from task expansion

This supports the core runtime rules:

- one active writer per file
- explicit owner/verifier separation
- bounded handoffs

## Runtime expectations

The local runtime validates owner and verifier roles against the shipped local agent catalog.

That means the `.codex/agents/` directory is part of the real product contract, not decoration.

## Config surface

The shipped `.codex/config.toml` describes the project and the shipped local agent entries used by Codex.

Current shipped agent set:

- `explore`
- `executor`
- `reviewer`
- `tester`

## Inspecting the agent surface

```bash
codex-bees catalog:agents
codex-bees catalog:agent --id executor
codex-bees catalog:agent-doc --id executor
```

## Product-facing vs repo-internal

### Product-facing

- `.codex/agents/*.md`
- `.codex/config.toml`
- runtime validation against shipped role ids

### Repo-internal

- ad hoc orchestration notes outside `.codex/agents/`
- `.omx/` execution history
- implementation modules that power role lookup but are not themselves role contracts
