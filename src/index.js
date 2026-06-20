#!/usr/bin/env node

import { stdout, stderr, exit, argv, env } from "node:process";
import { realpathSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { renderHelpText } from "./commands.js";
import { getToolCatalogView, runMcpCli, toolCatalog } from "./mcp.js";
import { getRuntimeCatalogView } from "./catalog.js";
import { planSwarm, planTask, queueTasksFromPlan } from "./planner.js";
import { getCapabilityCatalog, getCapabilityCatalogView, getRuntimeStatus, getRuntimeStatusView } from "./runtime-status.js";
import { getRuntimeContractView } from "./runtime-contract.js";
import { getRuntimeDoctorView } from "./doctor.js";
import { getPackageMetadataView, PACKAGE_VERSION, PRODUCT_NAME } from "./metadata.js";
import { getRuntimeReadyView } from "./runtime-ready.js";
import {
  activateSwarm,
  addTask,
  addTaskLifecycle,
  addTasks,
  annotateTaskMutation,
  approveTask,
  approveTaskLifecycle,
  blockSwarm,
  blockTask,
  blockTaskLifecycle,
  cancelSwarm,
  claimTask,
  claimTaskLifecycle,
  completeSwarm,
  completeTask,
  completeTaskLifecycle,
  dispatchSwarmLane,
  getTask,
  getSwarm,
  getSwarmView,
  initSwarm,
  initSwarmMutation,
  leaderAssignmentDispatch,
  leaderAssignmentDispatchBundle,
  leaderAssignmentLaunchPlan,
  leaderAssignmentDispatchPack,
  leaderAssignments,
  leaderQueue,
  leaderWorkspace,
  getTaskView,
  listMemories,
  listSwarmOverviews,
  listSwarms,
  listSwarmsView,
  listTasks,
  listTasksView,
  markTaskReadyForReview,
  markTaskReadyForReviewLifecycle,
  queueSwarmTasks,
  rejectTask,
  rejectTaskLifecycle,
  releaseTask,
  releaseTaskLifecycle,
  runtimeActivity,
  runtimeAssignmentPack,
  runtimeAlerts,
  runtimeCloseoutPack,
  runtimeCloseout,
  runtimeControlPack,
  runtimeDashboard,
  runtimeDispatchPack,
  runtimeDispatch,
  runtimeExecutionPack,
  runtimeFocus,
  runtimeHandoffPack,
  runtimeHandoffs,
  runtimeLeaderPack,
  runtimeOperatorPack,
  runtimeOwnerPack,
  runtimePickupPack,
  runtimeQueuePack,
  runtimeRecoveryPack,
  runtimeRecovery,
  runtimeRolePack,
  runtimeReviewPack,
  runtimeSessionPack,
  runtimeSignalPack,
  runtimeSummaryPack,
  runtimeTriagePack,
  runtimeVerifierPack,
  runtimeWorkspacePack,
  runtimeWorkerPack,
  runtimeReview,
  runtimeRoles,
  swarmOverview,
  syncSwarmStatus,
  searchMemoriesView,
  searchMemories,
  listMemoriesView,
  stateFilePath,
  storeMemory,
  storeMemoryMutation,
  swarmBlockers,
  swarmBundle,
  swarmCloseout,
  swarmDispatchBundle,
  swarmBrief,
  taskAssignmentPickup,
  taskInbox,
  taskHistory,
  taskPickup,
  previewTaskAssignment,
  previewTaskPickup,
  taskReport,
  taskNext,
  verifierBundle,
  workerCloseout,
  workerHandoff,
  workerSession,
  updateSwarm,
  updateSwarmMutation,
  updateTask,
  updateTaskMutation,
  taskBrief,
  validateSwarm,
  validateTask
} from "./state.js";

const MODULE_PATH = fileURLToPath(import.meta.url);

function write(text) {
  stdout.write(text);
}

function writeErr(text) {
  stderr.write(text);
}

function printHelp() {
  write(renderHelpText());
}

function printDoctor() {
  write(JSON.stringify(getRuntimeDoctorView(import.meta.url), null, 2) + "\n");
}

function printCatalog() {
  write(JSON.stringify({ catalog: getRuntimeCatalogView() }, null, 2) + "\n");
}

function printMetadata() {
  write(JSON.stringify({ metadata: getPackageMetadataView() }, null, 2) + "\n");
}

function printStatus() {
  write(JSON.stringify({ status: getRuntimeStatusView({ version: PACKAGE_VERSION, toolCount: toolCatalog.length }) }, null, 2) + "\n");
}

function printCapabilities() {
  write(JSON.stringify({ capabilities: getCapabilityCatalogView() }, null, 2) + "\n");
}

function printRuntimeActivity() {
  write(JSON.stringify({ activity: runtimeActivity({ limit: readPositiveIntegerOption("--limit") }) }, null, 2) + "\n");
}

function printRuntimeAssignmentPack() {
  const role = readOption("--role");
  const workerId = readOption("--worker");
  if (!role || !workerId) {
    writeErr("runtime:assignment-pack requires --role and --worker\n");
    exit(1);
  }
  write(JSON.stringify({
    assignmentPack: runtimeAssignmentPack({
      role,
      workerId,
      mode: readOption("--mode")
    })
  }, null, 2) + "\n");
}

function printRuntimeCloseout() {
  write(JSON.stringify({ closeout: runtimeCloseout() }, null, 2) + "\n");
}

function printRuntimeCloseoutPack() {
  write(JSON.stringify({
    closeoutPack: runtimeCloseoutPack({
      workerId: readOption("--worker"),
      workerIds: readJsonOption("--workers")
    })
  }, null, 2) + "\n");
}

function printRuntimeControlPack() {
  write(JSON.stringify({
    controlPack: runtimeControlPack({
      workerId: readOption("--worker"),
      workerIds: readJsonOption("--workers")
    })
  }, null, 2) + "\n");
}

function printRuntimeSignalPack() {
  write(JSON.stringify({ signalPack: runtimeSignalPack({ limit: readPositiveIntegerOption("--limit") }) }, null, 2) + "\n");
}

function printRuntimeExecutionPack() {
  write(JSON.stringify({
    executionPack: runtimeExecutionPack({
      workerId: readOption("--worker"),
      workerIds: readJsonOption("--workers")
    })
  }, null, 2) + "\n");
}

function printRuntimePickupPack() {
  const role = readOption("--role");
  const workerId = readOption("--worker");
  if (!role || !workerId) {
    writeErr("runtime:pickup-pack requires --role and --worker\n");
    exit(1);
  }
  write(JSON.stringify({
    pickupPack: runtimePickupPack({
      role,
      workerId,
      mode: readOption("--mode")
    })
  }, null, 2) + "\n");
}

function printRuntimeHandoffPack() {
  write(JSON.stringify({ handoffPack: runtimeHandoffPack() }, null, 2) + "\n");
}

function printRuntimeTriagePack() {
  write(JSON.stringify({ triagePack: runtimeTriagePack() }, null, 2) + "\n");
}

function printRuntimeHandoffs() {
  write(JSON.stringify({ handoffs: runtimeHandoffs() }, null, 2) + "\n");
}

function printRuntimeRecovery() {
  write(JSON.stringify({ recovery: runtimeRecovery() }, null, 2) + "\n");
}

function printRuntimeSummaryPack() {
  write(JSON.stringify({
    summaryPack: runtimeSummaryPack({
      workerId: readOption("--worker"),
      workerIds: readJsonOption("--workers")
    })
  }, null, 2) + "\n");
}

function printRuntimeLeaderPack() {
  write(JSON.stringify({
    leaderPack: runtimeLeaderPack({
      status: readOption("--status"),
      topology: readOption("--topology"),
      owner: readOption("--owner"),
      workerId: readOption("--worker"),
      workerIds: readJsonOption("--workers")
    })
  }, null, 2) + "\n");
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

function printRuntimeSessionPack() {
  const role = readOption("--role");
  const workerId = readOption("--worker");
  if (!role || !workerId) {
    writeErr("runtime:session-pack requires --role and --worker\n");
    exit(1);
  }
  write(JSON.stringify({
    sessionPack: runtimeSessionPack({
      role,
      workerId,
      mode: readOption("--mode")
    })
  }, null, 2) + "\n");
}

function printRuntimeQueuePack() {
  write(JSON.stringify({
    queuePack: runtimeQueuePack({
      workerId: readOption("--worker"),
      workerIds: readJsonOption("--workers")
    })
  }, null, 2) + "\n");
}

function printRuntimeWorkspacePack() {
  write(JSON.stringify({
    workspacePack: runtimeWorkspacePack({
      workerId: readOption("--worker"),
      workerIds: readJsonOption("--workers")
    })
  }, null, 2) + "\n");
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

function printRuntimeRolePack() {
  const role = readOption("--role");
  if (!role) {
    writeErr("runtime:role-pack requires --role\n");
    exit(1);
  }
  write(JSON.stringify({
    rolePack: runtimeRolePack({
      role,
      workerId: readOption("--worker"),
      mode: readOption("--mode")
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
  write(JSON.stringify({
    dispatchPack: runtimeDispatchPack({
      workerId: readOption("--worker"),
      workerIds: readJsonOption("--workers")
    })
  }, null, 2) + "\n");
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
  write(JSON.stringify({ tasks: listTasksView() }, null, 2) + "\n");
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
        swarms: listSwarmsView(filters, { detailed })
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
  const task = addTaskLifecycle({
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
  const task = updateTaskMutation({
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
  const task = getTaskView(id);
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
  const annotated = annotateTaskMutation({
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

function handleTaskPickupPreview() {
  const role = requireOption("--role");
  const workerId = requireOption("--worker");
  const pickupPreview = previewTaskPickup({
    role,
    workerId,
    mode: readOption("--mode")
  });
  write(JSON.stringify({ pickupPreview }, null, 2) + "\n");
}

function handleTaskAssignmentPreview() {
  const role = requireOption("--role");
  const workerId = requireOption("--worker");
  const assignmentPreview = previewTaskAssignment({
    role,
    workerId,
    mode: readOption("--mode"),
    taskId: readOption("--task")
  });
  write(JSON.stringify({ assignmentPreview }, null, 2) + "\n");
}

function handleTaskAssignmentPickup() {
  const role = requireOption("--role");
  const workerId = requireOption("--worker");
  const assignmentPickup = taskAssignmentPickup({
    role,
    workerId,
    mode: readOption("--mode"),
    taskId: readOption("--task")
  });
  write(JSON.stringify({ assignmentPickup }, null, 2) + "\n");
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

function handleLeaderAssignmentDispatch() {
  const dispatch = leaderAssignmentDispatch({
    role: readOption("--role") ?? readOption("--owner"),
    workerId: readOption("--worker"),
    taskId: readOption("--task"),
    status: readOption("--status"),
    topology: readOption("--topology"),
    owner: readOption("--owner")
  });
  write(JSON.stringify({ assignmentDispatch: dispatch }, null, 2) + "\n");
}

function handleLeaderAssignmentDispatchPack() {
  const dispatchPack = leaderAssignmentDispatchPack({
    role: readOption("--role") ?? readOption("--owner"),
    workerId: readOption("--worker"),
    workerIds: readJsonOption("--workers"),
    taskId: readOption("--task"),
    status: readOption("--status"),
    topology: readOption("--topology"),
    owner: readOption("--owner")
  });
  write(JSON.stringify({ assignmentDispatchPack: dispatchPack }, null, 2) + "\n");
}

function handleLeaderAssignmentDispatchBundle() {
  const dispatchBundle = leaderAssignmentDispatchBundle({
    role: readOption("--role") ?? readOption("--owner"),
    workerId: readOption("--worker"),
    workerIds: readJsonOption("--workers"),
    taskId: readOption("--task"),
    status: readOption("--status"),
    topology: readOption("--topology"),
    owner: readOption("--owner")
  });
  write(JSON.stringify({ assignmentDispatchBundle: dispatchBundle }, null, 2) + "\n");
}

function handleLeaderAssignmentLaunchPlan() {
  const launchPlan = leaderAssignmentLaunchPlan({
    role: readOption("--role") ?? readOption("--owner"),
    workerId: readOption("--worker"),
    workerIds: readJsonOption("--workers"),
    taskId: readOption("--task"),
    status: readOption("--status"),
    topology: readOption("--topology"),
    owner: readOption("--owner")
  });
  write(JSON.stringify({ assignmentLaunchPlan: launchPlan }, null, 2) + "\n");
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
  const task = claimTaskLifecycle({ id, claimedBy });
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
  const task = releaseTaskLifecycle({ id, claimedBy });
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
  const task = blockTaskLifecycle({ id, claimedBy, notes });
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
  const task = markTaskReadyForReviewLifecycle({ id, claimedBy, notes });
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
  const task = completeTaskLifecycle({ id, reviewedBy, notes, reviewEvidence });
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
  const task = approveTaskLifecycle({ id, reviewedBy, notes, reviewEvidence });
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
  const task = rejectTaskLifecycle({ id, reviewedBy, nextQueueStatus, notes, reviewEvidence });
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
        recommendedReason: queued.created.length > 1 ? "multiple_swarm_lane_tasks_queued" : "single_swarm_lane_task_queued",
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
  const swarm = initSwarmMutation({
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
  const swarm = getSwarmView(id);
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
  const swarm = updateSwarmMutation({
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
  const memory = storeMemoryMutation({
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
        memories: listMemoriesView({
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
  const results = searchMemoriesView(
    query,
    {
      namespace: readOption("--namespace"),
      kind: readOption("--kind"),
      agent: readOption("--agent"),
      tags: readListOption("--tags")
    },
    limit
  );

  write(JSON.stringify(results, null, 2) + "\n");
}

async function runCommand(command) {
  switch (command) {
    case undefined:
    case "run":
      write(JSON.stringify(getRuntimeReadyView(), null, 2) + "\n");
      return;
    case "mcp":
      await runMcpCli(argv.slice(3));
      return;
    case "tools":
      write(JSON.stringify({ tools: getToolCatalogView() }, null, 2) + "\n");
      return;
    case "doctor":
      printDoctor();
      return;
    case "catalog":
      printCatalog();
      return;
    case "metadata":
      printMetadata();
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
    case "runtime:assignment-pack":
      printRuntimeAssignmentPack();
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
    case "runtime:execution-pack":
      printRuntimeExecutionPack();
      return;
    case "runtime:handoff-pack":
      printRuntimeHandoffPack();
      return;
    case "runtime:pickup-pack":
      printRuntimePickupPack();
      return;
    case "runtime:triage-pack":
      printRuntimeTriagePack();
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
    case "runtime:session-pack":
      printRuntimeSessionPack();
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
    case "runtime:role-pack":
      printRuntimeRolePack();
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
    case "task:assignment-preview":
      handleTaskAssignmentPreview();
      return;
    case "task:assignment-pickup":
      handleTaskAssignmentPickup();
      return;
    case "task:pickup-preview":
      handleTaskPickupPreview();
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
    case "leader:assignment-dispatch":
      handleLeaderAssignmentDispatch();
      return;
    case "leader:assignment-dispatch-bundle":
      handleLeaderAssignmentDispatchBundle();
      return;
    case "leader:assignment-launch-plan":
      handleLeaderAssignmentLaunchPlan();
      return;
    case "leader:assignment-dispatch-pack":
      handleLeaderAssignmentDispatchPack();
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
      write(`${PACKAGE_VERSION}\n`);
      return;
    default:
      writeErr(`Unknown command: ${command}\n\n`);
      printHelp();
      exit(1);
  }
}

function isCliEntrypoint() {
  if (!argv[1]) {
    return false;
  }

  try {
    return realpathSync(argv[1]) === realpathSync(MODULE_PATH);
  } catch {
    return false;
  }
}

if (isCliEntrypoint()) {
  if (env.CODEX_BEES_CLI_TRACE === "1") {
    writeErr(`[codex-bees] argv=${JSON.stringify(argv.slice(2))}\n`);
  }

  runCommand(argv[2]).catch((error) => {
    writeErr(`${error.stack || error.message}\n`);
    exit(1);
  });
}
