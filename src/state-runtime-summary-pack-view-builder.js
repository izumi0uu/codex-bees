import {
  buildRuntimePackCommand,
  buildRuntimePackExpansion,
  buildRuntimePackExpansionEntry,
  buildRuntimePackPresenceMetadata,
  attachRuntimePackSurfaces,
  countRuntimePackEntries,
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
  const nextEntries = {
    focus: focus.focus ?? null,
    handoff: handoffs.next ?? null,
    recovery: recovery.next ?? null,
    closeout: closeout.next ?? null,
    assignmentLaunch: assignmentDispatchBundle?.next ?? null,
    assignmentLaunchStep: assignmentLaunchPlan?.next ?? null
  };
  const expansion = {
    full: buildRuntimePackExpansionEntry('runtime:summary-pack', buildRuntimePackCommand('runtime:summary-pack', input, { detail: 'full' })),
    dashboard: buildRuntimePackExpansionEntry('runtime:dashboard', 'node ./src/index.js runtime:dashboard'),
    alerts: buildRuntimePackExpansionEntry('runtime:alerts', 'node ./src/index.js runtime:alerts'),
    handoffs: buildRuntimePackExpansionEntry('runtime:handoffs', 'node ./src/index.js runtime:handoffs'),
    recovery: buildRuntimePackExpansionEntry('runtime:recovery', 'node ./src/index.js runtime:recovery'),
    closeout: buildRuntimePackExpansionEntry('runtime:closeout', 'node ./src/index.js runtime:closeout'),
    assignmentDispatchBundle: buildRuntimePackExpansionEntry(
      'leader:assignment-dispatch-bundle',
      buildRuntimePackCommand('leader:assignment-dispatch-bundle', input)
    ),
    assignmentLaunchPlan: buildRuntimePackExpansionEntry(
      'leader:assignment-launch-plan',
      buildRuntimePackCommand('leader:assignment-launch-plan', input)
    )
  };

  const pack = {
    kind: 'runtime_summary_pack',
    detailLevel,
    availableDetails: ['compact', 'full'],
    recommendedSurface,
    recommendedReason,
    metadata: buildRuntimePackPresenceMetadata({
      hasFocus: focus.focus,
      hasRecovery: recovery.next,
      hasCloseout: closeout.next,
      hasAssignmentLaunch: assignmentDispatchBundle?.next,
      hasAssignmentLaunchPlan: assignmentLaunchPlan?.next
    }),
    counts: {
      surfacedNextEntries: countRuntimePackEntries(nextEntries)
    },
    focus,
    overview: {
      dashboard: dashboard.counts,
      alerts: alerts.counts,
      handoffs: handoffs.counts,
      recovery: recovery.counts,
      closeout: closeout.counts,
      assignmentDispatchBundle: assignmentDispatchBundle?.counts ?? null,
      assignmentLaunchPlan: assignmentLaunchPlan?.counts ?? null
    },
    next: nextEntries,
    expansion: buildRuntimePackExpansion(detailLevel, expansion),
    summary: buildRuntimeSummaryPackSummary(recommendedSurface, focus)
  };

  return attachRuntimePackSurfaces(pack, detailLevel, {
    dashboard,
    alerts,
    handoffs,
    recovery,
    closeout,
    assignmentDispatchBundle,
    assignmentLaunchPlan
  });
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
    buildRuntimeSummaryPackSummary,
    buildRuntimeSummaryPackView
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
