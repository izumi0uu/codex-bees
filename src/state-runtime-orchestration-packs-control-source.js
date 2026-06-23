import { buildRuntimeControlPackSummary, buildRuntimeControlPackView, deriveRuntimeControlPackReason, deriveRuntimeControlPackSurface } from './state-runtime-views.js';

export function runtimeControlPackFromSources(
  input = {},
  {
    runtimeSummaryPack,
    runtimeWorkspacePack,
    runtimeOperatorPack,
    runtimeLeaderPack
  }
) {
  return buildRuntimeControlPackView(
    input,
    {
      runtimeSummaryPack,
      runtimeWorkspacePack,
      runtimeOperatorPack,
      runtimeLeaderPack
    },
    {
      deriveRuntimeControlPackSurface,
      deriveRuntimeControlPackReason,
      buildRuntimeControlPackSummary
    }
  );
}
