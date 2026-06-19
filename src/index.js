#!/usr/bin/env node

import { stdout, stderr, exit, argv, env, cwd } from "node:process";
import { statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { startMcpServer, toolCatalog } from "./mcp.js";
import { planSwarm, planTask, queueTasksFromPlan } from "./planner.js";
import {
  activateSwarm,
  addTask,
  addTasks,
  blockSwarm,
  blockTask,
  cancelSwarm,
  claimTask,
  completeSwarm,
  completeTask,
  dispatchSwarmLane,
  getSwarm,
  initSwarm,
  listMemories,
  listSwarmOverviews,
  listSwarms,
  listTasks,
  markTaskReadyForReview,
  queueSwarmTasks,
  releaseTask,
  swarmOverview,
  syncSwarmStatus,
  searchMemories,
  stateFilePath,
  storeMemory,
  updateSwarm,
  updateTask
} from "./state.js";

const VERSION = "0.1.0";

function write(text) {
  stdout.write(text);
}

function writeErr(text) {
  stderr.write(text);
}

function printHelp() {
  write(`codex-bees\n\n`);
  write(`Usage:\n`);
  write(`  codex-bees run             Start the local Codex runtime shell contract\n`);
  write(`  codex-bees mcp             Start the local Codex MCP stdio runtime\n`);
  write(`  codex-bees tools           Print the current MCP tool catalog\n`);
  write(`  codex-bees doctor          Print runtime contract diagnostics\n`);
  write(`  codex-bees plan            Generate a bounded read-only execution plan\n`);
  write(`  codex-bees plan:queue      Generate a plan and queue its lanes as local tasks\n`);
  write(`  codex-bees plan:swarm      Generate a bounded swarm contract from a task brief\n`);
  write(`  codex-bees task:list       List local coordination tasks\n`);
  write(`  codex-bees task:add        Add a local coordination task\n`);
  write(`  codex-bees task:claim      Claim a local coordination task\n`);
  write(`  codex-bees task:block      Mark a claimed task as blocked\n`);
  write(`  codex-bees task:review     Mark a task as ready for review\n`);
  write(`  codex-bees task:done       Mark a task as complete\n`);
  write(`  codex-bees task:release    Release a local coordination task\n`);
  write(`  codex-bees task:update     Update a local coordination task\n`);
  write(`  codex-bees swarm:init      Create a bounded local swarm contract\n`);
  write(`  codex-bees swarm:list      List local swarm contracts\n`);
  write(`  codex-bees swarm:get       Show one local swarm contract\n`);
  write(`  codex-bees swarm:update    Update a local swarm contract\n`);
  write(`  codex-bees swarm:start     Mark a planned swarm active\n`);
  write(`  codex-bees swarm:block     Mark an active swarm blocked\n`);
  write(`  codex-bees swarm:done      Mark a swarm complete\n`);
  write(`  codex-bees swarm:cancel    Cancel a swarm\n`);
  write(`  codex-bees swarm:queue     Queue swarm lanes into local tasks\n`);
  write(`  codex-bees memory:store    Store a persistent local memory\n`);
  write(`  codex-bees memory:list     List persistent local memories\n`);
  write(`  codex-bees memory:search   Search persistent local memories\n`);
  write(`  codex-bees --help          Show help\n`);
  write(`  codex-bees --version       Show version\n`);
}

function runtimeContract() {
  return {
    product: "codex-bees",
    mode: "codex-only",
    workingDirectory: cwd(),
    node: process.version,
    transport: {
      cli: "stdio",
      mcp: "stdio-jsonrpc"
    },
    responsibilities: [
      "bootstrap codex-first runtime commands",
      "expose MCP tool catalog for local coordination",
      "provide a stable diagnostics surface for later orchestration layers",
      "persist local work-item state for bounded multi-agent execution",
      "store and recall local memory across execution lanes",
      "track local swarm contracts with bounded lane-to-task handoff"
    ],
    exclusions: [
      "third-party marketplace distribution",
      "multi-host runtime support",
      "hosted backend control plane"
    ]
  };
}

function printDoctor() {
  const selfPath = fileURLToPath(import.meta.url);
  const exists = statSync(selfPath).isFile();
  write(
    JSON.stringify(
      {
        status: "ok",
        executable: exists,
        entry: selfPath,
        stateFile: stateFilePath(),
        contract: runtimeContract()
      },
      null,
      2
    ) + "\n"
  );
}

function readOption(flag) {
  const index = argv.indexOf(flag);
  if (index < 0) {
    return undefined;
  }
  return argv[index + 1];
}

function readOptions(flag) {
  const values = [];
  for (let index = 0; index < argv.length; index += 1) {
    if (argv[index] === flag && argv[index + 1]) {
      values.push(argv[index + 1]);
    }
  }
  return values;
}

function parseListValue(value, separator = ",") {
  if (!value) {
    return undefined;
  }
  return value
    .split(separator)
    .map((item) => item.trim())
    .filter(Boolean);
}

function readListOption(flag, separator = ",") {
  const values = readOptions(flag);
  if (values.length === 0) {
    return undefined;
  }
  return values.flatMap((value) => parseListValue(value, separator) ?? []);
}

function readJsonOption(flag) {
  const value = readOption(flag);
  if (!value) {
    return undefined;
  }

  try {
    return JSON.parse(value);
  } catch (error) {
    writeErr(`Invalid JSON for ${flag}: ${error.message}\n`);
    exit(1);
  }
}

function requireOption(flag) {
  const value = readOption(flag);
  if (!value) {
    writeErr(`Missing required option: ${flag}\n`);
    exit(1);
  }
  return value;
}

function readPositiveIntegerOption(flag) {
  const value = readOption(flag);
  if (value === undefined) {
    return undefined;
  }
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    writeErr(`${flag} must be a positive integer\n`);
    exit(1);
  }
  return parsed;
}

