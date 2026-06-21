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

To materialize the shipped Codex project assets into the current working directory, run `npx codex-bees init`. Use `npx codex-bees init --preview` first when you want the exact file plan before anything is written, and pass `--force` only when you intentionally want bundled assets to overwrite existing `.codex` files.

`npm run build` now rebuilds `dist/` from the shipped source modules and immediately verifies that the packaged CLI (`dist/index.js`) and MCP entrypoint (`dist/mcp.js`) both boot successfully, so the distributable surface cannot silently drift behind `src/`.

The `init` command turns the shipped package into a project starter surface again, but now in a Codex-only, productized way: it copies the bundled `.codex` agents, skills, and config into your current project, preserves existing files by default, and adds `.codex-bees/` to `.gitignore` so local runtime state stays local. `codex-bees init --preview` returns the exact create/update/skip plan as structured JSON before anything is written, and both preview/apply payloads now include a stable `summary` object so tooling can read change totals without re-deriving them from raw entries.

When the current working directory does not provide its own `.codex/agents` or `.codex/skills`, the packaged CLI and MCP server now fall back to the bundled `.codex` assets that ship inside `dist/`. That keeps installed builds usable outside the source repo instead of degrading into an empty agent/skill catalog.

The npm package is also trimmed to distributable runtime content only: `dist/`, `README.md`, and `LICENSE`. Development-only source files, smoke scripts, and repo-local orchestration docs are excluded from the published tarball.

Installed package entrypoints are part of the tested product surface too. A packed install can be exercised directly with `npx codex-bees --help`, `npx codex-bees catalog`, `npx codex-bees metadata`, `npx codex-bees status`, `npx codex-bees doctor`, `npx codex-bees tools`, `npx codex-bees capabilities`, and `npx codex-bees mcp --tools`, and the smoke suite now verifies that those installed commands still resolve the bundled runtime catalog from `dist/.codex`. It also verifies the packaged CLI and MCP entrypoints through direct `node ./node_modules/codex-bees/dist/index.js --help` / `--version` / `catalog` / `metadata` / `status` / `doctor` / `tools` / `capabilities`, routed `npx codex-bees mcp --tools` / `--version` / `--stdio` coverage, and direct `node ./node_modules/codex-bees/dist/mcp.js --help` / `--tools` / `--version` / `--stdio` execution, so the published tarball keeps both the CLI-routed and direct packaged command surfaces alive after install.

The `mcp` subcommand now has its own explicit CLI contract: `codex-bees mcp --stdio` starts the stdio runtime, `codex-bees mcp --tools` prints the tool catalog, `codex-bees mcp --capabilities` prints the shipped runtime capability inventory, `codex-bees mcp --version` prints the shipped package version, and `codex-bees mcp --help` prints subcommand help. Unknown `mcp` options fail fast with a clean CLI error instead of silently doing nothing or leaking debug stack traces from the packaged runtime.

The package is also safe to import as a module. Importing `codex-bees`, `./src/index.js`, or `./dist/index.js` no longer auto-executes the CLI entrypoint; runtime output only appears when the binary is explicitly invoked.

The root package export now exposes a small official programmatic API as well:

```js
import {
  getCommandCatalogView,
  getMcpCommandCatalog,
  getMcpCommandCatalogView,
  addTask,
  getPackageMetadata,
  getRuntimeCatalogView,
  getRuntimeDoctorView,
  getRuntimeReadyView,
  getRuntimeStatusView,
  getToolCatalogView,
  getRuntimeContractView,
  planTask,
  planSwarm,
  renderMcpHelpText,
  stateFilePath,
  storeMemory
} from "codex-bees";

const metadata = getPackageMetadata();
const status = getRuntimeStatusView({
  version: metadata.version,
  toolCount: getToolCatalogView().tools.length
});
```

The package manifest now aligns with that contract too: the root export and `main` entry both point at the library surface (`dist/api.js`), while the `codex-bees` bin continues to point at the CLI entrypoint. It also ships npm-facing project metadata for the public GitHub home, issue tracker, and searchable package keywords, so installed consumers get a package surface that behaves like a real maintained product instead of a bare internal tarball.

Official subpath exports are also available for narrower integrations:

- `codex-bees/api`
- `codex-bees/catalog`
- `codex-bees/commands`
- `codex-bees/doctor`
- `codex-bees/init`
- `codex-bees/metadata`
- `codex-bees/mcp`
- `codex-bees/planner`
- `codex-bees/runtime-ready`
- `codex-bees/state`
- `codex-bees/runtime-guidance`
- `codex-bees/runtime-status`
- `codex-bees/runtime-contract`

The `codex-bees/api` subpath mirrors the root library surface explicitly, so tools that prefer a stable named subpath can import the same public helpers without relying on the package root entry.

Example:

```js
import { getPackageMetadata, getRuntimeReadyView, getToolCatalogView } from "codex-bees/api";

const metadata = getPackageMetadata();
const ready = getRuntimeReadyView();
const tools = getToolCatalogView();
```

The `codex-bees/init` subpath exposes the same workspace bootstrap helpers that power `codex-bees init`, so tooling can preview or apply the shipped `.codex` starter surface without shelling out through the CLI.

Example:

```js
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { initWorkspace, previewWorkspaceInit } from "codex-bees/init";

const targetDirectory = mkdtempSync(join(tmpdir(), "codex-bees-init-example-"));
const preview = previewWorkspaceInit({ targetDirectory });
const applied = initWorkspace({ targetDirectory });
const previewHasChanges = preview.summary.hasChanges;
const appliedCreated = applied.summary.created;
rmSync(targetDirectory, { recursive: true, force: true });
```

The `codex-bees/state` subpath is the smallest official programmatic bridge into persisted local coordination state. It exposes helpers such as `addTask`, `getTaskView`, `listTasksView`, `initSwarm`, `listSwarmsView`, `storeMemory`, `getMemory`, `getMemoryView`, `listMemoriesView`, `validateTask`, `validateSwarm`, and `stateFilePath`.

Example:

```js
import { addTask, getMemory, getMemoryView, listTasksView, stateFilePath, storeMemory } from "codex-bees/state";

const task = addTask({
  title: "Ship a smoke-hardened release surface",
  owner: "executor",
  verifier: "tester",
  scope: ["src/index.js"],
  acceptance: ["documented package contract stays stable"],
  verification: ["npm run smoke"]
});

const memory = storeMemory({
  content: "Remember the smoke-hardened release surface",
  namespace: "release",
  kind: "note"
});

const memoryRecord = getMemory(memory.id);
const memoryDetail = getMemoryView(memory.id);
const queue = listTasksView();
const storage = stateFilePath();
```

