import {
  addTaskLifecycle,
  annotateTaskMutation,
  approveTaskLifecycle,
  blockTaskLifecycle,
  claimTaskLifecycle,
  completeTaskLifecycle,
  getTaskView,
  leaderAssignmentDispatch,
  leaderAssignmentDispatchBundle,
  leaderAssignmentDispatchPack,
  leaderAssignmentLaunchPlan,
  leaderAssignments,
  leaderQueue,
  leaderWorkspace,
  listTasksView,
  markTaskReadyForReviewLifecycle,
  previewTaskAssignment,
  previewTaskPickup,
  rejectTaskLifecycle,
  releaseTaskLifecycle,
  taskAssignmentPickup,
  taskBrief,
  taskHistory,
  taskInbox,
  taskNext,
  taskPickup,
  taskReport,
  updateTaskMutation,
  validateTask,
  verifierBundle,
  workerCloseout,
  workerHandoff,
  workerSession
} from "./state.js";
import { exit, readJsonOption, readListOption, readOption, readPositiveIntegerOption, requireOption, write, writeErr } from "./state-cli-helpers.js";

function printTasks() {
  write(JSON.stringify({ tasks: listTasksView() }, null, 2) + "\n");
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

export {
  handleLeaderAssignmentDispatch,
  handleLeaderAssignmentDispatchBundle,
  handleLeaderAssignmentDispatchPack,
  handleLeaderAssignmentLaunchPlan,
  handleLeaderAssignments,
  handleLeaderQueue,
  handleLeaderWorkspace,
  handleTaskAdd,
  handleTaskAnnotate,
  handleTaskApprove,
  handleTaskAssignmentPickup,
  handleTaskAssignmentPreview,
  handleTaskBlock,
  handleTaskBrief,
  handleTaskCheck,
  handleTaskClaim,
  handleTaskDone,
  handleTaskGet,
  handleTaskHistory,
  handleTaskInbox,
  handleTaskNext,
  handleTaskPickup,
  handleTaskPickupPreview,
  handleTaskReject,
  handleTaskRelease,
  handleTaskReport,
  handleTaskReview,
  handleTaskUpdate,
  handleVerifierBundle,
  handleWorkerCloseout,
  handleWorkerHandoff,
  handleWorkerSession,
  printTasks
};
