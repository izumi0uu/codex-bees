import {
  RUNTIME_PACK_DETAILS,
  buildRuntimePackDispatchEntries,
  buildRuntimePackDispatchMetadata,
  buildRuntimePackDispatchOverview,
  buildRuntimePackDispatchSurfaces,
  buildRuntimePackCliExpansionEntry,
  buildRuntimePackCommandExpansionEntry,
  buildRuntimePackExpansion,
  attachRuntimePackSurfaces,
  buildRuntimePackCounts,
  normalizeRuntimePackDetail
} from '../../../state/runtime/pack-detail/index.js';

export function buildRuntimeDispatchPackView(
  input,
  {
    runtimeDispatch,
    leaderAssignmentDispatchPack,
    leaderAssignmentDispatchBundle,
    leaderAssignmentLaunchPlan,
    runtimeRoles,
    runtimeHandoffs
  },
  {
    deriveRuntimeDispatchPackSurface,
    deriveRuntimeDispatchPackReason,
    buildRuntimeDispatchPackSummary
  }
) {
  const detailLevel = normalizeRuntimePackDetail(input.detail);
  const dispatch = runtimeDispatch();
  const assignmentDispatchPack = leaderAssignmentDispatchPack(input);
  const assignmentDispatchBundle = leaderAssignmentDispatchBundle(input);
  const assignmentLaunchPlan = leaderAssignmentLaunchPlan(input);
  const roles = runtimeRoles();
  const handoffs = runtimeHandoffs();
  const recommendedSurface = deriveRuntimeDispatchPackSurface({ dispatch, assignmentDispatchPack, assignmentDispatchBundle, assignmentLaunchPlan, roles, handoffs });
  const recommendedReason = deriveRuntimeDispatchPackReason({ dispatch, assignmentDispatchPack, assignmentDispatchBundle, assignmentLaunchPlan, roles, handoffs });
  const nextEntries = buildRuntimePackDispatchEntries(
    dispatch,
    assignmentDispatchPack,
    assignmentDispatchBundle,
    assignmentLaunchPlan,
    roles,
    handoffs
  );
  const expansion = {
    full: buildRuntimePackCommandExpansionEntry('runtime:dispatch-pack', input, { detail: 'full' }),
    dispatch: buildRuntimePackCliExpansionEntry('runtime:dispatch'),
    assignmentDispatchPack: buildRuntimePackCommandExpansionEntry('leader:assignment-dispatch-pack', input),
    assignmentDispatchBundle: buildRuntimePackCommandExpansionEntry('leader:assignment-dispatch-bundle', input),
    assignmentLaunchPlan: buildRuntimePackCommandExpansionEntry('leader:assignment-launch-plan', input),
    roles: buildRuntimePackCliExpansionEntry('runtime:roles'),
    handoffs: buildRuntimePackCliExpansionEntry('runtime:handoffs')
  };

  const pack = {
    kind: 'runtime_dispatch_pack',
    detailLevel,
    availableDetails: RUNTIME_PACK_DETAILS,
    recommendedSurface,
    recommendedReason,
    metadata: buildRuntimePackDispatchMetadata(
      dispatch,
      assignmentDispatchPack,
      assignmentDispatchBundle,
      roles,
      handoffs
    ),
    counts: buildRuntimePackCounts(nextEntries),
    overview: buildRuntimePackDispatchOverview(
      dispatch,
      assignmentDispatchPack,
      assignmentDispatchBundle,
      assignmentLaunchPlan,
      roles,
      handoffs
    ),
    next: nextEntries,
    expansion: buildRuntimePackExpansion(detailLevel, expansion),
    summary: buildRuntimeDispatchPackSummary(recommendedSurface, dispatch, assignmentDispatchPack, assignmentDispatchBundle, assignmentLaunchPlan, handoffs, roles)
  };

  return attachRuntimePackSurfaces(
    pack,
    detailLevel,
    buildRuntimePackDispatchSurfaces(
      dispatch,
      assignmentDispatchPack,
      assignmentDispatchBundle,
      assignmentLaunchPlan,
      roles,
      handoffs
    )
  );
}

