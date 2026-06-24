import {
  RUNTIME_PACK_DETAILS,
  buildRuntimePackWorkspaceEntries,
  buildRuntimePackWorkspaceMetadata,
  buildRuntimePackWorkspaceOverview,
  buildRuntimePackWorkspaceSurfaces,
  buildRuntimePackCliExpansionEntry,
  buildRuntimePackCommandExpansionEntry,
  buildRuntimePackExpansion,
  attachRuntimePackSurfaces,
  buildRuntimePackCounts,
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
  const nextEntries = buildRuntimePackWorkspaceEntries(
    dashboard,
    dispatch,
    assignmentDispatchBundle,
    assignmentLaunchPlan,
    review,
    recovery
  );
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
    availableDetails: RUNTIME_PACK_DETAILS,
    recommendedSurface,
    recommendedReason,
    metadata: buildRuntimePackWorkspaceMetadata(
      dashboard,
      dispatch,
      assignmentDispatchBundle,
      assignmentLaunchPlan,
      review,
      recovery
    ),
    counts: buildRuntimePackCounts(nextEntries),
    overview: buildRuntimePackWorkspaceOverview(
      dashboard,
      dispatch,
      assignmentDispatchBundle,
      assignmentLaunchPlan,
      review,
      recovery
    ),
    next: nextEntries,
    expansion: buildRuntimePackExpansion(detailLevel, expansion),
    summary: buildRuntimeWorkspacePackSummary(recommendedSurface, dashboard, dispatch, assignmentDispatchBundle, assignmentLaunchPlan, review, recovery)
  };

  return attachRuntimePackSurfaces(
    pack,
    detailLevel,
    buildRuntimePackWorkspaceSurfaces(
      dashboard,
      dispatch,
      assignmentDispatchBundle,
      assignmentLaunchPlan,
      review,
      recovery
    )
  );
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
    buildRuntimeWorkspacePackSummary
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
