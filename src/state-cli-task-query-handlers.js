import {
  getArchivedTaskView,
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
  listArchivedTasksView,
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

function handleTaskGet() {
  const id = requireOption("--id");
  const task = getTaskView(id);
  if (!task) {
    writeErr(`Unknown task id: ${id}\n`);
    exit(1);
  }
  write(JSON.stringify({ task }, null, 2) + "\n");
}

function handleTaskArchiveList() {
  write(JSON.stringify({ archivedTasks: listArchivedTasksView() }, null, 2) + "\n");
}

function handleTaskArchiveGet() {
  const id = requireOption("--id");
  const archivedTask = getArchivedTaskView(id);
  if (!archivedTask) {
    writeErr(`Unknown archived task id: ${id}\n`);
    exit(1);
  }
  write(JSON.stringify({ archivedTask }, null, 2) + "\n");
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

export {
  printTasks,
  handleTaskGet,
  handleTaskArchiveList,
  handleTaskArchiveGet,
  handleTaskHistory,
  handleTaskReport,
  handleTaskBrief,
  handleTaskInbox,
  handleTaskNext,
  handleTaskPickupPreview,
  handleTaskAssignmentPreview
};
