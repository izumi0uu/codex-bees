#!/usr/bin/env node

import { stdout, stderr, exit, argv, env, cwd } from "node:process";
import { statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { startMcpServer, toolCatalog } from "./mcp.js";
import { getRuntimeCatalog } from "./catalog.js";
import { planSwarm, planTask, queueTasksFromPlan } from "./planner.js";
import { getCapabilityCatalog, getRuntimeStatus } from "./runtime-status.js";
import {
  activateSwarm,
  addTask,
  addTasks,
  annotateTask,
  approveTask,
  blockSwarm,
  blockTask,
  cancelSwarm,
  claimTask,
  completeSwarm,
  completeTask,
  dispatchSwarmLane,
  getTask,
  getSwarm,
  initSwarm,
  leaderAssignments,
  leaderQueue,
  leaderWorkspace,
  listMemories,
  listSwarmOverviews,
  listSwarms,
  listTasks,
  markTaskReadyForReview,
  queueSwarmTasks,
  rejectTask,
  releaseTask,
  runtimeActivity,
  runtimeAlerts,
  runtimeCloseoutPack,
  runtimeCloseout,
  runtimeControlPack,
  runtimeDashboard,
  runtimeDispatchPack,
  runtimeDispatch,
  runtimeFocus,
  runtimeHandoffPack,
  runtimeHandoffs,
  runtimeLeaderPack,
  runtimeOperatorPack,
  runtimeOwnerPack,
  runtimeQueuePack,
  runtimeRecoveryPack,
  runtimeRecovery,
  runtimeReviewPack,
  runtimeSignalPack,
  runtimeSummaryPack,
  runtimeVerifierPack,
  runtimeWorkspacePack,
  runtimeWorkerPack,
  runtimeReview,
  runtimeRoles,
  swarmOverview,
  syncSwarmStatus,
  searchMemories,
  stateFilePath,
  storeMemory,
  swarmBlockers,
  swarmBundle,
  swarmCloseout,
  swarmDispatchBundle,
  swarmBrief,
  taskInbox,
  taskHistory,
  taskPickup,
  taskReport,
  taskNext,
  verifierBundle,
  workerCloseout,
  workerHandoff,
  workerSession,
  updateSwarm,
  updateTask,
  taskBrief,
  validateSwarm,
  validateTask
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
  write(`  codex-bees catalog         Print the shipped local agent and skill catalog\n`);
  write(`  codex-bees doctor          Print runtime contract diagnostics\n`);
  write(`  codex-bees status          Print runtime state and surface summary\n`);
  write(`  codex-bees capabilities    Print the shipped runtime capability inventory\n`);
  write(`  codex-bees runtime:alerts  Build the top-level orchestration alert stream\n`);
  write(`  codex-bees runtime:activity Build the recent runtime activity stream\n`);
  write(`  codex-bees runtime:dashboard Build the top-level orchestration dashboard\n`);
  write(`  codex-bees runtime:closeout Build the final closeout workspace\n`);
  write(`  codex-bees runtime:closeout-pack Build the closeout-oriented runtime package\n`);
  write(`  codex-bees runtime:control-pack Build the automation/control runtime package\n`);
  write(`  codex-bees runtime:dispatch Build the owner-grouped dispatch workspace\n`);
  write(`  codex-bees runtime:dispatch-pack Build the dispatch-oriented runtime package\n`);
  write(`  codex-bees runtime:focus   Build the single next-action runtime focus\n`);
  write(`  codex-bees runtime:handoff-pack Build the handoff-oriented runtime package\n`);
  write(`  codex-bees runtime:handoffs Build the next-actor handoff workspace\n`);
  write(`  codex-bees runtime:leader-pack Build the leader-oriented runtime package\n`);
  write(`  codex-bees runtime:operator-pack Build the operator-oriented runtime package\n`);
  write(`  codex-bees runtime:owner-pack Build the owner-oriented runtime package\n`);
  write(`  codex-bees runtime:queue-pack Build the queue-oriented runtime package\n`);
  write(`  codex-bees runtime:recovery-pack Build the recovery-oriented runtime package\n`);
  write(`  codex-bees runtime:recovery Build the recovery-oriented task workspace\n`);
  write(`  codex-bees runtime:review-pack Build the review-oriented runtime package\n`);
  write(`  codex-bees runtime:signal-pack Build the signal-oriented runtime package\n`);
  write(`  codex-bees runtime:summary-pack Build the automation-first runtime summary package\n`);
  write(`  codex-bees runtime:verifier-pack Build the verifier-oriented runtime package\n`);
  write(`  codex-bees runtime:workspace-pack Build the orchestration workspace package\n`);
  write(`  codex-bees runtime:worker-pack Build the worker-oriented runtime package\n`);
  write(`  codex-bees runtime:review  Build the verifier-grouped review workspace\n`);
  write(`  codex-bees runtime:roles   Build the role-level orchestration queue view\n`);
  write(`  codex-bees plan            Generate a bounded read-only execution plan\n`);
  write(`  codex-bees plan:queue      Generate a plan and queue its lanes as local tasks\n`);
  write(`  codex-bees plan:swarm      Generate a bounded swarm contract from a task brief\n`);
  write(`  codex-bees task:list       List local coordination tasks\n`);
  write(`  codex-bees task:add        Add a local coordination task\n`);
  write(`  codex-bees task:get        Show one local coordination task\n`);
  write(`  codex-bees task:history    Show structured handoff history for one task\n`);
  write(`  codex-bees task:annotate   Add a persistent handoff note to one task\n`);
  write(`  codex-bees task:report     Build a delivery-ready report for one task\n`);
  write(`  codex-bees task:brief      Render an execution brief for one task\n`);
  write(`  codex-bees task:inbox      List role-relevant tasks in execution priority order\n`);
  write(`  codex-bees task:next       Resolve the next task a role should pick up\n`);
  write(`  codex-bees task:pickup     Claim or resume the next task for one worker\n`);
  write(`  codex-bees worker:session  Show the current execution workspace for one worker\n`);
  write(`  codex-bees worker:handoff  Build a return-ready handoff package for one worker\n`);
  write(`  codex-bees worker:closeout Build a closure-oriented bundle for one worker\n`);
  write(`  codex-bees verifier:bundle Build a decision-ready bundle for one verifier\n`);
  write(`  codex-bees leader:assignments Build owner-grouped dispatch assignments across swarms\n`);
  write(`  codex-bees leader:queue    Build a prioritized leader decision queue across swarms\n`);
  write(`  codex-bees leader:workspace Build a leader-ready orchestration workspace across swarms\n`);
  write(`  codex-bees task:claim      Claim a local coordination task\n`);
  write(`  codex-bees task:block      Mark a claimed task as blocked\n`);
  write(`  codex-bees task:review     Mark a task as ready for review\n`);
  write(`  codex-bees task:approve    Approve a ready-for-review task as its verifier\n`);
  write(`  codex-bees task:reject     Return a ready-for-review task for more work\n`);
  write(`  codex-bees task:done       Approve a ready-for-review task as its verifier\n`);
  write(`  codex-bees task:release    Release a local coordination task\n`);
  write(`  codex-bees task:update     Update a local coordination task\n`);
  write(`  codex-bees task:check      Validate one local coordination task for bounded execution\n`);
  write(`  codex-bees swarm:init      Create a bounded local swarm contract\n`);
  write(`  codex-bees swarm:list      List local swarm contracts\n`);
  write(`  codex-bees swarm:get       Show one local swarm contract\n`);
  write(`  codex-bees swarm:brief     Render an execution brief for one swarm\n`);
  write(`  codex-bees swarm:bundle    Build a leader-ready orchestration bundle for one swarm\n`);
  write(`  codex-bees swarm:blockers Build a blocker-oriented bundle for one swarm\n`);
  write(`  codex-bees swarm:closeout  Build a closure-oriented bundle for one swarm\n`);
  write(`  codex-bees swarm:dispatch-bundle Build a dispatch-oriented bundle for one swarm\n`);
  write(`  codex-bees swarm:update    Update a local swarm contract\n`);
  write(`  codex-bees swarm:check     Validate one swarm contract for lane readiness\n`);
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
      "track local swarm contracts with bounded lane-to-task handoff",
      "validate owner and verifier roles against shipped local agent prompts"
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
        catalog: getRuntimeCatalog(),
        contract: runtimeContract()
      },
      null,
      2
    ) + "\n"
  );
}

