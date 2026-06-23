import {
  buildRuntimeReviewSummary,
  buildRuntimeReviewView,
  buildRuntimeReviewViewFromSources,
  deriveRuntimeReviewReason
} from './state-dashboard-views.js';
import { compareTasksByUpdatedAt } from './state-queue-views.js';
import { buildRuntimeReviewTaskEntry, compareRuntimeReviewGroups } from './state-task-views.js';
import { describeRole } from './state-task-core.js';

export function runtimeReviewFromSources({
  loadState,
  normalizeTask,
  taskBrief
}) {
  return buildRuntimeReviewViewFromSources(
    {
      loadState,
      normalizeTask,
      compareTasksByUpdatedAt,
      describeRole,
      taskBrief,
      buildRuntimeReviewTaskEntry,
      compareRuntimeReviewGroups
    },
    {
      deriveRuntimeReviewReason,
      buildRuntimeReviewSummary,
      buildRuntimeReviewView
    },
    {
      buildRuntimeReviewView
    }
  );
}
