import { requireOption } from "./state-cli-helpers.js";
import {
  getArchivedTaskView,
  getTaskView,
  listArchivedTasksView,
  listTasksView,
  taskBrief,
  taskHistory,
  taskReport
} from "./state-runtime.js";
import { writeLookupView } from "./state-cli-lookup-writers.js";
import { writeNamedView } from "./state-cli-view-writers.js";

export function printTasks() {
  writeNamedView("tasks", listTasksView());
}

export function handleTaskGet() {
  const id = requireOption("--id");
  writeLookupView("task", getTaskView, id, "task");
}

export function handleTaskArchiveList() {
  writeNamedView("archivedTasks", listArchivedTasksView());
}

export function handleTaskArchiveGet() {
  const id = requireOption("--id");
  writeLookupView("archivedTask", getArchivedTaskView, id, "archived task");
}

export function handleTaskHistory() {
  const id = requireOption("--id");
  writeLookupView("history", taskHistory, id, "task");
}

export function handleTaskReport() {
  const id = requireOption("--id");
  writeLookupView("report", taskReport, id, "task");
}

export function handleTaskBrief() {
  const id = requireOption("--id");
  writeLookupView("brief", taskBrief, id, "task");
}