function printCatalog() {
  write(JSON.stringify({ catalog: getRuntimeCatalog() }, null, 2) + "\n");
}

function printStatus() {
  write(JSON.stringify({ status: getRuntimeStatus({ version: VERSION, toolCount: toolCatalog.length }) }, null, 2) + "\n");
}

function printCapabilities() {
  write(JSON.stringify({ capabilities: getCapabilityCatalog() }, null, 2) + "\n");
}

function printRuntimeActivity() {
  write(JSON.stringify({ activity: runtimeActivity({ limit: readPositiveIntegerOption("--limit") }) }, null, 2) + "\n");
}

function printRuntimeCloseout() {
  write(JSON.stringify({ closeout: runtimeCloseout() }, null, 2) + "\n");
}

function printRuntimeCloseoutPack() {
  write(JSON.stringify({ closeoutPack: runtimeCloseoutPack() }, null, 2) + "\n");
}

function printRuntimeControlPack() {
  write(JSON.stringify({ controlPack: runtimeControlPack() }, null, 2) + "\n");
}

function printRuntimeSignalPack() {
  write(JSON.stringify({ signalPack: runtimeSignalPack({ limit: readPositiveIntegerOption("--limit") }) }, null, 2) + "\n");
}

function printRuntimeHandoffPack() {
  write(JSON.stringify({ handoffPack: runtimeHandoffPack() }, null, 2) + "\n");
}

