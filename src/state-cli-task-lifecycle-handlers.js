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
import { exit, readListOption, readOption, requireOption, writeErr } from "./state-cli-helpers.js";
import { writeMutationView } from "./state-cli-mutation-writers.js";
import { writeNamedView } from "./state-cli-view-writers.js";

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

function handleTaskAdd() {
  const title = requireOption("--title");
  const task = addTaskLifecycle({
    title,
    ...readTaskDefinitionOptions()
  });
  writeNamedView("created", task);
}

function handleTaskUpdate() {
  const id = requireTaskId();
  writeMutationView("updated", updateTaskMutation({
    id,
    title: readOption("--title"),
    ...readTaskDefinitionOptions()
  }), { id });
}

function handleTaskArchive() {
  const id = requireTaskId();
  writeMutationView("archived", archiveTaskMutation({
    id,
    archivedBy: readOption("--by"),
    notes: readOption("--notes")
  }), { id });
}

function handleTaskRestore() {
  const id = requireTaskId();
  writeMutationView("restored", restoreTaskMutation({
    id,
    restoredBy: readOption("--by"),
    notes: readOption("--notes")
  }), { id, missingLabel: "archived task" });
}

function handleTaskReopen() {
  const id = requireTaskId();
  writeMutationView("reopened", reopenTaskMutation({
    id,
    reopenedBy: readOption("--by"),
    notes: readOption("--notes")
  }), { id });
}

function handleTaskAnnotate() {
  const id = requireTaskId();
  writeMutationView("annotated", annotateTaskMutation({
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
  writeNamedView("assignmentPickup", assignmentPickup);
}

function handleTaskPickup() {
  const pickup = taskPickup(readTaskWorkerOptions());
  writeNamedView("pickup", pickup);
}

function handleTaskCheck() {
  const id = requireTaskId();
  const validation = validateTask(id);
  if (!validation) {
    writeErr(`Unknown task id: ${id}\n`);
    exit(1);
  }
  writeNamedView("validation", validation);
}

function handleTaskClaim() {
  const id = requireTaskId();
  const claimedBy = requireOption("--by");
  writeMutationView("claimed", claimTaskLifecycle({ id, claimedBy }), { id });
}

function handleTaskRelease() {
  const id = requireTaskId();
  const claimedBy = readOption("--by");
  writeMutationView("released", releaseTaskLifecycle({ id, claimedBy }), { id });
}

function handleTaskBlock() {
  const id = requireTaskId();
  const claimedBy = readOption("--by");
  const notes = readOption("--notes");
  writeMutationView("blocked", blockTaskLifecycle({ id, claimedBy, notes }), { id });
}

function handleTaskReview() {
  const id = requireTaskId();
  const claimedBy = readOption("--by");
  const notes = readOption("--notes");
  writeMutationView("readyForReview", markTaskReadyForReviewLifecycle({ id, claimedBy, notes }), { id });
}

function handleTaskDone() {
  const id = requireTaskId();
  writeMutationView("completed", completeTaskLifecycle({ id, ...readTaskReviewOptions() }), { id });
}

function handleTaskApprove() {
  const id = requireTaskId();
  writeMutationView("approved", approveTaskLifecycle({ id, ...readTaskReviewOptions() }), { id });
}

function handleTaskReject() {
  const id = requireTaskId();
  writeMutationView("rejected", rejectTaskLifecycle({
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
