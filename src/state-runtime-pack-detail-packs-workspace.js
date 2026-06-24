import {
  buildRuntimePackPresenceMetadata
} from "./state-runtime-pack-detail-core.js";

export function buildRuntimePackWorkspaceEntries(
  dashboard,
  dispatch,
  assignmentDispatchBundle,
  assignmentLaunchPlan,
  review,
  recovery
) {
  return {
    dashboard: dashboard?.leader?.queue?.next ?? null,
    dispatch: dispatch?.next ?? null,
    assignmentLaunch: assignmentDispatchBundle?.next ?? null,
    assignmentLaunchStep: assignmentLaunchPlan?.next ?? null,
    review: review?.next ?? null,
    recovery: recovery?.next ?? null
  };
}

export function buildRuntimePackWorkspaceMetadata(
  dashboard,
  dispatch,
  assignmentDispatchBundle,
  assignmentLaunchPlan,
  review,
  recovery
) {
  return buildRuntimePackPresenceMetadata({
    hasDashboard: dashboard?.leader?.queue?.next,
    hasDispatch: dispatch?.next,
    hasAssignmentLaunch: assignmentDispatchBundle?.next,
    hasAssignmentLaunchPlan: assignmentLaunchPlan?.next,
    hasReview: review?.next,
    hasRecovery: recovery?.next
  });
}

export function buildRuntimePackWorkspaceOverview(
  dashboard,
  dispatch,
  assignmentDispatchBundle,
  assignmentLaunchPlan,
  review,
  recovery
) {
  return {
    dashboard: dashboard?.counts ?? null,
    dispatch: dispatch?.counts ?? null,
    assignmentDispatchBundle: assignmentDispatchBundle?.counts ?? null,
    assignmentLaunchPlan: assignmentLaunchPlan?.counts ?? null,
    review: review?.counts ?? null,
    recovery: recovery?.counts ?? null
  };
}

export function buildRuntimePackWorkspaceSurfaces(
  dashboard,
  dispatch,
  assignmentDispatchBundle,
  assignmentLaunchPlan,
  review,
  recovery
) {
  return {
    dashboard,
    dispatch,
    assignmentDispatchBundle,
    assignmentLaunchPlan,
    review,
    recovery
  };
}
