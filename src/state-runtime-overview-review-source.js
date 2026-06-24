import {
  buildRuntimeReviewSummary,
  buildRuntimeReviewViewFromSources,
  deriveRuntimeReviewReason
} from './state-dashboard-views.js';
import { compareTasksByUpdatedAt } from './state-queue-views.js';
import { buildRuntimeReviewTaskEntry, compareRuntimeReviewGroups } from './state-task-views.js';
import { describeRole } from './state-task-core.js';

export function runtimeReviewFromSources(sources = {}) {
  return buildRuntimeReviewViewFromSources(
    {
      ...sources,
      compareTasksByUpdatedAt,
      describeRole,
      buildRuntimeReviewTaskEntry,
      compareRuntimeReviewGroups
    },
    {
      deriveRuntimeReviewReason,
      buildRuntimeReviewSummary
    }
  );
}