The `codex-bees/mcp` subpath is also usable as a small programmatic adapter layer when you want the same local MCP behavior without spawning the stdio server first. It exposes:

- `listMcpTools()` for the raw tool inventory
- `getMcpToolEntry(name)` for one raw MCP tool definition lookup
- `getMcpToolView(name)` for one machine-readable MCP tool lookup view
- `getMcpCommandCatalog()` for the raw structured `mcp` subcommand option list
- `getMcpCommandCatalogEntry(option)` for one structured `mcp` subcommand option lookup
- `getMcpCommandCatalogEntryView(option)` for one machine-readable `mcp` subcommand option lookup view
- `getToolCatalogView()` for the grouped catalog view
- `getMcpCommandCatalogView()` for the structured `mcp` subcommand option catalog
- `getMcpHelpView(option)` for a machine-readable `mcp` help contract with matched option metadata
- `handleMcpRequest(message)` for one-shot JSON-RPC request handling
- `callMcpTool(name, args)` for direct tool execution
- `renderMcpHelpText()` for the same help contract printed by `codex-bees mcp --help`
- `serializeMcpMessage(message)` for newline-delimited stdio framing

Example:

```js
import { callMcpTool, getMcpCommandCatalog, getMcpCommandCatalogEntry, getMcpCommandCatalogEntryView, getMcpHelpView, getMcpToolEntry, getMcpToolView, handleMcpRequest, listMcpTools } from "codex-bees/mcp";

const tools = listMcpTools();
const packageMetadataTool = getMcpToolEntry("package_metadata");
const packageMetadataToolView = getMcpToolView("package_metadata");
const runtimeDoctorTool = getMcpToolEntry("runtime_doctor");
const runtimeDoctorToolView = getMcpToolView("runtime_doctor");
const runtimeReadyTool = getMcpToolEntry("runtime_ready");
const runtimeReadyToolView = getMcpToolView("runtime_ready");
const runtimeCapabilityTool = getMcpToolEntry("runtime_capability");
const runtimeCapabilityToolView = getMcpToolView("runtime_capability");
const runtimeContractTool = getMcpToolEntry("runtime_contract");
const runtimeContractToolView = getMcpToolView("runtime_contract");
const options = getMcpCommandCatalog();
const toolsOption = getMcpCommandCatalogEntry("--tools");
const toolsOptionView = getMcpCommandCatalogEntryView("--tools");
const helpView = getMcpHelpView("--tools");
const listed = handleMcpRequest({ jsonrpc: "2.0", id: 1, method: "tools/list" });
const metadata = callMcpTool("package_metadata");
const doctor = callMcpTool("runtime_doctor");
const ready = callMcpTool("runtime_ready");
const capability = callMcpTool("runtime_capability", { id: "memory" });
const contract = callMcpTool("runtime_contract");
```

The `codex-bees/catalog` subpath exposes the same runtime catalog view that powers `codex-bees catalog`, so tooling can inspect shipped agents, skills, asset source selection, and effective `.codex` paths without scraping CLI output. It also exposes direct agent/skill entry lookup helpers, machine-readable agent/skill lane list views, plus single-agent and single-skill views when you already know the catalog id you want.

Example:

```js
import { getAgentCatalogEntry, getAgentCatalogEntryView, getAgentCatalogListView, getRuntimeCatalogView, getSkillCatalogEntry, getSkillCatalogEntryView, getSkillCatalogListView } from "codex-bees/catalog";

const catalog = getRuntimeCatalogView();
const agents = getAgentCatalogListView();
const executorAgent = getAgentCatalogEntry("executor");
const executorAgentView = getAgentCatalogEntryView("executor");
const skills = getSkillCatalogListView();
const projectDevelopmentSkill = getSkillCatalogEntry("project-development");
const projectDevelopmentSkillView = getSkillCatalogEntryView("project-development");
```

The `codex-bees/runtime-guidance` subpath exposes the same coordination primitives that the MCP tools return, but as direct library calls:

- `getCoordinationOverview()`
- `getCoordinationOverviewView()`
- `getWorkerGuidelines()`
- `getWorkerGuidelinesView()`

Example:

```js
import { getCoordinationOverviewView, getWorkerGuidelinesView } from "codex-bees/runtime-guidance";

const overview = getCoordinationOverviewView();
const guidelines = getWorkerGuidelinesView();
```

The `codex-bees/doctor` subpath exposes the same diagnostic view that the CLI prints for `codex-bees doctor`, so integrations can inspect entrypoint health, state-file location, runtime catalog, and contract details without shelling out.

Example:

```js
import { getRuntimeDoctorView } from "codex-bees/doctor";

const doctor = getRuntimeDoctorView();
```

The `codex-bees/runtime-ready` subpath exposes the default `run` readiness view as a library call, so tools can read the startup contract and recommended next steps without scraping CLI output.

Example:

```js
import { getRuntimeReadyView } from "codex-bees/runtime-ready";

const ready = getRuntimeReadyView();
```

The `codex-bees/runtime-status` subpath exposes the same runtime inventory shape that powers `codex-bees status`, so tools can inspect counts, recommended entry points, and catalog-backed capability summaries without shelling out. It also exposes direct capability entry lookup and a machine-readable single-capability view when you already know the capability id you want.

Example:

```js
import { getCapabilityCatalogEntry, getCapabilityCatalogEntryView, getRuntimeStatusView } from "codex-bees/runtime-status";

const status = getRuntimeStatusView();
const runtimeCatalogCapability = getCapabilityCatalogEntry("runtime_catalog");
const runtimeCatalogCapabilityView = getCapabilityCatalogEntryView("runtime_catalog");
```

The `codex-bees/runtime-contract` subpath exposes the stable runtime boundary directly, so tooling can read delivery mode, transport shape, responsibilities, and exclusions without scraping CLI or MCP output.

Example:

```js
import { getRuntimeContractView } from "codex-bees/runtime-contract";

const contract = getRuntimeContractView();
```