function printRuntimeHandoffs() {
  write(JSON.stringify({ handoffs: runtimeHandoffs() }, null, 2) + "\n");
}

function printRuntimeRecovery() {
  write(JSON.stringify({ recovery: runtimeRecovery() }, null, 2) + "\n");
}

function printRuntimeSummaryPack() {
  write(JSON.stringify({ summaryPack: runtimeSummaryPack() }, null, 2) + "\n");
}

function printRuntimeLeaderPack() {
  write(JSON.stringify({ leaderPack: runtimeLeaderPack() }, null, 2) + "\n");
}

function printRuntimeOperatorPack() {
  write(JSON.stringify({ operatorPack: runtimeOperatorPack() }, null, 2) + "\n");
}

function printRuntimeRecoveryPack() {
  write(JSON.stringify({ recoveryPack: runtimeRecoveryPack() }, null, 2) + "\n");
}

function printRuntimeReviewPack() {
  write(JSON.stringify({
    reviewPack: runtimeReviewPack({
      role: readOption("--role"),
      workerId: readOption("--worker")
    })
  }, null, 2) + "\n");
}

function printRuntimeQueuePack() {
  write(JSON.stringify({ queuePack: runtimeQueuePack() }, null, 2) + "\n");
}

function printRuntimeWorkspacePack() {
  write(JSON.stringify({ workspacePack: runtimeWorkspacePack() }, null, 2) + "\n");
}

function printRuntimeOwnerPack() {
  const role = readOption("--role");
  const workerId = readOption("--worker");
  if (!role || !workerId) {
    writeErr("runtime:owner-pack requires --role and --worker\n");
    exit(1);
  }
  write(JSON.stringify({
    ownerPack: runtimeOwnerPack({
      role,
      workerId
    })
  }, null, 2) + "\n");
}

function printRuntimeVerifierPack() {
  const role = readOption("--role");
  const workerId = readOption("--worker");
  if (!role || !workerId) {
    writeErr("runtime:verifier-pack requires --role and --worker\n");
    exit(1);
  }
  write(JSON.stringify({
    verifierPack: runtimeVerifierPack({
      role,
      workerId
    })
  }, null, 2) + "\n");
}

function printRuntimeWorkerPack() {
  const role = readOption("--role");
  const workerId = readOption("--worker");
  if (!role || !workerId) {
    writeErr("runtime:worker-pack requires --role and --worker\n");
    exit(1);
  }
  write(JSON.stringify({
    workerPack: runtimeWorkerPack({
      role,
      workerId,
      mode: readOption("--mode")
    })
  }, null, 2) + "\n");
}

