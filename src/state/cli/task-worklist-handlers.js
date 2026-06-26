import { readOption } from "./helpers.js";
import {
  readRequiredRoleWorkerOptions,
  readRoleOptionalWorkerOptions
} from "./role-worker-options.js";
import { previewTaskAssignment, previewTaskPickup, taskInbox, taskNext } from "../../state-runtime.js";
import { writeNamedView } from "./view-writers.js";

function readTaskInboxOptions() {
  return readRoleOptionalWorkerOptions({ limit: true });
}

function readTaskNextOptions() {
  return readRoleOptionalWorkerOptions({ mode: true });
}

function readTaskWorkerOptions() {
  return readRequiredRoleWorkerOptions({ mode: true });
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
