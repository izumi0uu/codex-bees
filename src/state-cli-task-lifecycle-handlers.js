import {
  addTaskLifecycle,
  annotateTaskMutation,
  approveTaskLifecycle,
  archiveTaskMutation,
  blockTaskLifecycle,
  claimTaskLifecycle,
  completeTaskLifecycle,
  markTaskReadyForReviewLifecycle,
  reopenTaskMutation,
  rejectTaskLifecycle,
  releaseTaskLifecycle,
  restoreTaskMutation,
  taskAssignmentPickup,
  taskPickup,
  updateTaskMutation,
  validateTask
} from "./state-runtime.js";
import { exit, readListOption, readOption, requireOption, write, writeErr } from "./state-cli-helpers.js";

function requireTaskId() {
  return requireOption("--id");
}

function readTaskDefinitionOptions() {
  return {
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
  };
}

function readTaskWorkerOptions() {
  return {
    role: requireOption("--role"),
    workerId: requireOption("--worker"),
    mode: readOption("--mode")
  };
}

function readTaskReviewOptions() {
  return {
    reviewedBy: requireOption("--by"),
    notes: readOption("--notes"),
    reviewEvidence: readListOption("--evidence", "|")
  };
}

function writeTaskMutation(label, result, { id, missingLabel = "task" } = {}) {
  if (!result) {
    writeErr(`Unknown ${missingLabel} id: ${id}\n`);
    exit(1);
  }
  if (result.error) {
    writeErr(`${result.error}\n`);
    exit(1);
  }
  write(JSON.stringify({ [label]: result }, null, 2) + "\n");
}

function handleTaskAdd() {
  const title = requireOption("--title");
  const task = addTaskLifecycle({
    title,
    ...readTaskDefinitionOptions()
  });
  write(JSON.stringify({ created: task }, null, 2) + "\n");
}

function handleTaskUpdate() {
  const id = requireTaskId();
  writeTaskMutation("updated", updateTaskMutation({
    id,
    title: readOption("--title"),
    ...readTaskDefinitionOptions()
  }), { id });
}

function handleTaskArchive() {
  const id = requireTaskId();
  writeTaskMutation("archived", archiveTaskMutation({
    id,
    archivedBy: readOption("--by"),
    notes: readOption("--notes")
  }), { id });
}

function handleTaskRestore() {
  const id = requireTaskId();
  writeTaskMutation("restored", restoreTaskMutation({
    id,
    restoredBy: readOption("--by"),
    notes: readOption("--notes")
  }), { id, missingLabel: "archived task" });
}

function handleTaskReopen() {
  const id = requireTaskId();
  writeTaskMutation("reopened", reopenTaskMutation({
    id,
    reopenedBy: readOption("--by"),
    notes: readOption("--notes")
  }), { id });
}

function handleTaskAnnotate() {
  const id = requireTaskId();
  writeTaskMutation("annotated", annotateTaskMutation({
    id,
    actor: readOption("--by"),
    kind: readOption("--kind"),
    content: requireOption("--content")
  }), { id });
}

function handleTaskAssignmentPickup() {
  const assignmentPickup = taskAssignmentPickup({
    ...readTaskWorkerOptions(),
    taskId: readOption("--task")
  });
  write(JSON.stringify({ assignmentPickup }, null, 2) + "\n");
}

function handleTaskPickup() {
  const pickup = taskPickup(readTaskWorkerOptions());
  write(JSON.stringify({ pickup }, null, 2) + "\n");
}

function handleTaskCheck() {
  const id = requireTaskId();
  const validation = validateTask(id);
  if (!validation) {
    writeErr(`Unknown task id: ${id}\n`);
    exit(1);
  }
  write(JSON.stringify({ validation }, null, 2) + "\n");
}

function handleTaskClaim() {
  const id = requireTaskId();
  const claimedBy = requireOption("--by");
  writeTaskMutation("claimed", claimTaskLifecycle({ id, claimedBy }), { id });
}

function handleTaskRelease() {
  const id = requireTaskId();
  const claimedBy = readOption("--by");
  writeTaskMutation("released", releaseTaskLifecycle({ id, claimedBy }), { id });
}

function handleTaskBlock() {
  const id = requireTaskId();
  const claimedBy = readOption("--by");
  const notes = readOption("--notes");
  writeTaskMutation("blocked", blockTaskLifecycle({ id, claimedBy, notes }), { id });
}

function handleTaskReview() {
  const id = requireTaskId();
  const claimedBy = readOption("--by");
  const notes = readOption("--notes");
  writeTaskMutation("readyForReview", markTaskReadyForReviewLifecycle({ id, claimedBy, notes }), { id });
}

function handleTaskDone() {
  const id = requireTaskId();
  writeTaskMutation("completed", completeTaskLifecycle({ id, ...readTaskReviewOptions() }), { id });
}

function handleTaskApprove() {
  const id = requireTaskId();
  writeTaskMutation("approved", approveTaskLifecycle({ id, ...readTaskReviewOptions() }), { id });
}

function handleTaskReject() {
  const id = requireTaskId();
  writeTaskMutation("rejected", rejectTaskLifecycle({
    id,
    nextQueueStatus: readOption("--status"),
    ...readTaskReviewOptions()
  }), { id });
}

export {
  handleTaskAdd,
  handleTaskUpdate,
  handleTaskArchive,
  handleTaskRestore,
  handleTaskReopen,
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
