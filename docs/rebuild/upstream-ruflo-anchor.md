# Upstream rebuild anchor: ruflo

- Upstream repository: `https://github.com/ruvnet/ruflo`
- Default branch: `main`
- Pinned commit: `da901d06cc5661ebf3f66a962dc116464e7980b0`
- Observed on: `2026-06-19` (Asia/Shanghai)

## Why this file exists

This repository is being rebuilt as a Codex-only, high-fidelity derivative project.
The rebuild must preserve structural intent from the authoritative upstream while deliberately removing Claude-first and multi-host assumptions from the first pass.

## Verified upstream facts

- The project is a Node/TypeScript CLI-centered codebase.
- The top-level repository includes `bin/`, `.claude-plugin/`, `.claude/`, `.agents/`, and `v3/` surfaces.
- The upstream package contract exposes a CLI entry and positions the system as an agent orchestration harness with native Claude Code and Codex integration.
- The upstream README documents a Claude plugin marketplace path and a fuller CLI install path.

## Codex-only rebuild consequence

For `codex-bees`, this means:

1. We should preserve the inside-out architecture pattern: CLI/runtime -> MCP/tooling -> agent/skill surfaces -> docs.
2. We should not copy the Claude plugin marketplace surface into the first-pass target.
3. We should replace Claude-first branding and contracts with Codex-first equivalents while keeping comparable execution depth.
4. All later parity claims should be checked against this pinned upstream anchor rather than vague memory.
