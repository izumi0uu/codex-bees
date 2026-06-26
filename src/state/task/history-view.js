import { createLoadedValueView } from "../../state-view-helpers.js";

export function buildTaskHistoryView(
  id,
  {
    getTask,
    deriveTaskHistoryReason
  }
) {
  const task = getTask(id);
  if (!task) {
    return null;
  }
  const history = task.history ?? [];
  const next = history.at(-1) ?? null;
  const recommendedReason = deriveTaskHistoryReason({ history, next });

  return createLoadedValueView("task_history", "history", history, {
    recommendedReason,
    counts: {
      totalHistoryEntries: history.length
    },
    extra: {
      taskId: task.id,
      title: task.title,
      queueStatus: task.queueStatus
    }
  });
}

export function buildTaskHistoryViewFromSources(id, sources) {
  return buildTaskHistoryView(id, sources);
}
