import {
  buildRuntimePackPresenceMetadata
} from "./state-runtime-pack-detail-core.js";

export function buildRuntimePackSummaryEntries(
  focus,
  handoffs,
  recovery,
  closeout,
  assignmentDispatchBundle,
  assignmentLaunchPlan
) {
  return {
    focus: focus?.focus ?? null,
    handoff: handoffs?.next ?? null,
    recovery: recovery?.next ?? null,
    closeout: closeout?.next ?? null,
    assignmentLaunch: assignmentDispatchBundle?.next ?? null,
    assignmentLaunchStep: assignmentLaunchPlan?.next ?? null
  };
}

export function buildRuntimePackSummaryMetadata(
  focus,
  recovery,
  closeout,
  assignmentDispatchBundle,
  assignmentLaunchPlan
) {
  return buildRuntimePackPresenceMetadata({
    hasFocus: focus?.focus,
    hasRecovery: recovery?.next,
    hasCloseout: closeout?.next,
    hasAssignmentLaunch: assignmentDispatchBundle?.next,
    hasAssignmentLaunchPlan: assignmentLaunchPlan?.next
  });
}

export function buildRuntimePackSummaryOverview(
  dashboard,
  alerts,
  handoffs,
  recovery,
  closeout,
  assignmentDispatchBundle,
  assignmentLaunchPlan
) {
  return {
    dashboard: dashboard?.counts ?? null,
    alerts: alerts?.counts ?? null,
    handoffs: handoffs?.counts ?? null,
    recovery: recovery?.counts ?? null,
    closeout: closeout?.counts ?? null,
    assignmentDispatchBundle: assignmentDispatchBundle?.counts ?? null,
    assignmentLaunchPlan: assignmentLaunchPlan?.counts ?? null
  };
}

export function buildRuntimePackSummarySurfaces(
  dashboard,
  alerts,
  handoffs,
  recovery,
  closeout,
  assignmentDispatchBundle,
  assignmentLaunchPlan
) {
  return {
    dashboard,
    alerts,
    handoffs,
    recovery,
    closeout,
    assignmentDispatchBundle,
    assignmentLaunchPlan
  };
}
