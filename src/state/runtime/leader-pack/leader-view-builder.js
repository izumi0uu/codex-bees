import {
  RUNTIME_PACK_DETAILS,
  buildRuntimePackLeaderEntries,
  buildRuntimePackLeaderMetadata,
  buildRuntimePackLeaderOverview,
  buildRuntimePackLeaderSurfaces,
  buildRuntimePackCliExpansionEntry,
  buildRuntimePackCommandExpansionEntry,
  buildRuntimePackExpansion,
  attachRuntimePackSurfaces,
  buildRuntimePackCounts,
  normalizeRuntimePackDetail
} from '../../../state/runtime/pack-detail/index.js';

export function buildRuntimeLeaderPackView(
  input,
  {
    leaderWorkspace,
    leaderQueue,
    runtimeDispatch,
    leaderAssignmentDispatchPack,
    leaderAssignmentDispatchBundle,
    leaderAssignmentLaunchPlan,
    runtimeCloseout
  },
  {
    deriveRuntimeLeaderPackSurface,
    deriveRuntimeLeaderPackReason,
    buildRuntimeLeaderPackSummary
  }
) {
  const detailLevel = normalizeRuntimePackDetail(input.detail);
  const workspace = leaderWorkspace(input);
  const queue = leaderQueue(input);
  const dispatch = runtimeDispatch();
  const assignmentDispatchPack = leaderAssignmentDispatchPack(input);
  const assignmentDispatchBundle = leaderAssignmentDispatchBundle(input);
  const assignmentLaunchPlan = leaderAssignmentLaunchPlan(input);
  const closeout = runtimeCloseout();
  const recommendedSurface = deriveRuntimeLeaderPackSurface({ workspace, queue, dispatch, assignmentDispatchPack, assignmentDispatchBundle, assignmentLaunchPlan, closeout });
  const recommendedReason = deriveRuntimeLeaderPackReason({ workspace, queue, dispatch, assignmentDispatchPack, assignmentDispatchBundle, assignmentLaunchPlan, closeout });
  const nextEntries = buildRuntimePackLeaderEntries(
    workspace,
    queue,
    dispatch,
    assignmentDispatchPack,
    assignmentDispatchBundle,
    assignmentLaunchPlan,
    closeout
  );
  const expansion = {
    full: buildRuntimePackCommandExpansionEntry('runtime:leader-pack', input, { detail: 'full' }),
    workspace: buildRuntimePackCommandExpansionEntry('leader:workspace', input, { workerId: undefined, workerIds: undefined, detail: undefined }),
    queue: buildRuntimePackCommandExpansionEntry('leader:queue', input, { workerId: undefined, workerIds: undefined, detail: undefined }),
    dispatch: buildRuntimePackCliExpansionEntry('runtime:dispatch'),
    assignmentDispatchPack: buildRuntimePackCommandExpansionEntry('leader:assignment-dispatch-pack', input),
    assignmentDispatchBundle: buildRuntimePackCommandExpansionEntry('leader:assignment-dispatch-bundle', input),
    assignmentLaunchPlan: buildRuntimePackCommandExpansionEntry('leader:assignment-launch-plan', input),
    closeout: buildRuntimePackCliExpansionEntry('runtime:closeout')
  };

  const pack = {
    kind: 'runtime_leader_pack',
    detailLevel,
    availableDetails: RUNTIME_PACK_DETAILS,
    filters: workspace?.filters ?? {
      status: input.status,
      topology: input.topology,
      owner: input.owner
    },
    recommendedSurface,
    recommendedReason,
    metadata: buildRuntimePackLeaderMetadata(
      workspace,
      queue,
      dispatch,
      assignmentDispatchPack,
      assignmentDispatchBundle,
      assignmentLaunchPlan,
      closeout
    ),
    counts: buildRuntimePackCounts(nextEntries),
    overview: buildRuntimePackLeaderOverview(
      workspace,
      queue,
      dispatch,
      assignmentDispatchPack,
      assignmentDispatchBundle,
      assignmentLaunchPlan,
      closeout
    ),
    next: nextEntries,
    expansion: buildRuntimePackExpansion(detailLevel, expansion),
    summary: buildRuntimeLeaderPackSummary(recommendedSurface, workspace, queue, assignmentDispatchPack, assignmentDispatchBundle, assignmentLaunchPlan)
  };

  return attachRuntimePackSurfaces(
    pack,
    detailLevel,
    buildRuntimePackLeaderSurfaces(
      workspace,
      queue,
      dispatch,
      assignmentDispatchPack,
      assignmentDispatchBundle,
      assignmentLaunchPlan,
      closeout
    )
  );
}

