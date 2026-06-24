# MCP

## Purpose

`codex-bees` exposes its local runtime over **stdio JSON-RPC**.

This gives another Codex-aware host or tool a machine-facing way to call the same runtime surface without wrapping the CLI manually.

## Entry points

```bash
codex-bees mcp --help
codex-bees mcp --tools
codex-bees mcp --capabilities
codex-bees mcp --stdio
```

## What it exposes

The MCP server mirrors the product surface in tool form.

Main tool families include:

- package/runtime metadata
- command catalog and command help
- init contract inspection
- tool catalog inspection
- runtime contract and status
- planner tools
- task lifecycle tools
- swarm lifecycle tools
- leader/worker/verifier bundles
- memory tools

In other words, the MCP surface is not a separate product. It is the same local kernel exposed through a different transport.

## CLI vs MCP

| Surface | Best for |
| --- | --- |
| CLI | humans, shell scripts, quick inspection, debugging |
| MCP | Codex hosts, tool-driven flows, structured machine calls |

## Relationship to the runtime contract

The runtime contract currently states:

- delivery boundary: `codex-only runtime`
- CLI transport: `stdio`
- MCP transport: `stdio-jsonrpc`

The first version intentionally stays local and stdio-based. It does not attempt to become a remote control plane.

## Inspecting the surface

Use these commands when you need to inspect the MCP boundary before connecting a client:

```bash
codex-bees mcp --help
codex-bees mcp --tools
codex-bees mcp --capabilities
```

## Typical use

1. bootstrap or open a project
2. inspect the tool catalog
3. connect an MCP-capable Codex host
4. call planner/task/swarm/runtime tools through stdio JSON-RPC
5. keep the local repo as the source of truth

## Non-goals

The MCP surface is not trying to provide:

- hosted transport
- remote multi-tenant coordination
- cross-machine federation
- external plugin marketplace packaging
