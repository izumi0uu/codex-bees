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
} from "./state-runtime.js";
import { exit, readJsonOption, readListOption, readOption, readPositiveIntegerOption, requireOption, write, writeErr } from "./state-cli-helpers.js";

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

export {
  handleWorkerSession,
  handleWorkerHandoff,
  handleWorkerCloseout,
  handleVerifierBundle,
  handleLeaderWorkspace,
  handleLeaderQueue,
  handleLeaderAssignments,
  handleLeaderAssignmentDispatch,
  handleLeaderAssignmentDispatchPack,
  handleLeaderAssignmentDispatchBundle,
  handleLeaderAssignmentLaunchPlan
};
