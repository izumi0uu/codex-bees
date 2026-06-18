#!/usr/bin/env node

import { stdout, stderr, exit, argv, env, cwd } from "node:process";
import { statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { startMcpServer, toolCatalog } from "./mcp.js";
import { planTask, queueTasksFromPlan } from "./planner.js";
import {
  addTask,
  addTasks,
  blockTask,
  claimTask,
  completeTask,
  listTasks,
  markTaskReadyForReview,
  releaseTask,
  stateFilePath,
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
  write(`  codex-bees run           Start the local Codex runtime shell contract\n`);
  write(`  codex-bees mcp           Start the local Codex MCP stdio runtime\n`);
  write(`  codex-bees tools         Print the current MCP tool catalog\n`);
  write(`  codex-bees doctor        Print runtime contract diagnostics\n`);
  write(`  codex-bees plan          Generate a bounded read-only execution plan\n`);
  write(`  codex-bees plan:queue    Generate a plan and queue its lanes as local tasks\n`);
  write(`  codex-bees task:list     List local coordination tasks\n`);
  write(`  codex-bees task:add      Add a local coordination task\n`);
  write(`  codex-bees task:claim    Claim a local coordination task\n`);
  write(`  codex-bees task:block    Mark a claimed task as blocked\n`);
  write(`  codex-bees task:review   Mark a task as ready for review\n`);
  write(`  codex-bees task:done     Mark a task as complete\n`);
  write(`  codex-bees task:release  Release a local coordination task\n`);
  write(`  codex-bees task:update   Update a local coordination task\n`);
  write(`  codex-bees --help        Show help\n`);
  write(`  codex-bees --version     Show version\n`);
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
      "persist local work-item state for bounded multi-agent execution"
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

function requireOption(flag) {
  const value = readOption(flag);
  if (!value) {
    writeErr(`Missing required option: ${flag}\n`);
    exit(1);
  }
  return value;
}

function printTasks() {
  write(JSON.stringify({ tasks: listTasks() }, null, 2) + "\n");
}

function handleTaskAdd() {
  const title = requireOption("--title");
  const status = readOption("--status");
  const owner = readOption("--owner");
  const verifier = readOption("--verifier");
  const objective = readOption("--objective");
  const lane = readOption("--lane");
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

await runCommand(argv[2]);
