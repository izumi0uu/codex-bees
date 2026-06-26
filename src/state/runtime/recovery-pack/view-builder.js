import {
  buildRuntimePackRecoveryEntries,
  buildRuntimePackRecoveryMetadata,
  buildRuntimePackRecoveryOverview,
  buildRuntimePackRecoverySurfaces,
  buildRuntimePackCounts
} from '../pack-detail/index.js';

export function buildRuntimeRecoveryPackView(
  {
    runtimeRecovery,
    runtimeHandoffs,
    runtimeFocus
  },
  {
    deriveRuntimeRecoveryPackSurface,
    deriveRuntimeRecoveryPackReason,
    buildRuntimeRecoveryPackSummary
  }
) {
  const recovery = runtimeRecovery();
  const handoffs = runtimeHandoffs();
  const focus = runtimeFocus();
  const recommendedSurface = deriveRuntimeRecoveryPackSurface({ recovery, handoffs, focus });
  const recommendedReason = deriveRuntimeRecoveryPackReason({ recovery, handoffs, focus });
  const nextEntries = buildRuntimePackRecoveryEntries(recovery, handoffs, focus);

  return {
    kind: 'runtime_recovery_pack',
    recommendedSurface,
    recommendedReason,
    metadata: buildRuntimePackRecoveryMetadata(recovery, handoffs, focus),
    counts: buildRuntimePackCounts(nextEntries),
    focus,
    overview: buildRuntimePackRecoveryOverview(recovery, handoffs),
    next: nextEntries,
    surfaces: buildRuntimePackRecoverySurfaces(recovery, handoffs, focus),
    summary: buildRuntimeRecoveryPackSummary(recommendedSurface, recovery, focus)
  };
}

