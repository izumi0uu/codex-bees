import {
  buildRuntimePackCliExpansionEntry,
  buildRuntimePackCommandExpansionEntry,
  buildRuntimePackExpansion,
  buildRuntimePackPresenceMetadata,
  attachRuntimePackSurfaces,
  countRuntimePackEntries,
  normalizeRuntimePackDetail
} from './state-runtime-pack-detail.js';

export function buildRuntimeWorkspacePackView(
  input,
  {
    runtimeDashboard,
    runtimeDispatch,
    leaderAssignmentDispatchBundle,
    leaderAssignmentLaunchPlan,
    runtimeReview,
    runtimeRecovery
  },
  {
    deriveRuntimeWorkspacePackSurface,
    deriveRuntimeWorkspacePackReason,
    buildRuntimeWorkspacePackSummary
  }
) {
  const detailLevel = normalizeRuntimePackDetail(input.detail);
  const dashboard = runtimeDashboard();
  const dispatch = runtimeDispatch();
  const assignmentDispatchBundle = leaderAssignmentDispatchBundle(input);
  const assignmentLaunchPlan = leaderAssignmentLaunchPlan(input);
  const review = runtimeReview();
  const recovery = runtimeRecovery();
  const recommendedSurface = deriveRuntimeWorkspacePackSurface({ dashboard, dispatch, assignmentDispatchBundle, assignmentLaunchPlan, review, recovery });
  const recommendedReason = deriveRuntimeWorkspacePackReason({ dashboard, dispatch, assignmentDispatchBundle, assignmentLaunchPlan, review, recovery });
  const nextEntries = {
    dashboard: dashboard?.leader?.queue?.next ?? null,
    dispatch: dispatch?.next ?? null,
    assignmentLaunch: assignmentDispatchBundle?.next ?? null,
    assignmentLaunchStep: assignmentLaunchPlan?.next ?? null,
    review: review?.next ?? null,
    recovery: recovery?.next ?? null
  };
  const expansion = {
    full: buildRuntimePackCommandExpansionEntry('runtime:workspace-pack', input, { detail: 'full' }),
    dashboard: buildRuntimePackCliExpansionEntry('runtime:dashboard'),
    dispatch: buildRuntimePackCliExpansionEntry('runtime:dispatch'),
    assignmentDispatchBundle: buildRuntimePackCommandExpansionEntry('leader:assignment-dispatch-bundle', input),
    assignmentLaunchPlan: buildRuntimePackCommandExpansionEntry('leader:assignment-launch-plan', input),
    review: buildRuntimePackCliExpansionEntry('runtime:review'),
    recovery: buildRuntimePackCliExpansionEntry('runtime:recovery')
  };

  const pack = {
    kind: 'runtime_workspace_pack',
    detailLevel,
    availableDetails: ['compact', 'full'],
    recommendedSurface,
    recommendedReason,
    metadata: buildRuntimePackPresenceMetadata({
      hasDashboard: dashboard?.leader?.queue?.next,
      hasDispatch: dispatch?.next,
      hasAssignmentLaunch: assignmentDispatchBundle?.next,
      hasAssignmentLaunchPlan: assignmentLaunchPlan?.next,
      hasReview: review?.next,
      hasRecovery: recovery?.next
    }),
    counts: {
      surfacedNextEntries: countRuntimePackEntries(nextEntries)
    },
    overview: {
      dashboard: dashboard?.counts ?? null,
      dispatch: dispatch?.counts ?? null,
      assignmentDispatchBundle: assignmentDispatchBundle?.counts ?? null,
      assignmentLaunchPlan: assignmentLaunchPlan?.counts ?? null,
      review: review?.counts ?? null,
      recovery: recovery?.counts ?? null
    },
    next: nextEntries,
    expansion: buildRuntimePackExpansion(detailLevel, expansion),
    summary: buildRuntimeWorkspacePackSummary(recommendedSurface, dashboard, dispatch, assignmentDispatchBundle, assignmentLaunchPlan, review, recovery)
  };

  return attachRuntimePackSurfaces(pack, detailLevel, {
    dashboard,
    dispatch,
    assignmentDispatchBundle,
    assignmentLaunchPlan,
    review,
    recovery
  });
}

export function buildRuntimeWorkspacePackViewFromSources(
  input,
  {
    runtimeDashboard,
    runtimeDispatch,
    leaderAssignmentDispatchBundle,
    leaderAssignmentLaunchPlan,
    runtimeReview,
    runtimeRecovery
  },
  {
    deriveRuntimeWorkspacePackSurface,
    deriveRuntimeWorkspacePackReason,
    buildRuntimeWorkspacePackSummary,
    buildRuntimeWorkspacePackView
  }
) {
  return buildRuntimeWorkspacePackView(
    input,
    {
      runtimeDashboard,
      runtimeDispatch,
      leaderAssignmentDispatchBundle,
      leaderAssignmentLaunchPlan,
      runtimeReview,
      runtimeRecovery
    },
    {
      deriveRuntimeWorkspacePackSurface,
      deriveRuntimeWorkspacePackReason,
      buildRuntimeWorkspacePackSummary
    }
  );
}
