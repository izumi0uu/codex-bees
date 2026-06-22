export function deriveRuntimeRecoveryPackSurface({ recovery, handoffs, focus }) {
  if ((recovery?.counts?.totalEntries ?? 0) > 0) {
    return "runtime:recovery";
  }
  if ((handoffs?.counts?.blockedRecoveries ?? 0) > 0 || (handoffs?.counts?.ownerClaims ?? 0) > 0) {
    return "runtime:handoffs";
  }
  if (focus?.focus?.type === "blocked_task") {
    return "runtime:focus";
  }
  return "runtime:recovery";
}
export function deriveRuntimeRecoveryPackReason({ recovery, handoffs, focus }) {
  if (recovery?.next?.recoveryType === "blocked_recovery") {
    return "blocked_recovery_priority";
  }
  if (recovery?.next?.recoveryType === "changes_requested") {
    return "changes_requested_priority";
  }
  if (recovery?.next?.recoveryType === "released_repickup") {
    return "released_repickup_priority";
  }
  if ((handoffs?.counts?.blockedRecoveries ?? 0) > 0) {
    return "blocked_recovery_handoff_priority";
  }
  if ((handoffs?.counts?.ownerClaims ?? 0) > 0) {
    return "owner_claim_handoff_priority";
  }
  if (focus?.focus?.type === "blocked_task") {
    return "blocked_focus_priority";
  }
  return "default_recovery_priority";
}
export function buildRuntimeRecoveryPackSummary(recommendedSurface, recovery, focus) {
  const detail =
    recovery?.summary ??
    focus?.summary ??
    "Runtime recovery pack has no current recovery detail.";
  return `Runtime recovery pack recommends ${recommendedSurface} next. ${detail}`;
}
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
    kind: "runtime_recovery_pack",
    recommendedSurface,
    recommendedReason,
    metadata: {
      hasRecovery: Boolean(recovery?.next),
      hasHandoff: Boolean(handoffs?.next),
      hasFocus: Boolean(focus?.focus)
    },
    counts: {
      surfacedNextEntries: Object.values(nextEntries).filter(Boolean).length
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
