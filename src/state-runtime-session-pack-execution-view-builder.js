import {
  attachRuntimePackSurfaces,
  buildRuntimePackFallbackPurposeGuidance,
  buildRuntimePackCliExpansionEntry,
  buildRuntimePackCommandExpansionEntry,
  buildRuntimePackExpansion,
  buildRuntimePackFocusOverview,
  buildRuntimePackPresenceMetadata,
  countRuntimePackEntries,
  normalizeRuntimePackDetail
} from "./state-runtime-pack-detail.js";

export function buildRuntimeExecutionPackView(
  input,
  {
    runtimeFocus,
    runtimeDispatch,
    leaderAssignmentDispatchBundle,
    leaderAssignmentLaunchPlan,
    runtimeRoles,
    runtimeQueuePack
  },
  {
    deriveRuntimeExecutionPackSurface,
    deriveRuntimeExecutionPackReason,
    buildRuntimeExecutionPackSummary
  }
) {
  const detailLevel = normalizeRuntimePackDetail(input.detail);
  const focus = runtimeFocus();
  const dispatch = runtimeDispatch();
  const assignmentDispatchBundle = leaderAssignmentDispatchBundle(input);
  const assignmentLaunchPlan = leaderAssignmentLaunchPlan(input);
  const roles = runtimeRoles();
  const queuePack = runtimeQueuePack({ ...input, detail: detailLevel });
  const recommendedSurface = deriveRuntimeExecutionPackSurface({ focus, dispatch, assignmentDispatchBundle, assignmentLaunchPlan, roles, queuePack });
  const recommendedReason = deriveRuntimeExecutionPackReason({ focus, dispatch, assignmentDispatchBundle, assignmentLaunchPlan, roles, queuePack });
  const purposeGuidance = buildRuntimePackFallbackPurposeGuidance(
    queuePack?.next?.queue?.task ?? null,
    assignmentLaunchPlan?.next,
    assignmentDispatchBundle?.next,
    dispatch?.next,
    focus?.focus,
    roles?.next?.nextAction
  );
  const nextEntries = {
    focus: focus?.focus ?? null,
    dispatch: dispatch?.next ?? null,
    assignmentLaunch: assignmentDispatchBundle?.next ?? null,
    assignmentLaunchStep: assignmentLaunchPlan?.next ?? null,
    role: roles?.next ?? null,
    queue: queuePack?.next?.queue ?? null
  };
  const expansion = {
    full: buildRuntimePackCommandExpansionEntry("runtime:execution-pack", input, { detail: "full" }),
    focus: buildRuntimePackCliExpansionEntry("runtime:focus"),
    dispatch: buildRuntimePackCliExpansionEntry("runtime:dispatch"),
    assignmentDispatchBundle: buildRuntimePackCommandExpansionEntry("leader:assignment-dispatch-bundle", input),
    assignmentLaunchPlan: buildRuntimePackCommandExpansionEntry("leader:assignment-launch-plan", input),
    roles: buildRuntimePackCliExpansionEntry("runtime:roles"),
    queuePack: buildRuntimePackCommandExpansionEntry("runtime:queue-pack", input)
  };

  const pack = {
    kind: "runtime_execution_pack",
    detailLevel,
    availableDetails: ["compact", "full"],
    recommendedSurface,
    recommendedReason,
    purposeGuidance,
    metadata: buildRuntimePackPresenceMetadata({
      hasFocus: nextEntries.focus,
      hasDispatch: nextEntries.dispatch,
      hasAssignmentLaunch: nextEntries.assignmentLaunch,
      hasAssignmentLaunchStep: nextEntries.assignmentLaunchStep,
      hasRole: nextEntries.role,
      hasQueue: nextEntries.queue
    }),
    counts: {
      surfacedNextEntries: countRuntimePackEntries(nextEntries)
    },
    overview: {
      focus: buildRuntimePackFocusOverview(focus),
      dispatch: dispatch?.counts ?? null,
      assignmentDispatchBundle: assignmentDispatchBundle?.counts ?? null,
      assignmentLaunchPlan: assignmentLaunchPlan?.counts ?? null,
      roles: roles?.counts ?? null,
      queue: queuePack?.overview?.queue ?? null
    },
    next: nextEntries,
    expansion: buildRuntimePackExpansion(detailLevel, expansion),
    summary: buildRuntimeExecutionPackSummary(recommendedSurface, focus, dispatch, assignmentDispatchBundle, assignmentLaunchPlan, roles, queuePack)
  };

  return attachRuntimePackSurfaces(pack, detailLevel, {
    focus,
    dispatch,
    assignmentDispatchBundle,
    assignmentLaunchPlan,
    roles,
    queuePack
  });
}

export function buildRuntimeExecutionPackViewFromSources(
  input,
  {
    runtimeFocus,
    runtimeDispatch,
    leaderAssignmentDispatchBundle,
    leaderAssignmentLaunchPlan,
    runtimeRoles,
    runtimeQueuePack
  },
  {
    deriveRuntimeExecutionPackSurface,
    deriveRuntimeExecutionPackReason,
    buildRuntimeExecutionPackSummary,
    buildRuntimeExecutionPackView
  }
) {
  return buildRuntimeExecutionPackView(
    input,
    {
      runtimeFocus,
      runtimeDispatch,
      leaderAssignmentDispatchBundle,
      leaderAssignmentLaunchPlan,
      runtimeRoles,
      runtimeQueuePack
    },
    {
      deriveRuntimeExecutionPackSurface,
      deriveRuntimeExecutionPackReason,
      buildRuntimeExecutionPackSummary
    }
  );
}
