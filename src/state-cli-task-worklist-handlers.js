import { readOption, readPositiveIntegerOption, requireOption } from "./state-cli-helpers.js";
import { previewTaskAssignment, previewTaskPickup, taskInbox, taskNext } from "./state-runtime.js";
import { writeNamedView } from "./state-cli-view-writers.js";

function readTaskInboxOptions() {
  return {
    role: requireOption("--role"),
    workerId: readOption("--worker"),
    limit: readPositiveIntegerOption("--limit")
  };
}

function readTaskNextOptions() {
  return {
    role: requireOption("--role"),
    workerId: readOption("--worker"),
    mode: readOption("--mode")
  };
}

function readTaskWorkerOptions() {
  return {
    role: requireOption("--role"),
    workerId: requireOption("--worker"),
    mode: readOption("--mode")
  };
}

export function handleTaskInbox() {
  const inbox = taskInbox(readTaskInboxOptions());
  writeNamedView("inbox", inbox);
}

export function handleTaskNext() {
  const next = taskNext(readTaskNextOptions());
  writeNamedView("next", next);
}

export function handleTaskPickupPreview() {
  const pickupPreview = previewTaskPickup(readTaskWorkerOptions());
  writeNamedView("pickupPreview", pickupPreview);
}

export function handleTaskAssignmentPreview() {
  const assignmentPreview = previewTaskAssignment({
    ...readTaskWorkerOptions(),
    taskId: readOption("--task")
  });
  writeNamedView("assignmentPreview", assignmentPreview);
}
