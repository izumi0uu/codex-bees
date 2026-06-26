import { buildRuntimeExecutionPackSummary, buildRuntimeExecutionPackView, deriveRuntimeExecutionPackReason, deriveRuntimeExecutionPackSurface } from '../views.js';

export function runtimeExecutionPackFromSources(input = {}, sources = {}) {
  return buildRuntimeExecutionPackView(
    input,
    sources,
    {
      deriveRuntimeExecutionPackSurface,
      deriveRuntimeExecutionPackReason,
      buildRuntimeExecutionPackSummary
    }
  );
}