function printTasks() {
  write(JSON.stringify({ tasks: listTasks() }, null, 2) + "\n");
}

function printSwarms() {
  const filters = {
    status: readOption("--status"),
    topology: readOption("--topology"),
    owner: readOption("--owner")
  };
  const detailed = argv.includes("--detailed");
  write(
    JSON.stringify(
      {
        swarms: detailed ? listSwarmOverviews(filters) : listSwarms(filters)
      },
      null,
      2
    ) + "\n"
  );
}

function handleTaskAdd() {
  const title = requireOption("--title");
  const status = readOption("--status");
  const owner = readOption("--owner");
  const verifier = readOption("--verifier");
  const objective = readOption("--objective");
  const lane = readOption("--lane");
  const swarmId = readOption("--swarm-id");
  const scope = readListOption("--scope");
  const acceptance = readListOption("--acceptance", "|");
  const verification = readListOption("--verification", "|");
  const notes = readOption("--notes");
  const task = addTask({
    title,
    status,
    owner,
    verifier,
    objective,
    lane,
    swarmId,
    scope,
    acceptance,
    verification,
    notes
  });
  write(JSON.stringify({ created: task }, null, 2) + "\n");
}

function handleTaskUpdate() {
  const id = requireOption("--id");
  const task = updateTask({
    id,
    title: readOption("--title"),
    status: readOption("--status"),
    owner: readOption("--owner"),
    verifier: readOption("--verifier"),
    objective: readOption("--objective"),
    lane: readOption("--lane"),
    swarmId: readOption("--swarm-id"),
    scope: readListOption("--scope"),
    acceptance: readListOption("--acceptance", "|"),
    verification: readListOption("--verification", "|"),
    notes: readOption("--notes")
  });

  if (!task) {
    writeErr(`Unknown task id: ${id}\n`);
    exit(1);
  }
  if (task.error) {
    writeErr(`${task.error}\n`);
    exit(1);
  }

  write(JSON.stringify({ updated: task }, null, 2) + "\n");
}

function handleTaskClaim() {
  const id = requireOption("--id");
  const claimedBy = requireOption("--by");
  const task = claimTask({ id, claimedBy });
  if (!task) {
    writeErr(`Unknown task id: ${id}\n`);
    exit(1);
  }
  if (task.error) {
    writeErr(`${task.error}\n`);
    exit(1);
  }
  write(JSON.stringify({ claimed: task }, null, 2) + "\n");
}

