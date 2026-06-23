import {
  buildRuntimePackCommand,
  buildRuntimePackExpansionEntry,
  buildRuntimePackPresenceMetadata,
  countRuntimePackEntries,
  normalizeRuntimePackDetail
} from './state-runtime-pack-detail.js';

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
  const nextEntries = {
    dispatch: dispatch?.next ?? null,
    assignmentDispatch: assignmentDispatchPack?.next ?? null,
    assignmentLaunch: assignmentDispatchBundle?.next ?? null,
    assignmentLaunchStep: assignmentLaunchPlan?.next ?? null,
    role: roles?.next ?? null,
    handoff: handoffs?.next ?? null
  };
  const expansion = {
    full: buildRuntimePackExpansionEntry('runtime:dispatch-pack', buildRuntimePackCommand('runtime:dispatch-pack', input, { detail: 'full' })),
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
    roles: buildRuntimePackExpansionEntry('runtime:roles', 'node ./src/index.js runtime:roles'),
    handoffs: buildRuntimePackExpansionEntry('runtime:handoffs', 'node ./src/index.js runtime:handoffs')
  };

  const pack = {
    kind: 'runtime_dispatch_pack',
    detailLevel,
    availableDetails: ['compact', 'full'],
    recommendedSurface,
    recommendedReason,
    metadata: buildRuntimePackPresenceMetadata({
      hasDispatch: dispatch?.next,
      hasAssignmentDispatch: assignmentDispatchPack?.next,
      hasAssignmentLaunch: assignmentDispatchBundle?.next,
      hasRole: roles?.next,
      hasHandoff: handoffs?.next
    }),
    counts: {
      surfacedNextEntries: countRuntimePackEntries(nextEntries)
    },
    overview: {
      dispatch: dispatch?.counts ?? null,
      assignmentDispatchPack: assignmentDispatchPack?.counts ?? null,
      assignmentDispatchBundle: assignmentDispatchBundle?.counts ?? null,
      assignmentLaunchPlan: assignmentLaunchPlan?.counts ?? null,
      roles: roles?.counts ?? null,
      handoffs: handoffs?.counts ?? null
    },
    next: nextEntries,
    expansion: detailLevel === 'compact' ? expansion : null,
    summary: buildRuntimeDispatchPackSummary(recommendedSurface, dispatch, assignmentDispatchPack, assignmentDispatchBundle, assignmentLaunchPlan, handoffs, roles)
  };

  if (detailLevel === 'full') {
    pack.surfaces = {
      dispatch,
      assignmentDispatchPack,
      assignmentDispatchBundle,
      assignmentLaunchPlan,
      roles,
      handoffs
    };
  }

  return pack;
}

export function buildRuntimeDispatchPackViewFromSources(
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
    buildRuntimeDispatchPackSummary,
    buildRuntimeDispatchPackView
  }
) {
  return buildRuntimeDispatchPackView(
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
  );
}
