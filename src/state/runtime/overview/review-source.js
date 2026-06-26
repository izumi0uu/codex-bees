import {
  buildRuntimeReviewSummary,
  buildRuntimeReviewViewFromSources,
  deriveRuntimeReviewReason
} from '../../dashboard/views.js';
import { compareTasksByUpdatedAt } from '../../queue/views.js';
import { buildRuntimeReviewTaskEntry, compareRuntimeReviewGroups } from '../../task/views.js';
import { describeRole } from '../../task/core.js';

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