The `codex-bees/metadata` subpath exposes the package identity contract directly, so CLI, MCP, and library consumers can all read the same name, version, description, license, homepage, issue tracker, repository URL, keyword tags, and Codex-only mode surface from one source.

Example:

```js
import { getPackageMetadata, getPackageMetadataView } from "codex-bees/metadata";

const metadata = getPackageMetadata();
const view = getPackageMetadataView();
```

The `codex-bees/planner` subpath exposes the bounded planning helpers directly, so tools can derive task lanes and swarm shapes from a prompt without shelling out through the CLI.

Example:

```js
import { planSwarm, planTask } from "codex-bees/planner";

const taskPlan = planTask("document a planner example");
const swarmPlan = planSwarm("stage a planner example");
```

The `codex-bees/commands` subpath exposes the shipped CLI command catalog and renders the same help contract that `codex-bees --help` prints, so tooling can inspect the command surface without scraping ad hoc docs. Its `mcp` and `init` command entries both carry structured option lists, and it now also exposes direct command lookup plus machine-readable single-command and help views, so one command-catalog read is enough to discover the top-level runtime bootstrap surface as well as the shipped MCP flags. For the bootstrap path specifically, it also exposes a machine-readable `init` option catalog, direct `init` option lookup, a machine-readable single-option view, and an `init` help view so tooling can stay inside the init surface without first traversing the broader command catalog.

Example:

```js
import { getCommandCatalogEntry, getCommandCatalogEntryView, getCommandCatalogView, getCommandHelpView, getInitCommandCatalog, getInitCommandCatalogView, getInitCommandCatalogEntry, getInitCommandCatalogEntryView, getInitHelpView, renderCommandHelpText, renderHelpText } from "codex-bees/commands";

const catalog = getCommandCatalogView();
const initEntry = getCommandCatalogEntry("init");
const initEntryView = getCommandCatalogEntryView("init");
const initHelpView = getCommandHelpView("init");
const initOptions = getInitCommandCatalog();
const initOptionsView = getInitCommandCatalogView();
const previewOption = getInitCommandCatalogEntry("--preview");
const previewOptionView = getInitCommandCatalogEntryView("--preview");
const initOptionHelpView = getInitHelpView("--preview");
const initHelp = renderCommandHelpText("init");
const help = renderHelpText();
```

The package now also ships lightweight TypeScript declarations for the public API surface. They are intentionally minimal, but they cover the documented root export and subpath imports well enough for editor completion, typed imports, and smoke-level compile checks in downstream projects.

## CLI

