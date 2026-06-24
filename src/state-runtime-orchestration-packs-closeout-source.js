import { buildRuntimeCloseoutPackSummary, buildRuntimeCloseoutPackView, deriveRuntimeCloseoutPackReason, deriveRuntimeCloseoutPackSurface } from './state-runtime-views.js';

export function runtimeCloseoutPackFromSources(input = {}, sources = {}) {
  return buildRuntimeCloseoutPackView(
    input,
    sources,
    {
      deriveRuntimeCloseoutPackSurface,
      deriveRuntimeCloseoutPackReason,
      buildRuntimeCloseoutPackSummary
    }
  );
}