function handleTaskRelease() {
  const id = requireOption("--id");
  const claimedBy = readOption("--by");
  const task = releaseTask({ id, claimedBy });
  if (!task) {
    writeErr(`Unknown task id: ${id}\n`);
    exit(1);
  }
  if (task.error) {
    writeErr(`${task.error}\n`);
    exit(1);
  }
  write(JSON.stringify({ released: task }, null, 2) + "\n");
}

function handleTaskBlock() {
  const id = requireOption("--id");
  const claimedBy = readOption("--by");
  const notes = readOption("--notes");
  const task = blockTask({ id, claimedBy, notes });
  if (!task) {
    writeErr(`Unknown task id: ${id}\n`);
    exit(1);
  }
  if (task.error) {
    writeErr(`${task.error}\n`);
    exit(1);
  }
  write(JSON.stringify({ blocked: task }, null, 2) + "\n");
}

function handleTaskReview() {
  const id = requireOption("--id");
  const claimedBy = readOption("--by");
  const notes = readOption("--notes");
  const task = markTaskReadyForReview({ id, claimedBy, notes });
  if (!task) {
    writeErr(`Unknown task id: ${id}\n`);
    exit(1);
  }
  if (task.error) {
    writeErr(`${task.error}\n`);
    exit(1);
  }
  write(JSON.stringify({ readyForReview: task }, null, 2) + "\n");
}

function handleTaskDone() {
  const id = requireOption("--id");
  const claimedBy = readOption("--by");
  const notes = readOption("--notes");
  const task = completeTask({ id, claimedBy, notes });
  if (!task) {
    writeErr(`Unknown task id: ${id}\n`);
    exit(1);
  }
  if (task.error) {
    writeErr(`${task.error}\n`);
    exit(1);
  }
  write(JSON.stringify({ completed: task }, null, 2) + "\n");
}

function handlePlan() {
  const task = requireOption("--task");
  write(JSON.stringify(planTask(task), null, 2) + "\n");
}

function handlePlanQueue() {
  const task = requireOption("--task");
  write(JSON.stringify(queueTasksFromPlan(task, addTasks), null, 2) + "\n");
}

function handlePlanSwarm() {
  const task = requireOption("--task");
  write(JSON.stringify(planSwarm(task), null, 2) + "\n");
}

function handlePlanSwarmQueue() {
  const task = requireOption("--task");
  const planned = planSwarm(task);
  const created = initSwarm(planned.swarm);
  const queued = queueSwarmTasks({ id: created.id });
  if (!queued) {
    writeErr(`Unable to queue planned swarm: ${created.id}\n`);
    exit(1);
  }
  if (queued.error) {
    writeErr(`${queued.error}\n`);
    exit(1);
  }
  write(
    JSON.stringify(
      {
        kind: "queued_plan_swarm",
        objective: task,
        evidence: planned.evidence,
        swarm: queued.swarm,
        created: queued.created
      },
      null,
      2
    ) + "\n"
  );
}

function handleSwarmInit() {
  const objective = requireOption("--objective");
  const swarm = initSwarm({
    objective,
    topology: readOption("--topology"),
    maxWorkers: readPositiveIntegerOption("--max-workers"),
    owner: readOption("--owner"),
    laneSource: readOption("--lane-source"),
    notes: readOption("--notes"),
    lanes: readJsonOption("--lanes")
  });
  write(JSON.stringify({ created: swarm }, null, 2) + "\n");
}

function handleSwarmGet() {
  const id = requireOption("--id");
  const swarm = getSwarm(id);
  if (!swarm) {
    writeErr(`Unknown swarm id: ${id}\n`);
    exit(1);
  }
  write(JSON.stringify({ swarm }, null, 2) + "\n");
}

