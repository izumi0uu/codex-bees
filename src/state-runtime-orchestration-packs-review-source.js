import { describeRole } from './state-task-core.js';
import { buildRuntimeReviewPackSummary, buildRuntimeReviewPackView, deriveRuntimeReviewPackReason, deriveRuntimeReviewPackSurface } from './state-runtime-views.js';

export function runtimeReviewPackFromSources(input = {}, sources = {}) {
  return buildRuntimeReviewPackView(
    input,
    {
      ...sources,
      describeRole
    },
    {
      deriveRuntimeReviewPackSurface,
      deriveRuntimeReviewPackReason,
      buildRuntimeReviewPackSummary
    }
  );
}
