import { buildTask } from "../core/builders.js";
import { buildTaskMutationResult } from "../core/lifecycle-views.js";
import { archiveTaskFromSources } from "../archive/core.js";
import { reopenTaskFromSources, restoreTaskFromSources } from "../archive/restore-core.js";
import { appendTaskAnnotation } from "../task/core.js";
import {
  addTaskFromSources,
  addTasksFromSources,
  annotateTaskFromSources,
  buildUpdatedTaskState,
  updateTaskFromSources
} from "../task/write.js";

export function annotateTaskOperation(
  input,
  {
    loadState,
    saveState,
    normalizeTask
  }
) {
  return annotateTaskFromSources(input, {
    loadState,
    saveState,
    normalizeTask,
    appendTaskAnnotation
  });
}

export function annotateTaskMutationOperation(input, { annotateTask }) {
  return buildTaskMutationResult(annotateTask(input), "task_annotated");
}

export function addTaskOperation(input, { loadState, saveState }) {
  return addTaskFromSources(input, {
    loadState,
    saveState,
    buildTask
  });
}

export function addTaskMutationOperation(input, { addTask }) {
  return buildTaskMutationResult(addTask(input), "task_created");
}

export function addTasksOperation(inputs, { loadState, saveState }) {
  return addTasksFromSources(inputs, {
    loadState,
    saveState,
    buildTask
  });
}

export function updateTaskOperation(
  input,
  {
    loadState,
    saveState,
    findTaskIndex,
    normalizeTask
  }
) {
  return updateTaskFromSources(input, {
    loadState,
    saveState,
    findTaskIndex,
    normalizeTask,
    buildUpdatedTaskState
  });
}

export function updateTaskMutationOperation(input, { updateTask }) {
  return buildTaskMutationResult(updateTask(input), "task_updated");
}

export function archiveTaskOperation(
  input,
  {
    loadState,
    saveState,
    findTaskIndex,
    normalizeTask
  }
) {
  return archiveTaskFromSources(input, {
    loadState,
    saveState,
    findTaskIndex,
    normalizeTask
  });
}

export function archiveTaskMutationOperation(input, { archiveTask }) {
  return buildTaskMutationResult(archiveTask(input), "task_archived");
}

export function restoreTaskOperation(input, { loadState, saveState, normalizeTask }) {
  return restoreTaskFromSources(input, {
    loadState,
    saveState,
    normalizeTask
  });
}

export function restoreTaskMutationOperation(input, { restoreTask }) {
  return buildTaskMutationResult(restoreTask(input), "task_restored");
}

export function reopenTaskOperation(
  input,
  {
    loadState,
    saveState,
    findTaskIndex,
    normalizeTask
  }
) {
  return reopenTaskFromSources(input, {
    loadState,
    saveState,
    findTaskIndex,
    normalizeTask
  });
}

export function reopenTaskMutationOperation(input, { reopenTask }) {
  return buildTaskMutationResult(reopenTask(input), "task_reopened");
}
