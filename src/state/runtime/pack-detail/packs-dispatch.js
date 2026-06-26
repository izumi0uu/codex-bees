import {
  buildRuntimePackPresenceMetadata
} from "./core.js";

export function buildRuntimePackDispatchEntries(
  dispatch,
  assignmentDispatchPack,
  assignmentDispatchBundle,
  assignmentLaunchPlan,
  roles,
  handoffs
) {
  return {
    dispatch: dispatch?.next ?? null,
    assignmentDispatch: assignmentDispatchPack?.next ?? null,
    assignmentLaunch: assignmentDispatchBundle?.next ?? null,
    assignmentLaunchStep: assignmentLaunchPlan?.next ?? null,
    role: roles?.next ?? null,
    handoff: handoffs?.next ?? null
  };
}

export function buildRuntimePackDispatchMetadata(
  dispatch,
  assignmentDispatchPack,
  assignmentDispatchBundle,
  roles,
  handoffs
) {
  return buildRuntimePackPresenceMetadata({
    hasDispatch: dispatch?.next,
    hasAssignmentDispatch: assignmentDispatchPack?.next,
    hasAssignmentLaunch: assignmentDispatchBundle?.next,
    hasRole: roles?.next,
    hasHandoff: handoffs?.next
  });
}

export function buildRuntimePackDispatchOverview(
  dispatch,
  assignmentDispatchPack,
  assignmentDispatchBundle,
  assignmentLaunchPlan,
  roles,
  handoffs
) {
  return {
    dispatch: dispatch?.counts ?? null,
    assignmentDispatchPack: assignmentDispatchPack?.counts ?? null,
    assignmentDispatchBundle: assignmentDispatchBundle?.counts ?? null,
    assignmentLaunchPlan: assignmentLaunchPlan?.counts ?? null,
    roles: roles?.counts ?? null,
    handoffs: handoffs?.counts ?? null
  };
}

export function buildRuntimePackDispatchSurfaces(
  dispatch,
  assignmentDispatchPack,
  assignmentDispatchBundle,
  assignmentLaunchPlan,
  roles,
  handoffs
) {
  return {
    dispatch,
    assignmentDispatchPack,
    assignmentDispatchBundle,
    assignmentLaunchPlan,
    roles,
    handoffs
  };
}
