import { buildPurposeGuidanceForTaskLike } from "./state-lane-purpose.js";
import {
  buildRuntimePackCommand,
  buildRuntimePackExpansionEntry,
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
  const purposeGuidance =
    assignmentLaunchPlan?.next?.purposeGuidance ??
    assignmentDispatchBundle?.next?.purposeGuidance ??
    dispatch?.next?.purposeGuidance ??
    focus?.focus?.purposeGuidance ??
    roles?.next?.nextAction?.purposeGuidance ??
    buildPurposeGuidanceForTaskLike(queuePack?.next?.queue?.task ?? null);
  const nextEntries = {
    focus: focus?.focus ?? null,
    dispatch: dispatch?.next ?? null,
    assignmentLaunch: assignmentDispatchBundle?.next ?? null,
    assignmentLaunchStep: assignmentLaunchPlan?.next ?? null,
    role: roles?.next ?? null,
    queue: queuePack?.next?.queue ?? null
  };
  const expansion = {
    full: buildRuntimePackExpansionEntry("runtime:execution-pack", buildRuntimePackCommand("runtime:execution-pack", input, { detail: "full" })),
    focus: buildRuntimePackExpansionEntry("runtime:focus", "node ./src/index.js runtime:focus"),
    dispatch: buildRuntimePackExpansionEntry("runtime:dispatch", "node ./src/index.js runtime:dispatch"),
    assignmentDispatchBundle: buildRuntimePackExpansionEntry(
      "leader:assignment-dispatch-bundle",
      buildRuntimePackCommand("leader:assignment-dispatch-bundle", input)
    ),
    assignmentLaunchPlan: buildRuntimePackExpansionEntry(
      "leader:assignment-launch-plan",
      buildRuntimePackCommand("leader:assignment-launch-plan", input)
    ),
    roles: buildRuntimePackExpansionEntry("runtime:roles", "node ./src/index.js runtime:roles"),
    queuePack: buildRuntimePackExpansionEntry("runtime:queue-pack", buildRuntimePackCommand("runtime:queue-pack", input))
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
    expansion: detailLevel === "compact" ? expansion : null,
    summary: buildRuntimeExecutionPackSummary(recommendedSurface, focus, dispatch, assignmentDispatchBundle, assignmentLaunchPlan, roles, queuePack)
  };

  if (detailLevel === "full") {
    pack.surfaces = {
      focus,
      dispatch,
      assignmentDispatchBundle,
      assignmentLaunchPlan,
      roles,
      queuePack
    };
  }

  return pack;
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
