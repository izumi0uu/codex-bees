import {
  addTaskLifecycle,
  annotateTaskMutation,
  archiveTaskMutation,
  reopenTaskMutation,
  restoreTaskMutation,
  updateTaskMutation,
  validateTask
} from "../../state-runtime.js";
import { writeLookupView } from "./lookup-writers.js";
import { writeMutationView } from "./mutation-writers.js";
import { writeNamedView } from "./view-writers.js";
import { readOption, requireOption } from "./helpers.js";
import { readTaskDefinitionOptions, requireTaskId } from "./task-lifecycle-options.js";

export function handleTaskAdd() {
  const title = requireOption("--title");
  const task = addTaskLifecycle({
    title,
    ...readTaskDefinitionOptions()
  });
  writeNamedView("created", task);
}

export function handleTaskUpdate() {
  const id = requireTaskId();
  writeMutationView("updated", updateTaskMutation({
    id,
    title: readOption("--title"),
    ...readTaskDefinitionOptions()
  }), { id });
}

export function handleTaskArchive() {
  const id = requireTaskId();
  writeMutationView("archived", archiveTaskMutation({
    id,
    archivedBy: readOption("--by"),
    notes: readOption("--notes")
  }), { id });
}

export function handleTaskRestore() {
  const id = requireTaskId();
  writeMutationView("restored", restoreTaskMutation({
    id,
    restoredBy: readOption("--by"),
    notes: readOption("--notes")
  }), { id, missingLabel: "archived task" });
}

export function handleTaskReopen() {
  const id = requireTaskId();
  writeMutationView("reopened", reopenTaskMutation({
    id,
    reopenedBy: readOption("--by"),
    notes: readOption("--notes")
  }), { id });
}

export function handleTaskAnnotate() {
  const id = requireTaskId();
  writeMutationView("annotated", annotateTaskMutation({
    id,
    actor: readOption("--by"),
    kind: readOption("--kind"),
    content: requireOption("--content")
  }), { id });
}

export function handleTaskCheck() {
  const id = requireTaskId();
  writeLookupView("validation", validateTask, id, "task");
}
