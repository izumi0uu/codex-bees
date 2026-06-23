import {
  addTaskLifecycle,
  annotateTaskMutation,
  approveTaskLifecycle,
  archiveTaskMutation,
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

function handleTaskAdd() {
  const title = requireOption("--title");
  const status = readOption("--status");
  const owner = readOption("--owner");
  const verifier = readOption("--verifier");
  const objective = readOption("--objective");
  const lane = readOption("--lane");
  const lanePurpose = readOption("--lane-purpose");
  const swarmId = readOption("--swarm-id");
  const scope = readListOption("--scope");
  const dependsOn = readListOption("--depends-on");
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
    lanePurpose,
    swarmId,
    scope,
    dependsOn,
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
    lanePurpose: readOption("--lane-purpose"),
    swarmId: readOption("--swarm-id"),
    scope: readListOption("--scope"),
    dependsOn: readListOption("--depends-on"),
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

function handleTaskArchive() {
  const id = requireOption("--id");
  const archived = archiveTaskMutation({
    id,
    archivedBy: readOption("--by"),
    notes: readOption("--notes")
  });

  if (!archived) {
    writeErr(`Unknown task id: ${id}\n`);
    exit(1);
  }
  if (archived.error) {
    writeErr(`${archived.error}\n`);
    exit(1);
  }

  write(JSON.stringify({ archived }, null, 2) + "\n");
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
  handleTaskAdd,
  handleTaskUpdate,
  handleTaskArchive,
  handleTaskAnnotate,
  handleTaskAssignmentPickup,
  handleTaskPickup,
  handleTaskCheck,
  handleTaskClaim,
  handleTaskRelease,
  handleTaskBlock,
  handleTaskReview,
  handleTaskDone,
  handleTaskApprove,
  handleTaskReject
};
