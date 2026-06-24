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
export function buildRuntimePackSummaryMetadata(focus, recovery, closeout, assignmentDispatchBundle, assignmentLaunchPlan) {
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
export function buildRuntimePackControlEntries(summaryPack, workspacePack, operatorPack, leaderPack) {
  return {
    summary: summaryPack?.focus?.focus ?? null,
    workspace: workspacePack?.next ?? null,
    operator: operatorPack?.next ?? null,
    leader: leaderPack?.next ?? null
  };
}
export function buildRuntimePackControlMetadata(nextEntries = {}) {
  return buildRuntimePackPresenceMetadata({
    hasSummary: nextEntries.summary,
    hasWorkspace: nextEntries.workspace,
    hasOperator: nextEntries.operator,
    hasLeader: nextEntries.leader
  });
}
export function buildRuntimePackControlOverview(summaryPack, workspacePack, operatorPack, leaderPack) {
  return {
    summary: summaryPack?.overview ?? null,
    workspace: workspacePack?.overview ?? null,
    operator: operatorPack?.overview ?? null,
    leader: leaderPack?.overview ?? null
  };
}
export function buildRuntimePackControlSurfaces(summaryPack, workspacePack, operatorPack, leaderPack) {
  return {
    summaryPack,
    workspacePack,
    operatorPack,
    leaderPack
  };
}
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
export function buildRuntimePackDispatchMetadata(dispatch, assignmentDispatchPack, assignmentDispatchBundle, roles, handoffs) {
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
export function buildRuntimePackQueueSurfaces(queue, dashboard, focus, assignmentDispatchBundle, assignmentLaunchPlan) {
  return {
    queue,
    dashboard,
    focus,
    assignmentDispatchBundle,
    assignmentLaunchPlan
  };
}
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