```bash
node ./src/index.js run
node ./src/index.js ready
node ./src/index.js commands
node ./src/index.js command:get --name init
node ./src/index.js command:help --name init
node ./src/index.js init:options
node ./src/index.js init:option --option --preview
node ./src/index.js init:help --option --preview
node ./src/index.js init --preview
node ./src/index.js init
node ./src/index.js mcp:options
node ./src/index.js mcp:option --option --tools
node ./src/index.js mcp:help --option --tools
node ./src/index.js tools
node ./src/index.js catalog
node ./src/index.js catalog:agents
node ./src/index.js catalog:agent --id executor
node ./src/index.js catalog:skills
node ./src/index.js catalog:skill --id project-development
node ./src/index.js guidance:overview
node ./src/index.js guidance:worker
node ./src/index.js contract
node ./src/index.js doctor
node ./src/index.js metadata
node ./src/index.js status
node ./src/index.js capabilities
node ./src/index.js capabilities:get --id memory
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
node ./src/index.js tools:get --name runtime_contract
node ./src/index.js memory:store --content "Remember the MCP contract" --namespace runtime --tags mcp,contract
node ./src/index.js memory:get --id memory-1
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

`task:list` / `task_list` return the explicit task retrieval view. They emit `kind: "task_view"` with `recommendedReason: "task_list_has_results"` or `recommendedReason: "task_list_empty"`, plus `counts.totalTasks`, so automation can distinguish non-empty and empty task listings and read compact task cardinality without inferring only from array length.

`task:get` / `task_get` return the explicit task detail view. They emit `kind: "task_detail"` with `recommendedReason: "task_detail_loaded"` plus lightweight `metadata` (`hasHistory`, `hasAnnotations`, `reviewState`) so automation can distinguish one-task retrieval from list, brief, history, and report surfaces while also understanding detail readiness without reparsing the full nested task.

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

`task:brief` / `task_brief` and `swarm:brief` / `swarm_brief` turn stored coordination state into execution-ready handoff payloads. Task briefs resolve shipped role prompt paths, summarize queue/review state, identify the next actor, suggest the next CLI action, and emit compact `counts` for scope, acceptance, verification, review evidence, history, and annotations plus a machine-readable `recommendedReason` so automation can distinguish between claimable, claimed, verifier-pending, blocked, released, and completed execution states without inferring from queue status alone. Swarm briefs keep the same execution-handoff role for bounded parallel lanes and emit machine-readable reasons for queueing planned lanes, review-ready lanes, runnable dispatch lanes, active claimed lanes, blocked lanes, and completed swarms.

`task:history` / `task_history` expose structured handoff history for each task—claims, review handoff, changes requested, releases, and approvals—so local coordination stays auditable instead of collapsing into one final status field. They also emit `counts.totalHistoryEntries` and a machine-readable `recommendedReason` for the latest recorded handoff event so automation can distinguish approval tails, changes-requested tails, review handoff tails, blocked tails, release tails, claim tails, and empty history state without reparsing the last history entry by hand.

`task:annotate` / `task_annotate` add lightweight persistent execution notes to a task. Use them for local handoff context, verifier hints, or worker breadcrumbs that should survive beyond a single chat turn. They now return the explicit `task_mutation` envelope with `recommendedReason: "task_annotated"` so automation can detect note persistence without diffing the nested task by hand.

`task:report` / `task_report` build a delivery-ready package for one task: closure state, acceptance checklist, verification steps, review evidence, history, annotations, and the current next gate. They also emit compact `counts` for acceptance items, verification steps, review evidence, annotations, and recent history, plus a machine-readable `recommendedReason` so automation can distinguish between pending verifier decisions, approved closure readiness, changes-requested rework, blocked recovery, and plain execution-report states without inferring from queue status alone. It is the compact artifact for review-ready or done work.

`task:inbox` / `task_inbox` give each shipped role a prioritized local work queue, and `task:next` / `task_next` resolve the single best next claim-or-review candidate with its full execution brief attached. Both surfaces emit a machine-readable `recommendedReason`: inbox explains whether review, claimed, blocked, claimable, observe-only, next-candidate, or empty state currently dominates the worker-facing queue, while next explains the exact candidate class before mutating anything. This is the bridge from persisted coordination state to an actual Codex worker pickup loop.

`task:assignment-preview` / `task_assignment_preview` provide the read-only leader-dispatch preview path: they show the next leader-assigned lane for one role, its execution brief, and the exact next command without mutating queue ownership. They also emit lightweight `metadata` (`hasAssignment`, `hasTask`, `hasBrief`, `taskId`) plus a machine-readable `recommendedReason` so automation can distinguish between claimable, review, continue, blocked, observe-only, missing-task, and no-assignment preview states before dispatching work.

`task:assignment-pickup` / `task_assignment_pickup` provide the explicit leader-dispatch acceptance path: they pick the next leader-assigned lane for one role, claim it for the worker when it is dispatchable, and otherwise return the exact continue/review/release command for that assigned task instead of falling back to the broader inbox. They also emit a machine-readable `recommendedReason` so automation can distinguish between claimable assignment work, continue/review/blocked follow-up, observe-only fallback, missing-task errors, claim failures, and no-assignment idle states.

`task:pickup` / `task_pickup` turn that candidate into action: claimable owner work is auto-claimed for the worker, while claimed or review-ready work returns the exact next handoff command. They also emit a machine-readable `recommendedReason` so automation can distinguish between claimable work, continue/review/release follow-up, observe-only states, and empty pickup fallback without reparsing relation labels or summary prose. This keeps the pickup loop explicit without hiding lifecycle transitions.

`worker:session` / `worker_session` aggregate the real local workspace for one worker: active claimed tasks, review queue, recent handoff history, next candidate, and the current focus command. They also emit a machine-readable `recommendedReason` so automation can distinguish between active, review, blocked, awaiting-review, pickup-next, and idle worker focus states without reparsing the summary sentence. This is the closest surface yet to a repo-native agent console.

`worker:handoff` / `worker_handoff` package that workspace into a return-ready payload: current focus, task brief, recent history, recent annotations, next candidate, and one summary sentence that another worker or leader can pick up immediately. They also emit a machine-readable `recommendedReason` so automation can distinguish between active, review, blocked, awaiting-review, pickup-next, and idle handoff states without reparsing the summary sentence.

`worker:closeout` / `worker_closeout` add the closure layer on top: current handoff, task report, and the concrete closeout command. They also emit a machine-readable `recommendedReason` so automation can distinguish between review handoff, verifier decision, blocked release, closure-ready fallback, and empty closeout states without reparsing the summary prose. This is the bundle a worker can emit when returning work for review, approval, or final archive.

`verifier:bundle` / `verifier_bundle` provide the symmetric decision artifact for the verification lane: current review target, task report, recent context, and approve/reject commands. They also emit lightweight `metadata` (`hasCurrentTask`, `hasReport`, `reviewTaskId`) and compact `counts` for recent history, recent annotations, and available decision commands, plus a machine-readable `recommendedReason` so automation can distinguish between decision-ready review targets, closure-report visibility, handoff-only fallback, and no-target idle states without reparsing summary prose. This keeps the reviewer side as productized as the worker side.

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

`swarm:dispatch-bundle` / `swarm_dispatch_bundle` add the dispatch layer for swarm leadership: the next runnable lane, its task brief, and the concrete dispatch command. They also emit lightweight `metadata` (`hasNextLane`, `hasTaskBrief`, `nextLaneId`) and compact `counts` for dispatchable lanes and next-lane commands, plus a machine-readable `recommendedReason` so automation can distinguish runnable dispatch lanes, ready-to-complete swarms, passive dispatchable visibility, and empty dispatch state without reparsing lane payloads.

`plan` / `plan_task` return the explicit planner task payload. They emit a machine-readable `recommendedReason` so automation can distinguish single-lane and multi-lane planning outcomes without inferring that only from the returned lane array length.

`plan:queue` / `queue_plan` return the explicit planner queue result: the planned lanes plus the local tasks created from them. They emit a machine-readable `recommendedReason` so automation can distinguish single-lane and multi-lane planner queue events without inferring from the created-task array length alone.

`plan:swarm` / `plan_swarm` return the explicit planner swarm payload. They emit a machine-readable `recommendedReason` so automation can distinguish single-lane and multi-lane swarm planning outcomes without inferring that only from the returned lane array length.

`plan:swarm:queue` / `queue_plan_swarm` return the explicit planner swarm queue result: the generated swarm contract plus the local lane tasks created from it. They emit a machine-readable `recommendedReason` so automation can distinguish single-lane and multi-lane swarm queue events without inferring from the created-task array length alone.

`catalog` and the MCP `runtime_catalog` tool expose the explicit runtime catalog view for shipped local agents and skills. They emit `kind: "runtime_catalog_view"` with a machine-readable `recommendedReason` plus inventory counts so automation can distinguish a loaded catalog from an empty one without inferring state only from nested arrays. `catalog:agents` and `catalog:skills` now expose explicit lane views, returning `kind: "runtime_catalog_lane_view"` with `recommendedReason` set to `catalog_lane_loaded` or `catalog_lane_empty`, plus `entryType` and `counts.totalEntries`, so automation can stay inside just one lane without unpacking the broader combined catalog payload first. MCP now exposes the matching `runtime_catalog_agents` and `runtime_catalog_skills` tools with the same lane-view payload shape, plus `runtime_catalog_agent` and `runtime_catalog_skill` for the paired single-entry lookup path, so CLI, library, and MCP consumers can all bind to the same narrow agent/skill inventory contract. `catalog:agent` and `catalog:skill` expose the paired single-entry views, returning `kind: "runtime_catalog_entry_view"` with `recommendedReason` set to `catalog_entry_loaded` or `catalog_entry_missing` so automation can inspect one shipped worker or skill contract without walking the full catalog. `doctor` now exposes the explicit runtime doctor view, embedding the public catalog and contract views so operators can confirm executable entrypoint health, state-file location, shipped roles/skills, and runtime delivery boundaries from one product-facing payload. MCP now exposes that same view through `runtime_doctor`, so diagnostics stay transport-symmetric too.

`runtime_contract` exposes the explicit runtime contract view. It emits `kind: "runtime_contract_view"` with a machine-readable `recommendedReason`, transport and responsibility counts, and the nested contract payload so automation can distinguish a loaded contract surface from ad hoc prose while sharing one stable contract shape across CLI doctor diagnostics and MCP. `contract` exposes that same view directly on the CLI, so automation can fetch the shipped runtime boundary without going through the larger `doctor` surface first. MCP now also exposes `package_metadata`, returning the same `package_metadata_view` that the CLI `metadata` command and `codex-bees/metadata` library surface already share, so package identity stays transport-symmetric too.

`tools` and `mcp --tools` expose the explicit tool catalog view for human and automation-side inspection of the shipped MCP surface. They emit `kind: "tool_catalog_view"` with a machine-readable `recommendedReason`, top-level tool counts grouped by tool prefix, and the nested tool inventory so consumers can branch on catalog presence and coarse tool families without reparsing the full list first. `tools:get` exposes the paired single-tool view, returning `kind: "mcp_tool_view"` with `recommendedReason` set to `mcp_tool_loaded` or `mcp_tool_missing` so automation can inspect one shipped tool contract without filtering the full catalog payload.

`coordination_overview` and `worker_guidelines` expose explicit MCP guidance views for the shipped local coordination model. They emit `kind: "coordination_overview_view"` and `kind: "worker_guidelines_view"` with machine-readable `recommendedReason` values and small aggregate counts so MCP consumers can treat runtime guidance as stable product protocol instead of unstructured advisory prose. `guidance:overview` and `guidance:worker` expose those same views directly on the CLI, so automation can fetch the shipped coordination contract without opening the MCP transport first.

`run` now exposes the explicit runtime readiness view. It emits `kind: "runtime_ready_view"` with a machine-readable `recommendedReason`, a next-step count, the shared runtime contract view, and the concrete startup suggestions so automation can treat the default entrypoint as stable protocol instead of free-form startup text. `ready` exposes that same view through an explicit CLI command, so automation can bind to a named readiness surface instead of relying on the default entrypoint behavior. MCP now exposes the same payload through `runtime_ready`, so CLI, library, and MCP consumers can all bind to one shared readiness contract instead of special-casing startup transport.

`status` and the MCP `runtime_status` tool expose the explicit runtime status view. They emit `kind: "runtime_status_view"` with a machine-readable `recommendedReason`, top-level aggregate counts, and the nested runtime summary so automation can distinguish an empty local state from a stateful runtime without inferring that only from the nested task/swarm/memory maps. `capabilities` and `runtime_capabilities` expose the explicit runtime capabilities view. They emit `kind: "runtime_capabilities_view"` with a machine-readable `recommendedReason`, category counts, and the nested capability inventory so automation can distinguish a loaded capability surface from an empty one without reparsing the full array first. `capabilities:get` exposes the paired single-capability view, returning `kind: "runtime_capability_view"` with `recommendedReason` set to `runtime_capability_loaded` or `runtime_capability_missing` so automation can inspect one shipped capability contract without walking the full list. MCP now exposes that same single-capability contract through `runtime_capability`, so CLI, library, and MCP consumers can all inspect one capability without reopening the broader inventory payload.

`runtime:dashboard` / `runtime_dashboard` provide the top-level operator console: leader queue and assignments plus blocked, review-pending, and actively claimed task slices in one payload. They also emit a machine-readable `recommendedReason` so automation can distinguish whether blocked tasks, pending review, active claimed work, leader queue pressure, leader assignments, or an empty workspace currently dominate the dashboard.

`runtime:dispatch` / `runtime_dispatch` provide the owner-grouped dispatch workspace: which owner roles have ready work, the next dispatch candidate for each role, and the task brief already attached for handoff. It also emits a machine-readable `recommendedReason` so automation can distinguish between parallel owner-group pressure, multiple visible assignments, a single ready dispatch candidate, and an empty dispatch workspace without reopening leader startup packs.

`runtime:dispatch-pack` / `runtime_dispatch_pack` provide the dispatch-oriented package: dispatch groups, leader startup plans when multiple owner groups are ready, role pressure, and next-actor handoffs combined into one leader/automation payload with a recommended next surface. It also emits lightweight `metadata` for dispatch/launch/role/handoff presence and compact `counts.surfacedNextEntries`, plus a machine-readable `recommendedReason` so automation can distinguish between parallel launch readiness, parallel dispatch bundling, dispatch pressure, handoff pressure, and role-pressure fallback without parsing the nested dispatch summary. Pass `--workers` on CLI or `workerIds` over MCP to replace placeholder worker ids with real worker-targeted launch commands inside the nested dispatch and launch-plan surfaces.

`runtime:execution-pack` / `runtime_execution_pack` provide the execution-oriented package: focus, dispatch, leader startup plans when parallel startup is ready, role pressure, and queue control combined into one start-work entrypoint with a recommended next surface. It also emits lightweight `metadata` for focus/dispatch/launch/launch-step/role/queue presence and compact `counts.surfacedNextEntries`, plus a machine-readable `recommendedReason` so automation can distinguish between launch readiness, focus-driven urgency, dispatch pressure, role pressure, and simple leader-queue visibility without parsing the nested queue and focus summaries. Pass `--workers` on CLI or `workerIds` over MCP when this entrypoint should emit concrete worker launch commands instead of placeholder worker ids.

`runtime:activity` / `runtime_activity` provide the recent event stream: claims, blocks, review handoffs, approvals, and changes-requested events compressed into one top-level chronological feed. It also emits a machine-readable `recommendedReason` so automation can distinguish whether the newest event signals blocked recovery, review-state change, fresh claim activity, newly created work, or merely generic recent activity before drilling into the stream.

`commands` exposes the direct command catalog view, returning `kind: "command_catalog_view"` with `recommendedReason` set to `command_catalog_loaded` or `command_catalog_empty` so automation can inspect the full shipped CLI surface without scraping the plain-text `--help` output. `command:get` exposes the paired single-command view, returning `kind: "command_catalog_entry_view"` with `recommendedReason` set to `command_catalog_entry_loaded` or `command_catalog_entry_missing` so automation can inspect one shipped CLI contract without walking the full command catalog first. `command:help` exposes the single-command help view, returning `kind: "command_help_view"` with `recommendedReason` set to `command_help_loaded` or `command_help_fallback_loaded` so automation can fetch one shipped help contract without reparsing the full top-level help text.

`init:options` exposes the init option catalog view, returning `kind: "init_command_catalog_view"` with `recommendedReason` set to `init_command_catalog_loaded` or `init_command_catalog_empty` so automation can stay inside the shipped init flag surface without reopening the broader top-level command catalog. `init:option` exposes the single-option init view, returning `kind: "init_command_option_view"` with `recommendedReason` set to `init_command_option_loaded` or `init_command_option_missing` so automation can inspect one shipped init flag contract without walking the broader init option catalog first. `init:help` exposes the paired single-option help view, returning `kind: "init_help_view"` with `recommendedReason` set to `init_help_loaded` or `init_help_fallback_loaded` so automation can fetch one shipped init help contract without reparsing the full init help surface. `mcp:options` exposes the MCP option catalog view, returning `kind: "mcp_command_catalog_view"` with `recommendedReason` set to `mcp_command_catalog_loaded` or `mcp_command_catalog_empty` so automation can stay inside the shipped MCP flag surface without reopening the broader top-level command catalog. `mcp:option` exposes the single-option MCP view, returning `kind: "mcp_command_option_view"` with `recommendedReason` set to `mcp_command_option_loaded` or `mcp_command_option_missing` so automation can inspect one shipped MCP flag contract without walking the broader MCP option catalog first. `mcp:help` exposes the paired single-option MCP help view, returning `kind: "mcp_help_view"` with `recommendedReason` set to `mcp_help_loaded` or `mcp_help_fallback_loaded` so automation can fetch one shipped MCP help contract without reparsing the full MCP help surface.

`runtime:closeout` / `runtime_closeout` provide the final closure workspace: approved done tasks and ready-to-complete swarms gathered into one operator view for explicit archive or finish actions. It also emits a machine-readable `recommendedReason` so automation can distinguish approved task closeout, generic task closeout, swarm closeout, plain closeout visibility, and empty closeout state without reparsing next-item structure.

`runtime:closeout-pack` / `runtime_closeout_pack` provide the closeout-oriented package: closeout readiness plus summary-pack and leader-pack closeout context combined into one finalization-ready payload with a recommended next surface. It also emits lightweight `metadata` for direct/inherited closeout presence and compact `counts.surfacedNextEntries`, plus a machine-readable `recommendedReason` so automation can distinguish between task-ready closeout, swarm-ready closeout, inherited summary/leader closeout context, and empty-closeout fallback without parsing the pack summary. Pass `--workers` on CLI or `workerIds` over MCP to preserve real worker mappings in the nested leader-pack launch-plan surfaces.

`runtime:control-pack` / `runtime_control_pack` provide the automation/control package: summary-pack, workspace-pack, operator-pack, and leader-pack combined into one highest-level control entrypoint with a recommended next surface, while preserving leader launch bundle context inside the nested orchestration surfaces. It also emits lightweight `metadata` for summary/workspace/operator/leader presence and compact `counts.surfacedNextEntries`, plus a machine-readable `recommendedReason` so automation can tell whether summary, workspace, operator, or leader priority produced the top-level control recommendation without inferring from nested pack shape. Pass `--workers` on CLI or `workerIds` over MCP when the nested workspace-pack and leader-pack should carry real worker-targeted launch plans.

`runtime:focus` / `runtime_focus` provide the single next-action workspace: one chosen current priority across blocked work, review pressure, dispatchable lanes, role pressure, and leader queue context. They also emit a machine-readable `recommendedReason` so automation can distinguish whether blocked alerts, review pressure, dispatch pressure, role pressure, leader queue context, or idle state won the global focus decision.

`runtime:handoff-pack` / `runtime_handoff_pack` provide the handoff-oriented package: handoffs, dispatch, review, and recovery combined into one next-actor transfer entrypoint with a recommended next surface. It also emits lightweight `metadata` for handoff/dispatch/review/recovery presence and compact `counts.surfacedNextEntries`, plus a machine-readable `recommendedReason` so automation can distinguish between reviewer handoff pressure, review queue pressure, recovery queue pressure, and dispatch-ready transfer pressure without parsing summary prose.

`runtime:handoffs` / `runtime_handoffs` provide the next-actor transfer workspace: queued pickups, blocked recoveries, and verifier decisions grouped by who should take the next action. It also emits a machine-readable `recommendedReason` so automation can distinguish whether the current handoff head is a verifier decision, blocked recovery, owner claim, or merely grouped transfer visibility before escalating into larger handoff packs.

`runtime:leader-pack` / `runtime_leader_pack` provide the leader-oriented package: leader workspace, leader queue, dispatch pressure, leader startup plans when parallel startup is ready, and closeout readiness combined into one role-shaped payload with a recommended next surface. It also emits lightweight `metadata` for workspace/queue/dispatch/launch/closeout presence and compact `counts.surfacedNextEntries`, plus a machine-readable `recommendedReason` so automation can distinguish between parallel launch readiness, review-driven workspace pressure, dispatch pressure, closeout readiness, and plain leader-queue visibility without parsing the pack summary.

`runtime:operator-pack` / `runtime_operator_pack` provide the operator-oriented package: current focus plus dashboard, alerts, handoffs, and closeout readiness combined into one top-level operator payload with a recommended next surface. It also emits lightweight `metadata` for focus/handoff/closeout/alert presence and compact `counts.surfacedNextEntries`, plus a machine-readable `recommendedReason` so automation can distinguish between blocked/review focus, handoff pressure, closeout readiness, high-alert pressure, and plain dashboard visibility without inferring from the summary prose.

`runtime:owner-pack` / `runtime_owner_pack` provide the owner-oriented package: owner-mode worker session, handoff, closeout, and next pickup candidate combined into one role-scoped payload with a recommended next surface. It also emits lightweight `metadata` for focus/candidate/handoff/closeout presence and compact `counts.surfacedNextEntries`, plus a machine-readable `recommendedReason` so automation can distinguish between active/blocked owner work, awaiting-review transitions, closeout pressure, and pickup-next pressure without parsing the pack summary.

`runtime:assignment-pack` / `runtime_assignment_pack` provide the leader-to-worker assignment package: current leader assignment context plus one worker's live session, next candidate, and assignment-scoped preview combined into one dispatch-ready payload with a recommended next surface. It also emits lightweight `metadata` for assignment/pickup/candidate/focus presence and compact `counts.surfacedNextEntries`, plus a machine-readable `recommendedReason` so automation can distinguish between active/review session focus, explicit leader assignment readiness, generic pickup readiness, and next-candidate fallback without parsing the pack summary. When leader-assigned lane work exists for that role, the package now recommends the explicit `task:assignment-pickup` surface instead of a generic pickup loop.

`runtime:pickup-pack` / `runtime_pickup_pack` provide the start-work pickup package: one worker's current session, next candidate, read-only pickup preview, and role context combined into one immediate start-work payload with a recommended next surface. It also emits lightweight `metadata` for focus/candidate/brief/pickup presence and compact `counts.surfacedNextEntries`, plus a machine-readable `recommendedReason` so automation can distinguish between claimable pickup readiness, current session focus, pickup-command readiness, and fallback-next visibility without parsing the pack summary.

`runtime:queue-pack` / `runtime_queue_pack` provide the queue-oriented package: leader startup launch context, leader queue, dashboard queue context, and current focus combined into one queue-control payload with a recommended next surface. It also emits lightweight `metadata` for queue/focus/launch presence and compact `counts.surfacedNextEntries`, plus a machine-readable `recommendedReason` so automation can distinguish between parallel launch readiness, single-launch readiness, and plain queue review without parsing prose. When parallel startup is ready it prefers `leader:assignment-launch-plan`; when a single ready launch exists it prefers `leader:assignment-dispatch-bundle`; otherwise it falls back to the raw leader queue review surface. Pass `--workers` on CLI or `workerIds` over MCP when the nested launch context should emit concrete worker-targeted startup commands instead of placeholder worker ids.

`runtime:recovery` / `runtime_recovery` provide the recovery workspace: blocked tasks, released tasks, and changes-requested returns grouped by the kind of recovery path they need next. It also emits a machine-readable `recommendedReason` so automation can distinguish blocked recovery priority, changes-requested rework priority, released re-pickup priority, grouped recovery visibility, and empty recovery state without recomputing recovery ordering from nested entries.

`runtime:recovery-pack` / `runtime_recovery_pack` provide the recovery-oriented package: recovery groups, next-actor handoffs, and current focus combined into one restart-friendly payload with a recommended next surface. It also emits lightweight `metadata` for recovery/handoff/focus presence and compact `counts.surfacedNextEntries`, plus a machine-readable `recommendedReason` so automation can distinguish between blocked-recovery pressure, changes-requested returns, released repickup work, handoff fallback pressure, and blocked-focus fallback without parsing the pack summary.

`runtime:review-pack` / `runtime_review_pack` provide the review-oriented package: review groups, role pressure, and optional verifier-scoped control bundle combined into one verifier-control payload with a recommended next surface. It also emits lightweight `metadata` for review/role/verifier presence and compact `counts.surfacedNextEntries`, plus a machine-readable `recommendedReason` so automation can distinguish between verifier-bundle readiness, review queue pressure, and verifier-role pressure without parsing the pack summary.

`runtime:role-pack` / `runtime_role_pack` provide the role-oriented package: role pressure plus optional session, owner, and verifier runtime views combined into one role-scoped workbench with a recommended next surface. It also emits lightweight `metadata` for role/session/owner/verifier presence and compact `counts.surfacedNextEntries`, plus a machine-readable `recommendedReason` so automation can distinguish between session-driven priority, explicit role-action pressure, verifier priority, and owner priority without parsing the pack summary.

`runtime:session-pack` / `runtime_session_pack` provide the per-worker session package: worker, owner, verifier, and role-pressure views combined into one personal runtime entrypoint with a recommended next surface. It also emits lightweight `metadata` for worker/owner/verifier/role presence and compact `counts.surfacedNextEntries`, plus a machine-readable `recommendedReason` so automation can distinguish between worker/owner/verifier priority, review-next pressure, and pickup-next pressure without parsing the pack summary.

`runtime:signal-pack` / `runtime_signal_pack` provide the signal-oriented package: focus, alerts, activity, and role pressure combined into one monitoring entrypoint with a recommended next surface. It also emits lightweight `metadata` for focus/alert/activity/role presence and compact `counts.surfacedNextEntries`, plus a machine-readable `recommendedReason` so automation can distinguish between blocked/review focus, alert pressure, role pressure, and plain recent activity visibility without parsing summary prose.

`runtime:summary-pack` / `runtime_summary_pack` provide the automation-first rollup: current focus plus dashboard, alert, handoff, recovery, closeout, and compact leader launch-context counts in one single payload with a recommended next surface. It also emits lightweight `metadata` for focus/recovery/closeout/launch presence and compact `counts.surfacedNextEntries`, plus a machine-readable `recommendedReason` so automation can tell whether blocked focus, recovery, handoff pressure, closeout readiness, or dashboard queue visibility won the top-level priority decision. It also accepts `--workers` on CLI or `workerIds` over MCP so the surfaced assignment dispatch bundle and launch plan can retain concrete worker mappings when downstream automation needs a lightweight startup handoff without opening the larger leader-oriented packs.

`runtime:triage-pack` / `runtime_triage_pack` provide the triage-oriented package: focus, alerts, review, and recovery combined into one issue-first operator entrypoint with a recommended next surface. It also emits lightweight `metadata` for focus/alert/review/recovery presence and compact `counts.surfacedNextEntries`, plus a machine-readable `recommendedReason` so automation can distinguish between blocked/review focus, recovery pressure, review queue pressure, and high/medium alert pressure without parsing the pack summary.

`runtime:verifier-pack` / `runtime_verifier_pack` provide the verifier-oriented package: review pressure, current verifier decision bundle, closeout-ready approval payload, and next review candidate combined into one role-scoped payload with a recommended next surface. It also emits lightweight `metadata` for review/candidate/decision/closeout presence and compact `counts.surfacedNextEntries`, plus a machine-readable `recommendedReason` so automation can distinguish between decision-bundle readiness, closeout-readiness, review-queue pressure, and next-candidate pressure without parsing the pack summary.

`runtime:workspace-pack` / `runtime_workspace_pack` provide the orchestration workspace package: dashboard, dispatch, leader startup plans when parallel startup is ready, review, and recovery combined into one broad control surface with a recommended next surface. It also emits lightweight `metadata` for dashboard/dispatch/launch/review/recovery presence and compact `counts.surfacedNextEntries`, plus a machine-readable `recommendedReason` so automation can distinguish between parallel launch readiness, review pressure, blocked recovery pressure, dispatch pressure, and plain dashboard visibility without parsing the nested pack summaries. Pass `--workers` on CLI or `workerIds` over MCP to turn nested assignment launch plans into concrete worker-targeted startup steps.

`runtime:worker-pack` / `runtime_worker_pack` provide the worker-oriented package: worker session, handoff, closeout, and next candidate combined into one role-scoped payload with a recommended next surface. It also emits lightweight `metadata` for focus/candidate/handoff/closeout presence and compact `counts.surfacedNextEntries`, plus a machine-readable `recommendedReason` so automation can distinguish between active/blocked work, review-task closeout pressure, handoff pressure, and pickup-next pressure without parsing the pack summary.

`runtime:review` / `runtime_review` provide the verifier-grouped decision workspace: which verifier roles currently own pending review decisions, which task is next, and the task brief already attached for approve/reject handoff. They also emit a machine-readable `recommendedReason` so automation can distinguish between decision-ready review work, visible grouped review pressure, and empty review state without parsing the summary.

`task:pickup-preview` / `task_pickup_preview` provide a read-only next-pickup preview: which task a worker would pick or review next, the execution brief already attached, and the exact next command without mutating queue ownership. They also emit lightweight `metadata` (`hasCandidate`, `hasTask`, `hasBrief`, `taskId`) plus a machine-readable `recommendedReason` so automation can distinguish between claimable, review, continue, blocked, observe-only, and no-candidate preview states before deciding whether to mutate queue ownership.

`runtime:alerts` / `runtime_alerts` provide the compressed top-level alert stream: blocked tasks first, then pending review and swarm-ready-to-complete signals. They also emit a machine-readable `recommendedReason` so automation can distinguish blocked-task priority, pending-review priority, swarm-closeout priority, plain alert visibility, and empty alert state without reparsing the sorted alert list.

`runtime:roles` / `runtime_roles` provide the role-level execution pressure view: which shipped roles currently have verifier load, blocked owner work, claimable owner work, and the next task lane each role should move. It also emits a machine-readable `recommendedReason` so automation can distinguish verifier pressure, blocked owner pressure, claimable owner pressure, active owner pressure, and plain tracked-role visibility without reparsing per-role counts first.

Queued swarm lane tasks automatically persist `swarmId`, lane metadata, and task ownership so CLI/MCP workers can claim them without re-slicing. Swarm-linked task lifecycle changes automatically keep swarm status close to task reality, `swarm:list --detailed` gives leaders a multi-swarm dashboard, `leader:assignments` / `leader_assignments` expose runnable work grouped by owner role, `leader:queue` / `leader_queue` expose the prioritized cross-swarm action list, `leader:workspace` / `leader_workspace` choose the current orchestration focus across those swarms, `swarm:overview` summarizes one swarm and emits a machine-readable `recommendedReason` so automation can distinguish closeout-ready, review-waiting, blocked, dispatch-ready, claimed, and still-unqueued lane states without reopening heavier swarm surfaces, `swarm:brief` provides the next execution handoff, `swarm:bundle` / `swarm_bundle` package the leader-ready orchestration view with lane reports and a summary sentence, `swarm:blockers` / `swarm_blockers` isolate blocked lanes for unblock work, `swarm:closeout` / `swarm_closeout` provide explicit swarm closure packaging, `swarm:dispatch-bundle` / `swarm_dispatch_bundle` package the next runnable dispatch target, `swarm:dispatch` claims the next runnable lane task for a worker, and `swarm:sync` provides an idempotent reconciliation step with a machine-readable `recommendedReason` so automation can distinguish newly synced completion/blocking/activation from unchanged steady-state swarm status.

`swarm:list` / `swarm_list` return the explicit swarm retrieval view. They emit `kind: "swarm_view"` with `recommendedReason: "swarm_list_has_results"` or `recommendedReason: "swarm_list_empty"`, plus a `detailed` flag and `counts.totalSwarms`, so automation can distinguish empty vs non-empty swarm listings, plain vs overview-style list mode, and compact swarm cardinality without inferring only from array shape.

`swarm:queue` / `swarm_queue_tasks` return the explicit queue mutation result: the activated swarm plus the queued lane tasks that were created. They also emit a machine-readable `recommendedReason` so automation can distinguish one-lane queue events, multi-lane queue events, and passive queue visibility without inferring from created-array length alone.

`swarm:dispatch` / `swarm_dispatch` return the explicit dispatch mutation result: the claimed lane, the claimed task snapshot, and the updated swarm state. They also emit a machine-readable `recommendedReason` so automation can distinguish first-time dispatch claims from released-lane reclaims without reparsing prior queue status by hand.

`swarm:get` / `swarm_get` return the explicit swarm detail view. They emit `kind: "swarm_detail"` with `recommendedReason: "swarm_detail_loaded"` plus lightweight `metadata` (`derivedStatus`, `statusAligned`, `readyToComplete`, `dispatchableCount`) so automation can distinguish one-swarm retrieval from list, brief, bundle, blocker, closeout, and overview surfaces while also reading orchestration readiness without reopening the heavier overview payload.

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

`memory:get` / `memory_get` return the explicit memory detail view. They emit `kind: "memory_detail"` with `recommendedReason: "memory_detail_loaded"` plus simple metadata such as `tagCount`, `hasTitle`, and `hasNotes`, so automation can inspect one persisted memory entry without first filtering the broader memory list.

`memory:list` / `memory_list` return the explicit memory retrieval view. They emit `kind: "memory_view"` with `recommendedReason: "memory_list_has_results"` or `recommendedReason: "memory_list_empty"`, plus `counts.totalMemories`, so automation can distinguish non-empty and empty filtered memory listings without inferring only from array length.

`memory:search` / `memory_search` return the explicit memory search view. They emit `kind: "memory_search_view"` with `recommendedReason: "memory_search_has_results"` or `recommendedReason: "memory_search_empty"`, plus `counts.totalResults`, so automation can distinguish successful and empty filtered searches without inferring only from result-array length.

## Why this project exists

Most multi-agent coding setups either hide too much logic in prompts or spread too much behavior across external systems.

Codex Bees keeps the core runtime, roles, and workflow surfaces in the repository, where they can be inspected, reviewed, versioned, and improved like any other part of the product.
