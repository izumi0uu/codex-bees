import {
  buildRuntimePackFocusOverview,
  buildRuntimePackPickupOverview,
  buildRuntimePackPresenceMetadata,
  buildRuntimePackSessionOverview
} from "./state-runtime-pack-detail-core.js";

export function buildRuntimePackPickupFlowEntries(session, next, pickup) {
  return {
    focus: session?.focus ?? null,
    candidate: next?.candidate ?? null,
    brief: pickup?.brief ?? next?.brief ?? null,
    pickup
  };
}
export function buildRuntimePackPickupFlowMetadata(nextEntries = {}) {
  return buildRuntimePackPresenceMetadata({
    hasFocus: nextEntries.focus,
    hasCandidate: nextEntries.candidate,
    hasBrief: nextEntries.brief,
    hasPickup: nextEntries.pickup
  });
}
export function buildRuntimePackPickupPackOverview(session, pickup, rolePack) {
  return {
    ...buildRuntimePackSessionOverview(session),
    pickup: buildRuntimePackPickupOverview(pickup),
    role: rolePack?.overview?.role ?? null
  };
}
export function buildRuntimePackPickupSurfaces(session, next, pickup, rolePack) {
  return {
    session,
    next,
    pickup,
    rolePack
  };
}
export function buildRuntimePackAssignmentFlowEntries(assignment, pickup, next, session) {
  return {
    assignment,
    pickup,
    candidate: next?.candidate ?? null,
    focus: session?.focus ?? null
  };
}
export function buildRuntimePackAssignmentFlowMetadata(nextEntries = {}) {
  return buildRuntimePackPresenceMetadata({
    hasAssignment: nextEntries.assignment,
    hasPickup: nextEntries.pickup,
    hasCandidate: nextEntries.candidate,
    hasFocus: nextEntries.focus
  });
}
export function buildRuntimePackAssignmentOverview(roleAssignments, assignments, pickup, roleEntry, session) {
  return {
    assignments: {
      count: roleAssignments?.count ?? 0,
      ownerGroups: assignments?.counts?.ownerGroups ?? 0
    },
    pickup: buildRuntimePackPickupOverview(pickup),
    role: roleEntry?.counts ?? null,
    session: session?.counts ?? null
  };
}
export function buildRuntimePackAssignmentSurfaces(roleAssignments, session, next, pickup, roleEntry, assignments) {
  return {
    roleAssignments,
    session,
    next,
    pickup,
    role: roleEntry,
    assignments: {
      counts: assignments?.counts ?? null,
      next: assignments?.next ?? null
    }
  };
}
export function buildRuntimePackSessionEntries(workerPack, ownerPack, verifierPack, roleEntry) {
  return {
    worker: workerPack?.next ?? null,
    owner: ownerPack?.next ?? null,
    verifier: verifierPack?.next ?? null,
    role: roleEntry?.nextAction ?? null
  };
}
export function buildRuntimePackSessionMetadata(nextEntries = {}) {
  return buildRuntimePackPresenceMetadata({
    hasWorker: nextEntries.worker,
    hasOwner: nextEntries.owner,
    hasVerifier: nextEntries.verifier,
    hasRole: nextEntries.role
  });
}
export function buildRuntimePackSessionPackOverview(workerPack, ownerPack, verifierPack, roleEntry) {
  return {
    worker: workerPack?.overview ?? null,
    owner: ownerPack?.overview ?? null,
    verifier: verifierPack?.overview ?? null,
    role: roleEntry?.counts ?? null
  };
}
export function buildRuntimePackSessionSurfaces(workerPack, ownerPack, verifierPack, roleEntry) {
  return {
    workerPack,
    ownerPack,
    verifierPack,
    role: roleEntry
  };
}
export function buildRuntimePackRoleEntries(roleEntry, sessionPack, ownerPack, verifierPack) {
  return {
    role: roleEntry?.nextAction ?? null,
    session: sessionPack?.next ?? null,
    owner: ownerPack?.next ?? null,
    verifier: verifierPack?.next ?? null
  };
}
export function buildRuntimePackRoleMetadata(nextEntries = {}) {
  return buildRuntimePackPresenceMetadata({
    hasRole: nextEntries.role,
    hasSession: nextEntries.session,
    hasOwner: nextEntries.owner,
    hasVerifier: nextEntries.verifier
  });
}
export function buildRuntimePackRoleOverview(roleEntry, sessionPack, ownerPack, verifierPack) {
  return {
    role: roleEntry?.counts ?? null,
    session: sessionPack?.overview ?? null,
    owner: ownerPack?.overview ?? null,
    verifier: verifierPack?.overview ?? null
  };
}
export function buildRuntimePackRoleSurfaces(roleEntry, sessionPack, ownerPack, verifierPack) {
  return {
    role: roleEntry,
    sessionPack,
    ownerPack,
    verifierPack
  };
}
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