function handleSwarmUpdate() {
  const id = requireOption("--id");
  const swarm = updateSwarm({
    id,
    objective: readOption("--objective"),
    topology: readOption("--topology"),
    maxWorkers: readPositiveIntegerOption("--max-workers"),
    owner: readOption("--owner"),
    laneSource: readOption("--lane-source"),
    notes: readOption("--notes"),
    lanes: readJsonOption("--lanes")
  });

  if (!swarm) {
    writeErr(`Unknown swarm id: ${id}\n`);
    exit(1);
  }
  if (swarm.error) {
    writeErr(`${swarm.error}\n`);
    exit(1);
  }

  write(JSON.stringify({ updated: swarm }, null, 2) + "\n");
}

function handleSwarmOverview() {
  const id = requireOption("--id");
  const overview = swarmOverview(id);
  if (!overview) {
    writeErr(`Unknown swarm id: ${id}\n`);
    exit(1);
  }
  write(JSON.stringify({ overview }, null, 2) + "\n");
}

function handleSwarmDispatch() {
  const id = requireOption("--id");
  const claimedBy = requireOption("--by");
  const result = dispatchSwarmLane({
    id,
    claimedBy,
    owner: readOption("--owner")
  });

  if (!result) {
    writeErr(`Unknown swarm id: ${id}\n`);
    exit(1);
  }
  if (result.error) {
    writeErr(`${result.error}\n`);
    exit(1);
  }

  write(JSON.stringify({ dispatched: result }, null, 2) + "\n");
}

function handleSwarmSync() {
  const id = requireOption("--id");
  const result = syncSwarmStatus(id);
  if (!result) {
    writeErr(`Unknown swarm id: ${id}\n`);
    exit(1);
  }
  write(JSON.stringify({ synced: result }, null, 2) + "\n");
}

function handleSwarmStart() {
  const id = requireOption("--id");
  const swarm = activateSwarm({
    id,
    owner: readOption("--owner"),
    notes: readOption("--notes")
  });

  if (!swarm) {
    writeErr(`Unknown swarm id: ${id}\n`);
    exit(1);
  }
  if (swarm.error) {
    writeErr(`${swarm.error}\n`);
    exit(1);
  }

  write(JSON.stringify({ activated: swarm }, null, 2) + "\n");
}

function handleSwarmBlock() {
  const id = requireOption("--id");
  const swarm = blockSwarm({
    id,
    owner: readOption("--owner"),
    notes: readOption("--notes")
  });

  if (!swarm) {
    writeErr(`Unknown swarm id: ${id}\n`);
    exit(1);
  }
  if (swarm.error) {
    writeErr(`${swarm.error}\n`);
    exit(1);
  }

  write(JSON.stringify({ blocked: swarm }, null, 2) + "\n");
}

function handleSwarmDone() {
  const id = requireOption("--id");
  const swarm = completeSwarm({
    id,
    owner: readOption("--owner"),
    notes: readOption("--notes")
  });

  if (!swarm) {
    writeErr(`Unknown swarm id: ${id}\n`);
    exit(1);
  }
  if (swarm.error) {
    writeErr(`${swarm.error}\n`);
    exit(1);
  }

  write(JSON.stringify({ completed: swarm }, null, 2) + "\n");
}

function handleSwarmCancel() {
  const id = requireOption("--id");
  const swarm = cancelSwarm({
    id,
    owner: readOption("--owner"),
    notes: readOption("--notes")
  });

  if (!swarm) {
    writeErr(`Unknown swarm id: ${id}\n`);
    exit(1);
  }
  if (swarm.error) {
    writeErr(`${swarm.error}\n`);
    exit(1);
  }

  write(JSON.stringify({ cancelled: swarm }, null, 2) + "\n");
}

function handleSwarmQueue() {
  const id = requireOption("--id");
  const result = queueSwarmTasks({ id });
  if (!result) {
    writeErr(`Unknown swarm id: ${id}\n`);
    exit(1);
  }
  if (result.error) {
    writeErr(`${result.error}\n`);
    exit(1);
  }

  write(JSON.stringify(result, null, 2) + "\n");
}

