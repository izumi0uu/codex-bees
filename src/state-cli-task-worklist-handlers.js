import { readOption, readPositiveIntegerOption, requireOption, write } from "./state-cli-helpers.js";
import { previewTaskAssignment, previewTaskPickup, taskInbox, taskNext } from "./state-runtime.js";

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
  write(JSON.stringify({ inbox }, null, 2) + "\n");
}

export function handleTaskNext() {
  const next = taskNext(readTaskNextOptions());
  write(JSON.stringify({ next }, null, 2) + "\n");
}

export function handleTaskPickupPreview() {
  const pickupPreview = previewTaskPickup(readTaskWorkerOptions());
  write(JSON.stringify({ pickupPreview }, null, 2) + "\n");
}

export function handleTaskAssignmentPreview() {
  const assignmentPreview = previewTaskAssignment({
    ...readTaskWorkerOptions(),
    taskId: readOption("--task")
  });
  write(JSON.stringify({ assignmentPreview }, null, 2) + "\n");
}
