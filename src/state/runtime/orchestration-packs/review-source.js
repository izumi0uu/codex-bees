import { describeRole } from '../../task/core.js';
import { buildRuntimeReviewPackSummary, buildRuntimeReviewPackView, deriveRuntimeReviewPackReason, deriveRuntimeReviewPackSurface } from '../views.js';

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