function handleMemoryStore() {
  const content = requireOption("--content");
  const memory = storeMemory({
    namespace: readOption("--namespace"),
    kind: readOption("--kind"),
    title: readOption("--title"),
    agent: readOption("--agent"),
    tags: readListOption("--tags"),
    notes: readOption("--notes"),
    content
  });
  write(JSON.stringify({ stored: memory }, null, 2) + "\n");
}

function handleMemoryList() {
  write(
    JSON.stringify(
      {
        memories: listMemories({
          namespace: readOption("--namespace"),
          kind: readOption("--kind"),
          agent: readOption("--agent"),
          tags: readListOption("--tags")
        })
      },
      null,
      2
    ) + "\n"
  );
}

function handleMemorySearch() {
  const query = requireOption("--query");
  const limit = Number(readOption("--limit") ?? "10");
  const results = searchMemories(query, {
    namespace: readOption("--namespace"),
    kind: readOption("--kind"),
    agent: readOption("--agent"),
    tags: readListOption("--tags")
  }).slice(0, Number.isFinite(limit) && limit > 0 ? limit : 10);

  write(JSON.stringify({ query, results }, null, 2) + "\n");
}

async function runCommand(command) {
  switch (command) {
    case undefined:
    case "run":
      write(
        JSON.stringify(
          {
            status: "ready",
            contract: runtimeContract(),
            next: [
              "use `codex-bees doctor` to inspect runtime boundaries",
              "use `codex-bees tools` to inspect current MCP tool catalog",
              "use `codex-bees task:add --title ...` to create local work items",
              "use `codex-bees swarm:init --objective ...` to stage a bounded local swarm",
              "use `codex-bees mcp` to start the stdio MCP surface"
            ]
          },
          null,
          2
        ) + "\n"
      );
      return;
    case "mcp":
      await startMcpServer();
      return;
    case "tools":
      write(JSON.stringify({ tools: toolCatalog }, null, 2) + "\n");
      return;
    case "doctor":
      printDoctor();
      return;
    case "plan":
      handlePlan();
      return;
    case "plan:queue":
      handlePlanQueue();
      return;
    case "plan:swarm":
      handlePlanSwarm();
      return;
    case "plan:swarm:queue":
      handlePlanSwarmQueue();
      return;
    case "task:list":
      printTasks();
      return;
    case "task:add":
      handleTaskAdd();
      return;
    case "task:claim":
      handleTaskClaim();
      return;
    case "task:block":
      handleTaskBlock();
      return;
    case "task:review":
      handleTaskReview();
      return;
    case "task:done":
      handleTaskDone();
      return;
    case "task:release":
      handleTaskRelease();
      return;
    case "task:update":
      handleTaskUpdate();
      return;
    case "swarm:init":
      handleSwarmInit();
      return;
    case "swarm:list":
      printSwarms();
      return;
    case "swarm:get":
      handleSwarmGet();
      return;
    case "swarm:update":
      handleSwarmUpdate();
      return;
    case "swarm:overview":
      handleSwarmOverview();
      return;
    case "swarm:dispatch":
      handleSwarmDispatch();
      return;
    case "swarm:sync":
      handleSwarmSync();
      return;
    case "swarm:start":
      handleSwarmStart();
      return;
    case "swarm:block":
      handleSwarmBlock();
      return;
    case "swarm:done":
      handleSwarmDone();
      return;
    case "swarm:cancel":
      handleSwarmCancel();
      return;
    case "swarm:queue":
      handleSwarmQueue();
      return;
    case "memory:store":
      handleMemoryStore();
      return;
    case "memory:list":
      handleMemoryList();
      return;
    case "memory:search":
      handleMemorySearch();
      return;
    case "--help":
    case "help":
      printHelp();
      return;
    case "--version":
    case "version":
      write(`${VERSION}\n`);
      return;
    default:
      writeErr(`Unknown command: ${command}\n\n`);
      printHelp();
      exit(1);
  }
}

if (env.CODEX_BEES_CLI_TRACE === "1") {
  writeErr(`[codex-bees] argv=${JSON.stringify(argv.slice(2))}\n`);
}

runCommand(argv[2]).catch((error) => {
  writeErr(`${error.stack || error.message}\n`);
  exit(1);
});
