import { buildRuntimePackCommand, buildRuntimePackExpansionEntry, normalizeRuntimePackDetail } from './state-runtime-pack-detail.js';

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
    full: buildRuntimePackExpansionEntry('runtime:workspace-pack', buildRuntimePackCommand('runtime:workspace-pack', input, { detail: 'full' })),
    dashboard: buildRuntimePackExpansionEntry('runtime:dashboard', 'node ./src/index.js runtime:dashboard'),
    dispatch: buildRuntimePackExpansionEntry('runtime:dispatch', 'node ./src/index.js runtime:dispatch'),
    assignmentDispatchBundle: buildRuntimePackExpansionEntry(
      'leader:assignment-dispatch-bundle',
      buildRuntimePackCommand('leader:assignment-dispatch-bundle', input)
    ),
    assignmentLaunchPlan: buildRuntimePackExpansionEntry(
      'leader:assignment-launch-plan',
      buildRuntimePackCommand('leader:assignment-launch-plan', input)
    ),
    review: buildRuntimePackExpansionEntry('runtime:review', 'node ./src/index.js runtime:review'),
    recovery: buildRuntimePackExpansionEntry('runtime:recovery', 'node ./src/index.js runtime:recovery')
  };

  const pack = {
    kind: 'runtime_workspace_pack',
    detailLevel,
    availableDetails: ['compact', 'full'],
    recommendedSurface,
    recommendedReason,
    metadata: {
      hasDashboard: Boolean(dashboard?.leader?.queue?.next),
      hasDispatch: Boolean(dispatch?.next),
      hasAssignmentLaunch: Boolean(assignmentDispatchBundle?.next),
      hasAssignmentLaunchPlan: Boolean(assignmentLaunchPlan?.next),
      hasReview: Boolean(review?.next),
      hasRecovery: Boolean(recovery?.next)
    },
    counts: {
      surfacedNextEntries: Object.values(nextEntries).filter(Boolean).length
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
    expansion: detailLevel === 'compact' ? expansion : null,
    summary: buildRuntimeWorkspacePackSummary(recommendedSurface, dashboard, dispatch, assignmentDispatchBundle, assignmentLaunchPlan, review, recovery)
  };

  if (detailLevel === 'full') {
    pack.surfaces = {
      dashboard,
      dispatch,
      assignmentDispatchBundle,
      assignmentLaunchPlan,
      review,
      recovery
    };
  }

  return pack;
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
