import {
  RUNTIME_PACK_DETAILS,
  buildRuntimePackCliExpansionEntry,
  buildRuntimePackCommandExpansionEntry,
  buildRuntimePackExpansion,
  buildRuntimePackSummaryEntries,
  buildRuntimePackSummaryMetadata,
  buildRuntimePackSummaryOverview,
  buildRuntimePackSummarySurfaces,
  attachRuntimePackSurfaces,
  buildRuntimePackCounts,
  normalizeRuntimePackDetail
} from './state-runtime-pack-detail.js';

export function buildRuntimeSummaryPackView(
  input,
  {
    runtimeDashboard,
    runtimeAlerts,
    runtimeFocus,
    runtimeHandoffs,
    runtimeRecovery,
    runtimeCloseout,
    leaderAssignmentDispatchBundle,
    leaderAssignmentLaunchPlan
  },
  {
    deriveRuntimeSummaryPackSurface,
    deriveRuntimeSummaryPackReason,
    buildRuntimeSummaryPackSummary
  }
) {
  const detailLevel = normalizeRuntimePackDetail(input.detail);
  const dashboard = runtimeDashboard();
  const alerts = runtimeAlerts();
  const focus = runtimeFocus();
  const handoffs = runtimeHandoffs();
  const recovery = runtimeRecovery();
  const closeout = runtimeCloseout();
  const assignmentDispatchBundle = leaderAssignmentDispatchBundle(input);
  const assignmentLaunchPlan = leaderAssignmentLaunchPlan(input);
  const recommendedSurface = deriveRuntimeSummaryPackSurface({ focus, recovery, closeout, handoffs, dashboard });
  const recommendedReason = deriveRuntimeSummaryPackReason({ focus, recovery, closeout, handoffs, dashboard });
  const nextEntries = buildRuntimePackSummaryEntries(
    focus,
    handoffs,
    recovery,
    closeout,
    assignmentDispatchBundle,
    assignmentLaunchPlan
  );
  const expansion = {
    full: buildRuntimePackCommandExpansionEntry('runtime:summary-pack', input, { detail: 'full' }),
    dashboard: buildRuntimePackCliExpansionEntry('runtime:dashboard'),
    alerts: buildRuntimePackCliExpansionEntry('runtime:alerts'),
    handoffs: buildRuntimePackCliExpansionEntry('runtime:handoffs'),
    recovery: buildRuntimePackCliExpansionEntry('runtime:recovery'),
    closeout: buildRuntimePackCliExpansionEntry('runtime:closeout'),
    assignmentDispatchBundle: buildRuntimePackCommandExpansionEntry('leader:assignment-dispatch-bundle', input),
    assignmentLaunchPlan: buildRuntimePackCommandExpansionEntry('leader:assignment-launch-plan', input)
  };

  const pack = {
    kind: 'runtime_summary_pack',
    detailLevel,
    availableDetails: RUNTIME_PACK_DETAILS,
    recommendedSurface,
    recommendedReason,
    metadata: buildRuntimePackSummaryMetadata(
      focus,
      recovery,
      closeout,
      assignmentDispatchBundle,
      assignmentLaunchPlan
    ),
    counts: buildRuntimePackCounts(nextEntries),
    focus,
    overview: buildRuntimePackSummaryOverview(
      dashboard,
      alerts,
      handoffs,
      recovery,
      closeout,
      assignmentDispatchBundle,
      assignmentLaunchPlan
    ),
    next: nextEntries,
    expansion: buildRuntimePackExpansion(detailLevel, expansion),
    summary: buildRuntimeSummaryPackSummary(recommendedSurface, focus)
  };

  return attachRuntimePackSurfaces(
    pack,
    detailLevel,
    buildRuntimePackSummarySurfaces(
      dashboard,
      alerts,
      handoffs,
      recovery,
      closeout,
      assignmentDispatchBundle,
      assignmentLaunchPlan
    )
  );
}

export function buildRuntimeSummaryPackViewFromSources(
  input,
  {
    runtimeDashboard,
    runtimeAlerts,
    runtimeFocus,
    runtimeHandoffs,
    runtimeRecovery,
    runtimeCloseout,
    leaderAssignmentDispatchBundle,
    leaderAssignmentLaunchPlan
  },
  {
    deriveRuntimeSummaryPackSurface,
    deriveRuntimeSummaryPackReason,
    buildRuntimeSummaryPackSummary
  }
) {
  return buildRuntimeSummaryPackView(
    input,
    {
      runtimeDashboard,
      runtimeAlerts,
      runtimeFocus,
      runtimeHandoffs,
      runtimeRecovery,
      runtimeCloseout,
      leaderAssignmentDispatchBundle,
      leaderAssignmentLaunchPlan
    },
    {
      deriveRuntimeSummaryPackSurface,
      deriveRuntimeSummaryPackReason,
      buildRuntimeSummaryPackSummary
    }
  );
}
