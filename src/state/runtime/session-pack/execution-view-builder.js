import {
  RUNTIME_PACK_DETAILS,
  attachRuntimePackSurfaces,
  buildRuntimePackExecutionEntries,
  buildRuntimePackExecutionMetadata,
  buildRuntimePackExecutionOverview,
  buildRuntimePackExecutionSurfaces,
  buildRuntimePackFallbackPurposeGuidance,
  buildRuntimePackCliExpansionEntry,
  buildRuntimePackCommandExpansionEntry,
  buildRuntimePackExpansion,
  buildRuntimePackCounts,
  normalizeRuntimePackDetail
} from "../../../state/runtime/pack-detail/index.js";

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
  const nextEntries = buildRuntimePackExecutionEntries(
    focus,
    dispatch,
    assignmentDispatchBundle,
    assignmentLaunchPlan,
    roles,
    queuePack
  );
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
    availableDetails: RUNTIME_PACK_DETAILS,
    recommendedSurface,
    recommendedReason,
    purposeGuidance,
    metadata: buildRuntimePackExecutionMetadata(nextEntries),
    counts: buildRuntimePackCounts(nextEntries),
    overview: buildRuntimePackExecutionOverview(
      focus,
      dispatch,
      assignmentDispatchBundle,
      assignmentLaunchPlan,
      roles,
      queuePack
    ),
    next: nextEntries,
    expansion: buildRuntimePackExpansion(detailLevel, expansion),
    summary: buildRuntimeExecutionPackSummary(recommendedSurface, focus, dispatch, assignmentDispatchBundle, assignmentLaunchPlan, roles, queuePack)
  };

  return attachRuntimePackSurfaces(
    pack,
    detailLevel,
    buildRuntimePackExecutionSurfaces(
      focus,
      dispatch,
      assignmentDispatchBundle,
      assignmentLaunchPlan,
      roles,
      queuePack
    )
  );
}

