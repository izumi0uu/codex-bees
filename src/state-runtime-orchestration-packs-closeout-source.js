import { buildRuntimeCloseoutPackSummary, buildRuntimeCloseoutPackView, deriveRuntimeCloseoutPackReason, deriveRuntimeCloseoutPackSurface } from './state-runtime-views.js';

export function runtimeCloseoutPackFromSources(
  input = {},
  {
    runtimeCloseout,
    runtimeSummaryPack,
    runtimeLeaderPack
  }
) {
  return buildRuntimeCloseoutPackView(
    input,
    {
      runtimeCloseout,
      runtimeSummaryPack,
      runtimeLeaderPack
    },
    {
      deriveRuntimeCloseoutPackSurface,
      deriveRuntimeCloseoutPackReason,
      buildRuntimeCloseoutPackSummary
    }
  );
}