function printRuntimeDashboard() {
  write(JSON.stringify({ dashboard: runtimeDashboard() }, null, 2) + "\n");
}

function printRuntimeDispatch() {
  write(JSON.stringify({ dispatch: runtimeDispatch() }, null, 2) + "\n");
}

function printRuntimeDispatchPack() {
  write(JSON.stringify({ dispatchPack: runtimeDispatchPack() }, null, 2) + "\n");
}

function printRuntimeFocus() {
  write(JSON.stringify({ focus: runtimeFocus() }, null, 2) + "\n");
}

function printRuntimeReview() {
  write(JSON.stringify({ review: runtimeReview() }, null, 2) + "\n");
}

function printRuntimeAlerts() {
  write(JSON.stringify({ alerts: runtimeAlerts() }, null, 2) + "\n");
}

function printRuntimeRoles() {
  write(JSON.stringify({ roles: runtimeRoles({ limit: readPositiveIntegerOption("--limit") }) }, null, 2) + "\n");
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

function handleTaskGet() {
  const id = requireOption("--id");
  const task = getTask(id);
  if (!task) {
    writeErr(`Unknown task id: ${id}\n`);
    exit(1);
  }
  write(JSON.stringify({ task }, null, 2) + "\n");
}

function handleTaskHistory() {
  const id = requireOption("--id");
  const history = taskHistory(id);
  if (!history) {
    writeErr(`Unknown task id: ${id}\n`);
    exit(1);
  }
  write(JSON.stringify({ history }, null, 2) + "\n");
}

function handleTaskAnnotate() {
  const id = requireOption("--id");
  const annotated = annotateTask({
    id,
    actor: readOption("--by"),
    kind: readOption("--kind"),
    content: requireOption("--content")
  });
  if (!annotated) {
    writeErr(`Unknown task id: ${id}\n`);
    exit(1);
  }
  if (annotated.error) {
    writeErr(`${annotated.error}\n`);
    exit(1);
  }
  write(JSON.stringify({ annotated }, null, 2) + "\n");
}

function handleTaskReport() {
  const id = requireOption("--id");
  const report = taskReport(id);
  if (!report) {
    writeErr(`Unknown task id: ${id}\n`);
    exit(1);
  }
  write(JSON.stringify({ report }, null, 2) + "\n");
}

function handleTaskBrief() {
  const id = requireOption("--id");
  const brief = taskBrief(id);
  if (!brief) {
    writeErr(`Unknown task id: ${id}\n`);
    exit(1);
  }
  write(JSON.stringify({ brief }, null, 2) + "\n");
}

function handleTaskInbox() {
  const role = requireOption("--role");
  const inbox = taskInbox({
    role,
    workerId: readOption("--worker"),
    limit: readPositiveIntegerOption("--limit")
  });
  write(JSON.stringify({ inbox }, null, 2) + "\n");
}

function handleTaskNext() {
  const role = requireOption("--role");
  const next = taskNext({
    role,
    workerId: readOption("--worker"),
    mode: readOption("--mode")
  });
  write(JSON.stringify({ next }, null, 2) + "\n");
}

function handleTaskPickup() {
  const role = requireOption("--role");
  const workerId = requireOption("--worker");
  const pickup = taskPickup({
    role,
    workerId,
    mode: readOption("--mode")
  });
  write(JSON.stringify({ pickup }, null, 2) + "\n");
}

function handleWorkerSession() {
  const role = requireOption("--role");
  const workerId = requireOption("--worker");
  const session = workerSession({
    role,
    workerId,
    mode: readOption("--mode"),
    limit: readPositiveIntegerOption("--limit")
  });
  write(JSON.stringify({ session }, null, 2) + "\n");
}

function handleWorkerHandoff() {
  const role = requireOption("--role");
  const workerId = requireOption("--worker");
  const handoff = workerHandoff({
    role,
    workerId,
    mode: readOption("--mode"),
    limit: readPositiveIntegerOption("--limit")
  });
  write(JSON.stringify({ handoff }, null, 2) + "\n");
}

function handleWorkerCloseout() {
  const role = requireOption("--role");
  const workerId = requireOption("--worker");
  const closeout = workerCloseout({
    role,
    workerId,
    mode: readOption("--mode"),
    limit: readPositiveIntegerOption("--limit")
  });
  write(JSON.stringify({ closeout }, null, 2) + "\n");
}

function handleVerifierBundle() {
  const role = requireOption("--role");
  const workerId = requireOption("--worker");
  const bundle = verifierBundle({
    role,
    workerId,
    limit: readPositiveIntegerOption("--limit")
  });
  write(JSON.stringify({ bundle }, null, 2) + "\n");
}

function handleLeaderWorkspace() {
  const workspace = leaderWorkspace({
    status: readOption("--status"),
    topology: readOption("--topology"),
    owner: readOption("--owner")
  });
  write(JSON.stringify({ workspace }, null, 2) + "\n");
}

function handleLeaderQueue() {
  const queue = leaderQueue({
    status: readOption("--status"),
    topology: readOption("--topology"),
    owner: readOption("--owner")
  });
  write(JSON.stringify({ queue }, null, 2) + "\n");
}

function handleLeaderAssignments() {
  const assignments = leaderAssignments({
    status: readOption("--status"),
    topology: readOption("--topology"),
    owner: readOption("--owner")
  });
  write(JSON.stringify({ assignments }, null, 2) + "\n");
}

function handleTaskCheck() {
  const id = requireOption("--id");
  const validation = validateTask(id);
  if (!validation) {
    writeErr(`Unknown task id: ${id}\n`);
    exit(1);
  }
  write(JSON.stringify({ validation }, null, 2) + "\n");
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
  const reviewedBy = requireOption("--by");
  const notes = readOption("--notes");
  const reviewEvidence = readListOption("--evidence", "|");
  const task = completeTask({ id, reviewedBy, notes, reviewEvidence });
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

function handleTaskApprove() {
  const id = requireOption("--id");
  const reviewedBy = requireOption("--by");
  const notes = readOption("--notes");
  const reviewEvidence = readListOption("--evidence", "|");
  const task = approveTask({ id, reviewedBy, notes, reviewEvidence });
  if (!task) {
    writeErr(`Unknown task id: ${id}\n`);
    exit(1);
  }
  if (task.error) {
    writeErr(`${task.error}\n`);
    exit(1);
  }
  write(JSON.stringify({ approved: task }, null, 2) + "\n");
}

function handleTaskReject() {
  const id = requireOption("--id");
  const reviewedBy = requireOption("--by");
  const notes = readOption("--notes");
  const nextQueueStatus = readOption("--status");
  const reviewEvidence = readListOption("--evidence", "|");
  const task = rejectTask({ id, reviewedBy, nextQueueStatus, notes, reviewEvidence });
  if (!task) {
    writeErr(`Unknown task id: ${id}\n`);
    exit(1);
  }
  if (task.error) {
    writeErr(`${task.error}\n`);
    exit(1);
  }
  write(JSON.stringify({ rejected: task }, null, 2) + "\n");
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

function handleSwarmBrief() {
  const id = requireOption("--id");
  const brief = swarmBrief(id);
  if (!brief) {
    writeErr(`Unknown swarm id: ${id}\n`);
    exit(1);
  }
  write(JSON.stringify({ brief }, null, 2) + "\n");
}

function handleSwarmBundle() {
  const id = requireOption("--id");
  const bundle = swarmBundle(id);
  if (!bundle) {
    writeErr(`Unknown swarm id: ${id}\n`);
    exit(1);
  }
  write(JSON.stringify({ bundle }, null, 2) + "\n");
}

function handleSwarmBlockers() {
  const id = requireOption("--id");
  const blockers = swarmBlockers(id);
  if (!blockers) {
    writeErr(`Unknown swarm id: ${id}\n`);
    exit(1);
  }
  write(JSON.stringify({ blockers }, null, 2) + "\n");
}

function handleSwarmCloseout() {
  const id = requireOption("--id");
  const closeout = swarmCloseout(id);
  if (!closeout) {
    writeErr(`Unknown swarm id: ${id}\n`);
    exit(1);
  }
  write(JSON.stringify({ closeout }, null, 2) + "\n");
}

function handleSwarmDispatchBundle() {
  const id = requireOption("--id");
  const dispatchBundle = swarmDispatchBundle(id);
  if (!dispatchBundle) {
    writeErr(`Unknown swarm id: ${id}\n`);
    exit(1);
  }
  write(JSON.stringify({ dispatchBundle }, null, 2) + "\n");
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

function handleSwarmCheck() {
  const id = requireOption("--id");
  const validation = validateSwarm(id);
  if (!validation) {
    writeErr(`Unknown swarm id: ${id}\n`);
    exit(1);
  }
  write(JSON.stringify({ validation }, null, 2) + "\n");
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
    case "catalog":
      printCatalog();
      return;
    case "status":
      printStatus();
      return;
    case "capabilities":
      printCapabilities();
      return;
    case "runtime:activity":
      printRuntimeActivity();
      return;
    case "runtime:closeout":
      printRuntimeCloseout();
      return;
    case "runtime:closeout-pack":
      printRuntimeCloseoutPack();
      return;
    case "runtime:control-pack":
      printRuntimeControlPack();
      return;
    case "runtime:signal-pack":
      printRuntimeSignalPack();
      return;
    case "runtime:handoff-pack":
      printRuntimeHandoffPack();
      return;
    case "runtime:handoffs":
      printRuntimeHandoffs();
      return;
    case "runtime:leader-pack":
      printRuntimeLeaderPack();
      return;
    case "runtime:operator-pack":
      printRuntimeOperatorPack();
      return;
    case "runtime:recovery-pack":
      printRuntimeRecoveryPack();
      return;
    case "runtime:review-pack":
      printRuntimeReviewPack();
      return;
    case "runtime:queue-pack":
      printRuntimeQueuePack();
      return;
    case "runtime:workspace-pack":
      printRuntimeWorkspacePack();
      return;
    case "runtime:owner-pack":
      printRuntimeOwnerPack();
      return;
    case "runtime:verifier-pack":
      printRuntimeVerifierPack();
      return;
    case "runtime:worker-pack":
      printRuntimeWorkerPack();
      return;
    case "runtime:recovery":
      printRuntimeRecovery();
      return;
    case "runtime:summary-pack":
      printRuntimeSummaryPack();
      return;
    case "runtime:dashboard":
      printRuntimeDashboard();
      return;
    case "runtime:dispatch":
      printRuntimeDispatch();
      return;
    case "runtime:dispatch-pack":
      printRuntimeDispatchPack();
      return;
    case "runtime:focus":
      printRuntimeFocus();
      return;
    case "runtime:review":
      printRuntimeReview();
      return;
    case "runtime:alerts":
      printRuntimeAlerts();
      return;
    case "runtime:roles":
      printRuntimeRoles();
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
    case "task:get":
      handleTaskGet();
      return;
    case "task:history":
      handleTaskHistory();
      return;
    case "task:annotate":
      handleTaskAnnotate();
      return;
    case "task:report":
      handleTaskReport();
      return;
    case "task:brief":
      handleTaskBrief();
      return;
    case "task:inbox":
      handleTaskInbox();
      return;
    case "task:next":
      handleTaskNext();
      return;
    case "task:pickup":
      handleTaskPickup();
      return;
    case "worker:session":
      handleWorkerSession();
      return;
    case "worker:handoff":
      handleWorkerHandoff();
      return;
    case "worker:closeout":
      handleWorkerCloseout();
      return;
    case "verifier:bundle":
      handleVerifierBundle();
      return;
    case "leader:workspace":
      handleLeaderWorkspace();
      return;
    case "leader:queue":
      handleLeaderQueue();
      return;
    case "leader:assignments":
      handleLeaderAssignments();
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
    case "task:approve":
      handleTaskApprove();
      return;
    case "task:reject":
      handleTaskReject();
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
    case "task:check":
      handleTaskCheck();
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
    case "swarm:brief":
      handleSwarmBrief();
      return;
    case "swarm:bundle":
      handleSwarmBundle();
      return;
    case "swarm:blockers":
      handleSwarmBlockers();
      return;
    case "swarm:closeout":
      handleSwarmCloseout();
      return;
    case "swarm:dispatch-bundle":
      handleSwarmDispatchBundle();
      return;
    case "swarm:update":
      handleSwarmUpdate();
      return;
    case "swarm:check":
      handleSwarmCheck();
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
