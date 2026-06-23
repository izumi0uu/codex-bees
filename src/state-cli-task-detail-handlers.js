import { exit, requireOption, write, writeErr } from "./state-cli-helpers.js";
import {
  getArchivedTaskView,
  getTaskView,
  listArchivedTasksView,
  listTasksView,
  taskBrief,
  taskHistory,
  taskReport
} from "./state-runtime.js";

function writeTaskLookup(label, lookup, id, missingLabel = "task") {
  const value = lookup(id);
  if (!value) {
    writeErr(`Unknown ${missingLabel} id: ${id}\n`);
    exit(1);
  }
  write(JSON.stringify({ [label]: value }, null, 2) + "\n");
}

export function printTasks() {
  write(JSON.stringify({ tasks: listTasksView() }, null, 2) + "\n");
}

export function handleTaskGet() {
  const id = requireOption("--id");
  writeTaskLookup("task", getTaskView, id);
}

export function handleTaskArchiveList() {
  write(JSON.stringify({ archivedTasks: listArchivedTasksView() }, null, 2) + "\n");
}

export function handleTaskArchiveGet() {
  const id = requireOption("--id");
  writeTaskLookup("archivedTask", getArchivedTaskView, id, "archived task");
}

export function handleTaskHistory() {
  const id = requireOption("--id");
  writeTaskLookup("history", taskHistory, id);
}

export function handleTaskReport() {
  const id = requireOption("--id");
  writeTaskLookup("report", taskReport, id);
}

export function handleTaskBrief() {
  const id = requireOption("--id");
  writeTaskLookup("brief", taskBrief, id);
}
