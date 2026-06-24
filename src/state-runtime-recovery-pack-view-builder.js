import {
  buildRuntimePackPresenceMetadata,
  countRuntimePackEntries
} from './state-runtime-pack-detail.js';

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
  const nextEntries = {
    recovery: recovery?.next ?? null,
    handoff: handoffs?.next ?? null,
    focus: focus?.focus ?? null
  };

  return {
    kind: 'runtime_recovery_pack',
    recommendedSurface,
    recommendedReason,
    metadata: buildRuntimePackPresenceMetadata({
      hasRecovery: recovery?.next,
      hasHandoff: handoffs?.next,
      hasFocus: focus?.focus
    }),
    counts: {
      surfacedNextEntries: countRuntimePackEntries(nextEntries)
    },
    focus,
    overview: {
      recovery: recovery?.counts ?? null,
      handoffs: handoffs?.counts ?? null
    },
    next: nextEntries,
    surfaces: {
      recovery,
      handoffs,
      focus
    },
    summary: buildRuntimeRecoveryPackSummary(recommendedSurface, recovery, focus)
  };
}

export function buildRuntimeRecoveryPackViewFromSources(
  {
    runtimeRecovery,
    runtimeHandoffs,
    runtimeFocus
  },
  {
    deriveRuntimeRecoveryPackSurface,
    deriveRuntimeRecoveryPackReason,
    buildRuntimeRecoveryPackSummary,
    buildRuntimeRecoveryPackView
  }
) {
  return buildRuntimeRecoveryPackView(
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
  );
}
