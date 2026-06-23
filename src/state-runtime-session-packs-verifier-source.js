import { describeRole } from './state-task-core.js';
import { buildRuntimeVerifierPackSummary, buildRuntimeVerifierPackView, deriveRuntimeVerifierPackReason, deriveRuntimeVerifierPackSurface } from './state-runtime-views.js';

export function runtimeVerifierPackFromSources(
  input = {},
  {
    runtimeReview,
    verifierBundle,
    workerCloseout,
    taskNext
  }
) {
  return buildRuntimeVerifierPackView(
    input,
    {
      runtimeReview,
      verifierBundle,
      workerCloseout,
      taskNext,
      describeRole
    },
    {
      deriveRuntimeVerifierPackSurface,
      deriveRuntimeVerifierPackReason,
      buildRuntimeVerifierPackSummary
    }
  );
}
