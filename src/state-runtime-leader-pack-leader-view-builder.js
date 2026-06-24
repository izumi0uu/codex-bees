import {
  buildRuntimePackCommand,
  buildRuntimePackExpansion,
  buildRuntimePackExpansionEntry,
  buildRuntimePackPresenceMetadata,
  attachRuntimePackSurfaces,
  countRuntimePackEntries,
  normalizeRuntimePackDetail
} from './state-runtime-pack-detail.js';

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
  const nextEntries = {
    workspace: workspace?.focus ?? null,
    queue: queue?.next ?? null,
    dispatch: dispatch?.next ?? null,
    assignmentDispatch: assignmentDispatchPack?.next ?? null,
    assignmentLaunch: assignmentDispatchBundle?.next ?? null,
    assignmentLaunchStep: assignmentLaunchPlan?.next ?? null,
    closeout: closeout?.next ?? null
  };
  const expansion = {
    full: buildRuntimePackExpansionEntry('runtime:leader-pack', buildRuntimePackCommand('runtime:leader-pack', input, { detail: 'full' })),
    workspace: buildRuntimePackExpansionEntry(
      'leader:workspace',
      buildRuntimePackCommand('leader:workspace', input, { workerId: undefined, workerIds: undefined, detail: undefined })
    ),
    queue: buildRuntimePackExpansionEntry(
      'leader:queue',
      buildRuntimePackCommand('leader:queue', input, { workerId: undefined, workerIds: undefined, detail: undefined })
    ),
    dispatch: buildRuntimePackExpansionEntry('runtime:dispatch', 'node ./src/index.js runtime:dispatch'),
    assignmentDispatchPack: buildRuntimePackExpansionEntry(
      'leader:assignment-dispatch-pack',
      buildRuntimePackCommand('leader:assignment-dispatch-pack', input)
    ),
    assignmentDispatchBundle: buildRuntimePackExpansionEntry(
      'leader:assignment-dispatch-bundle',
      buildRuntimePackCommand('leader:assignment-dispatch-bundle', input)
    ),
    assignmentLaunchPlan: buildRuntimePackExpansionEntry(
      'leader:assignment-launch-plan',
      buildRuntimePackCommand('leader:assignment-launch-plan', input)
    ),
    closeout: buildRuntimePackExpansionEntry('runtime:closeout', 'node ./src/index.js runtime:closeout')
  };

  const pack = {
    kind: 'runtime_leader_pack',
    detailLevel,
    availableDetails: ['compact', 'full'],
    filters: workspace?.filters ?? {
      status: input.status,
      topology: input.topology,
      owner: input.owner
    },
    recommendedSurface,
    recommendedReason,
    metadata: buildRuntimePackPresenceMetadata({
      hasWorkspace: workspace?.focus,
      hasQueue: queue?.next,
      hasDispatch: dispatch?.next,
      hasAssignmentDispatch: assignmentDispatchPack?.next,
      hasAssignmentLaunch: assignmentDispatchBundle?.next,
      hasAssignmentLaunchPlan: assignmentLaunchPlan?.next,
      hasCloseout: closeout?.next
    }),
    counts: {
      surfacedNextEntries: countRuntimePackEntries(nextEntries)
    },
    overview: {
      workspace: workspace?.counts ?? null,
      queue: queue?.counts ?? null,
      dispatch: dispatch?.counts ?? null,
      assignmentDispatchPack: assignmentDispatchPack?.counts ?? null,
      assignmentDispatchBundle: assignmentDispatchBundle?.counts ?? null,
      assignmentLaunchPlan: assignmentLaunchPlan?.counts ?? null,
      closeout: closeout?.counts ?? null
    },
    next: nextEntries,
    expansion: buildRuntimePackExpansion(detailLevel, expansion),
    summary: buildRuntimeLeaderPackSummary(recommendedSurface, workspace, queue, assignmentDispatchPack, assignmentDispatchBundle, assignmentLaunchPlan)
  };

  return attachRuntimePackSurfaces(pack, detailLevel, {
    workspace,
    queue,
    dispatch,
    assignmentDispatchPack,
    assignmentDispatchBundle,
    assignmentLaunchPlan,
    closeout
  });
}

export function buildRuntimeLeaderPackViewFromSources(
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
    buildRuntimeLeaderPackSummary,
    buildRuntimeLeaderPackView
  }
) {
  return buildRuntimeLeaderPackView(
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
  );
}
