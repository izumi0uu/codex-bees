import {
  buildRuntimePackPresenceMetadata
} from "./core.js";

export function buildRuntimePackLeaderEntries(
  workspace,
  queue,
  dispatch,
  assignmentDispatchPack,
  assignmentDispatchBundle,
  assignmentLaunchPlan,
  closeout
) {
  return {
    workspace: workspace?.focus ?? null,
    queue: queue?.next ?? null,
    dispatch: dispatch?.next ?? null,
    assignmentDispatch: assignmentDispatchPack?.next ?? null,
    assignmentLaunch: assignmentDispatchBundle?.next ?? null,
    assignmentLaunchStep: assignmentLaunchPlan?.next ?? null,
    closeout: closeout?.next ?? null
  };
}

export function buildRuntimePackLeaderMetadata(
  workspace,
  queue,
  dispatch,
  assignmentDispatchPack,
  assignmentDispatchBundle,
  assignmentLaunchPlan,
  closeout
) {
  return buildRuntimePackPresenceMetadata({
    hasWorkspace: workspace?.focus,
    hasQueue: queue?.next,
    hasDispatch: dispatch?.next,
    hasAssignmentDispatch: assignmentDispatchPack?.next,
    hasAssignmentLaunch: assignmentDispatchBundle?.next,
    hasAssignmentLaunchPlan: assignmentLaunchPlan?.next,
    hasCloseout: closeout?.next
  });
}

export function buildRuntimePackLeaderOverview(
  workspace,
  queue,
  dispatch,
  assignmentDispatchPack,
  assignmentDispatchBundle,
  assignmentLaunchPlan,
  closeout
) {
  return {
    workspace: workspace?.counts ?? null,
    queue: queue?.counts ?? null,
    dispatch: dispatch?.counts ?? null,
    assignmentDispatchPack: assignmentDispatchPack?.counts ?? null,
    assignmentDispatchBundle: assignmentDispatchBundle?.counts ?? null,
    assignmentLaunchPlan: assignmentLaunchPlan?.counts ?? null,
    closeout: closeout?.counts ?? null
  };
}

export function buildRuntimePackLeaderSurfaces(
  workspace,
  queue,
  dispatch,
  assignmentDispatchPack,
  assignmentDispatchBundle,
  assignmentLaunchPlan,
  closeout
) {
  return {
    workspace,
    queue,
    dispatch,
    assignmentDispatchPack,
    assignmentDispatchBundle,
    assignmentLaunchPlan,
    closeout
  };
}
