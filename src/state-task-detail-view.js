import { buildTaskDetailMetadata } from "./state-view-metadata.js";
import { createLoadedValueView } from "./state-view-helpers.js";

export function buildTaskDetailView(
  id,
  {
    getTask,
    deriveReviewState
  }
) {
  const task = getTask(id);
  if (!task) {
    return null;
  }

  return createLoadedValueView("task_detail", "task", task, {
    recommendedReason: "task_detail_loaded",
    extra: {
      metadata: buildTaskDetailMetadata(task, deriveReviewState(task))
    }
  });
}

export function buildTaskDetailViewFromSources(id, sources) {
  return buildTaskDetailView(id, sources);
}
