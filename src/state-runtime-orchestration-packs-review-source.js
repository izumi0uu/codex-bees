import { describeRole } from './state-task-core.js';
import { buildRuntimeReviewPackSummary, buildRuntimeReviewPackView, deriveRuntimeReviewPackReason, deriveRuntimeReviewPackSurface } from './state-runtime-views.js';

export function runtimeReviewPackFromSources(
  input = {},
  {
    runtimeReview,
    runtimeRoles,
    runtimeVerifierPack
  }
) {
  return buildRuntimeReviewPackView(
    input,
    {
      runtimeReview,
      runtimeRoles,
      runtimeVerifierPack,
      describeRole
    },
    {
      deriveRuntimeReviewPackSurface,
      deriveRuntimeReviewPackReason,
      buildRuntimeReviewPackSummary
    }
  );
}
