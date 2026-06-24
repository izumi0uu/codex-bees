import {
  buildRuntimePackFocusOverview,
  buildRuntimePackPresenceMetadata
} from "./state-runtime-pack-detail-core.js";

export function buildRuntimePackExecutionEntries(
  focus,
  dispatch,
  assignmentDispatchBundle,
  assignmentLaunchPlan,
  roles,
  queuePack
) {
  return {
    focus: focus?.focus ?? null,
    dispatch: dispatch?.next ?? null,
    assignmentLaunch: assignmentDispatchBundle?.next ?? null,
    assignmentLaunchStep: assignmentLaunchPlan?.next ?? null,
    role: roles?.next ?? null,
    queue: queuePack?.next?.queue ?? null
  };
}

export function buildRuntimePackExecutionMetadata(nextEntries = {}) {
  return buildRuntimePackPresenceMetadata({
    hasFocus: nextEntries.focus,
    hasDispatch: nextEntries.dispatch,
    hasAssignmentLaunch: nextEntries.assignmentLaunch,
    hasAssignmentLaunchStep: nextEntries.assignmentLaunchStep,
    hasRole: nextEntries.role,
    hasQueue: nextEntries.queue
  });
}

export function buildRuntimePackExecutionOverview(
  focus,
  dispatch,
  assignmentDispatchBundle,
  assignmentLaunchPlan,
  roles,
  queuePack
) {
  return {
    focus: buildRuntimePackFocusOverview(focus),
    dispatch: dispatch?.counts ?? null,
    assignmentDispatchBundle: assignmentDispatchBundle?.counts ?? null,
    assignmentLaunchPlan: assignmentLaunchPlan?.counts ?? null,
    roles: roles?.counts ?? null,
    queue: queuePack?.overview?.queue ?? null
  };
}

export function buildRuntimePackExecutionSurfaces(
  focus,
  dispatch,
  assignmentDispatchBundle,
  assignmentLaunchPlan,
  roles,
  queuePack
) {
  return {
    focus,
    dispatch,
    assignmentDispatchBundle,
    assignmentLaunchPlan,
    roles,
    queuePack
  };
}

export function buildRuntimePackWorkerFlowEntries(session, handoff, closeout, next) {
  return {
    focus: session?.focus ?? null,
    candidate: next?.candidate ?? null,
    handoff: handoff?.currentTask ?? null,
    closeout: closeout?.report?.task ?? null
  };
}

export function buildRuntimePackWorkerFlowSurfaces(session, handoff, closeout, next) {
  return {
    session,
    handoff,
    closeout,
    next
  };
}

export function buildRuntimePackWorkerFlowMetadata(nextEntries = {}) {
  return buildRuntimePackPresenceMetadata({
    hasFocus: nextEntries.focus,
    hasCandidate: nextEntries.candidate,
    hasHandoff: nextEntries.handoff,
    hasCloseout: nextEntries.closeout
  });
}

export function buildRuntimePackVerifierFlowEntries(review, bundle, closeout, next) {
  return {
    review: review?.next ?? null,
    candidate: next?.candidate ?? null,
    decision: bundle?.currentTask ?? null,
    closeout: closeout?.report?.task ?? null
  };
}

export function buildRuntimePackVerifierFlowMetadata(nextEntries = {}) {
  return buildRuntimePackPresenceMetadata({
    hasReview: nextEntries.review,
    hasCandidate: nextEntries.candidate,
    hasDecision: nextEntries.decision,
    hasCloseout: nextEntries.closeout
  });
}

export function buildRuntimePackVerifierOverview(review, bundle) {
  return {
    review: review?.counts ?? null,
    bundle: bundle?.currentTask ? { currentTask: bundle.currentTask.id } : { currentTask: null }
  };
}

export function buildRuntimePackVerifierSurfaces(review, bundle, closeout, next) {
  return {
    review,
    bundle,
    closeout,
    next
  };
}
