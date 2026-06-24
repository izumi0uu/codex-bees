import { buildRuntimeQueuePackSummary, buildRuntimeQueuePackView, deriveRuntimeQueuePackReason, deriveRuntimeQueuePackSurface } from './state-runtime-views.js';

export function runtimeQueuePackFromSources(input = {}, sources = {}) {
  return buildRuntimeQueuePackView(
    input,
    sources,
    {
      deriveRuntimeQueuePackSurface,
      deriveRuntimeQueuePackReason,
      buildRuntimeQueuePackSummary
    }
  );
}
