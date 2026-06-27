# CLI

## Purpose

The CLI is the primary operator-facing surface of `codex-bees`.

Use it to:

- open the default TUI home
- bootstrap `.codex` assets into a repo
- inspect the runtime contract and shipped catalog
- generate plans, tasks, and swarms
- move tasks and swarms through their lifecycle
- open leader/worker/verifier workspaces
- inspect runtime dashboards and packs

## Start here

```bash
codex-bees
codex-bees --help
codex-bees --snapshot --section focus
codex-bees status
codex-bees commands
codex-bees command:help --name plan
```

## Interactive TUI

`codex-bees` opens a full-screen terminal UI over the existing runtime views by default.

Use it when you want:

- a smarter default operator home
- keyboard navigation across dashboard / focus / handoffs / recovery / status
- a lightweight terminal shell without giving up the JSON CLI surface

Useful entrypoints:

```bash
codex-bees
codex-bees tui
codex-bees --snapshot
codex-bees --snapshot --section focus
codex-bees command:help --name tui
```

`codex-bees tui` remains as the explicit alias when you want to spell the shell surface directly, but the product-facing default is now the bare command.

Inside the TUI:

- `1-6` — jump to a section
- `Tab` — cycle sections
- `o` — jump to the recommended section
- `a` — toggle live refresh
- `r` — refresh
- `.` — replay the most recent CLI command
- `?` — toggle key help
- `:` or `/` — open the launcher
- `j/k` or `Ctrl+N/Ctrl+P` — move launcher selection
- `gg` / `G` — jump to the first / last launcher result
- `↑/↓` — move the selected palette entry
- `Tab` — accept the selected palette entry into the prompt
- `Enter` — run the current or selected palette command
- `Esc` — cancel the palette
- `q` — quit

The launcher ranks:

- current runtime-recommended commands first
- quick runtime actions and screen jumps alongside commands
- exact command and alias matches next
- group / description matches after that

It also behaves more like an app shell now:

- grouped secondary matches with lightweight icons
- a multi-segment status bar at the bottom
- recent command history that can be replayed with `.`
- launcher lanes for recent commands and captured result review

This keeps the TUI product-facing: you still use the same shipped CLI surface, but you no longer need to remember every command name from scratch.

When the terminal is wide enough, the TUI also switches into a split-pane shell:

- **left pane** — navigator, quick actions, recent actions, live refresh status, alert pressure, and recent event stream
- **right pane** — the active runtime surface or launcher details / preview

Interactive sessions keep live refresh enabled by default, so task / swarm / alert / guide-mode changes can surface in the sidebar without leaving the TUI.

## Command groups

The top-level help now groups the CLI into seven product-facing surfaces:

1. **Core setup & inspection**
   - bootstrap a repo
   - inspect contract, catalog, capabilities, and tool surfaces
2. **Planning**
   - generate plans
   - queue plan lanes
   - create swarm contracts from objectives
3. **Task execution**
   - create, claim, update, release, review, archive, and reopen tasks
4. **Leader, worker, and verifier workspaces**
   - open role-specific bundles and launch-ready handoffs
5. **Swarm coordination**
   - manage bounded multi-lane envelopes
6. **Runtime views & packs**
   - inspect dashboards, queue summaries, and role-targeted packs
7. **Memory**
   - store and retrieve durable local notes

## Common paths

### Bootstrap a repo

```bash
codex-bees init --preview
codex-bees init
codex-bees status
```

### Shape work before execution

```bash
codex-bees plan --task "Ship grouped CLI help"
codex-bees plan:queue --task "Ship grouped CLI help"
codex-bees plan:swarm --task "Coordinate grouped CLI help"
```

### Pick up the next task

```bash
codex-bees task:next --role executor --worker worker-1
codex-bees task:pickup --role executor --worker worker-1
codex-bees task:review --id <task-id> --by worker-1
```

### Coordinate workers

```bash
codex-bees leader:workspace
codex-bees leader:assignment-dispatch-bundle
codex-bees leader:assignment-launch-plan
```

### Operate a swarm

```bash
codex-bees swarm:init --objective "Coordinate a release slice"
codex-bees swarm:overview --id <swarm-id>
codex-bees swarm:queue --id <swarm-id>
```

### Inspect runtime state

```bash
codex-bees
codex-bees tui
codex-bees runtime:dashboard
codex-bees runtime:leader-pack
codex-bees runtime:summary-pack
```

## Machine-readable catalog

`codex-bees commands` returns a structured command catalog view.

That view includes:

- flat command entries
- group metadata for each command
- grouped command sections
- common command paths

Use it when another tool needs to inspect the CLI surface without scraping help text.

## Help model

There are three levels of CLI help:

- `codex-bees --help` — product-facing overview
- `codex-bees commands` — structured full catalog
- `codex-bees command:help --name <command>` — one-command detail

Subcommand-specific help also exists for:

- `codex-bees init --help`
- `codex-bees mcp --help`

## Operator guidance

Prefer the CLI when:

- you are driving the runtime directly
- you want shell-friendly commands
- you are debugging the product surface
- you want to inspect state without an MCP client

Prefer the MCP surface when another Codex host or tool should call the same capabilities programmatically.
