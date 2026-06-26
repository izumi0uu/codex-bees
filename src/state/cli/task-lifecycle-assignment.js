import { taskAssignmentPickup, taskPickup } from "../../state-runtime.js";
import { writeNamedView } from "./view-writers.js";
import { readOption } from "./helpers.js";
import { readTaskWorkerOptions } from "./task-lifecycle-options.js";

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
