import {
  buildRuntimePackPresenceMetadata
} from "./core.js";

export function buildRuntimePackQueueEntries(queue, focus, assignmentDispatchBundle, assignmentLaunchPlan) {
  return {
    queue: queue?.next ?? null,
    focus: focus?.focus ?? null,
    assignmentLaunch: assignmentDispatchBundle?.next ?? null,
    assignmentLaunchStep: assignmentLaunchPlan?.next ?? null
  };
}

export function buildRuntimePackQueueMetadata(queue, focus, assignmentDispatchBundle, assignmentLaunchPlan) {
  return buildRuntimePackPresenceMetadata({
    hasQueue: queue?.next,
    hasFocus: focus?.focus,
    hasAssignmentLaunch: assignmentDispatchBundle?.next,
    hasAssignmentLaunchPlan: assignmentLaunchPlan?.next
  });
}

export function buildRuntimePackQueueOverview(queue, dashboard, assignmentDispatchBundle, assignmentLaunchPlan) {
  return {
    queue: queue?.counts ?? null,
    dashboard: dashboard?.counts ?? null,
    assignmentDispatchBundle: assignmentDispatchBundle?.counts ?? null,
    assignmentLaunchPlan: assignmentLaunchPlan?.counts ?? null
  };
}

export function buildRuntimePackQueueSurfaces(
  queue,
  dashboard,
  focus,
  assignmentDispatchBundle,
  assignmentLaunchPlan
) {
  return {
    queue,
    dashboard,
    focus,
    assignmentDispatchBundle,
    assignmentLaunchPlan
  };
}
