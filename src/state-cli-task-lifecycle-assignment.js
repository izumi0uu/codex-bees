import { taskAssignmentPickup, taskPickup } from "./state-runtime.js";
import { writeNamedView } from "./state-cli-view-writers.js";
import { readOption } from "./state-cli-helpers.js";
import { readTaskWorkerOptions } from "./state-cli-task-lifecycle-options.js";

export function handleTaskAssignmentPickup() {
  const assignmentPickup = taskAssignmentPickup({
    ...readTaskWorkerOptions(),
    taskId: readOption("--task")
  });
  writeNamedView("assignmentPickup", assignmentPickup);
}

export function handleTaskPickup() {
  const pickup = taskPickup(readTaskWorkerOptions());
  writeNamedView("pickup", pickup);
}
