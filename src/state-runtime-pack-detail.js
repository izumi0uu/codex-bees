import { buildPurposeGuidanceForTaskLike } from "./state-lane-purpose.js";

export const RUNTIME_PACK_DETAILS = Object.freeze(["compact", "full"]);

const VALID_RUNTIME_PACK_DETAILS = new Set(RUNTIME_PACK_DETAILS);

function appendCommandOption(parts, flag, value) {
  if (value === undefined || value === null || value === "") {
    return;
  }

  parts.push(flag, value);
}

function appendJsonCommandOption(parts, flag, value) {
  if (value === undefined || value === null) {
    return;
  }

  parts.push(flag, `'${JSON.stringify(value)}'`);
}

export function normalizeRuntimePackDetail(detail, fallback = "compact") {
  return VALID_RUNTIME_PACK_DETAILS.has(detail) ? detail : fallback;
}

export function buildRuntimePackCommand(command, input = {}, overrides = {}) {
  const parts = ["node ./src/index.js", command];
  const resolved = {
    ...input,
    ...overrides
  };

  appendCommandOption(parts, "--role", resolved.role);
  appendCommandOption(parts, "--worker", resolved.workerId);
  appendJsonCommandOption(parts, "--workers", resolved.workerIds);
  appendCommandOption(parts, "--mode", resolved.mode);
  appendCommandOption(parts, "--status", resolved.status);
  appendCommandOption(parts, "--topology", resolved.topology);
  appendCommandOption(parts, "--owner", resolved.owner);
  appendCommandOption(parts, "--detail", resolved.detail);

  return parts.join(" ");
}

export function buildRuntimePackExpansionEntry(surface, command) {
  if (!surface || !command) {
    return null;
  }

  return {
    surface,
    command
  };
}

export function buildRuntimePackCliExpansionEntry(command) {
  return buildRuntimePackExpansionEntry(command, `node ./src/index.js ${command}`);
}

export function buildRuntimePackCommandExpansionEntry(command, input = {}, overrides = {}) {
  return buildRuntimePackExpansionEntry(command, buildRuntimePackCommand(command, input, overrides));
}

export function buildRuntimePackExpansion(detailLevel, expansion) {
  return detailLevel === "compact" ? expansion : null;
}

export function attachRuntimePackSurfaces(pack, detailLevel, surfaces) {
  if (detailLevel === "full") {
    pack.surfaces = surfaces;
  }

  return pack;
}

export function buildRuntimePackPresenceMetadata(entries = {}) {
  return Object.fromEntries(
    Object.entries(entries).map(([key, value]) => [key, Boolean(value)])
  );
}

export function countRuntimePackEntries(entries = {}) {
  return Object.values(entries).filter(Boolean).length;
}

export function buildRuntimePackCounts(entries = {}) {
  return {
    surfacedNextEntries: countRuntimePackEntries(entries)
  };
}

export function buildRuntimePackFocusOverview(focusView) {
  return focusView?.focus
    ? {
        type: focusView.focus.type,
        priority: focusView.focus.priority
      }
    : null;
}

export function buildRuntimePackPickupOverview(pickup) {
  return pickup
    ? {
        outcome: pickup.outcome,
        command: pickup.command,
        candidateId: pickup.candidate?.id ?? null,
        purpose: pickup.purposeGuidance?.purpose ?? null
      }
    : null;
}

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

export function buildRuntimePackHandoffEntries(handoffs, dispatch, review, recovery) {
  return {
    handoff: handoffs?.next ?? null,
    dispatch: dispatch?.next ?? null,
    review: review?.next ?? null,
    recovery: recovery?.next ?? null
  };
}

export function buildRuntimePackHandoffMetadata(nextEntries = {}) {
  return buildRuntimePackPresenceMetadata({
    hasHandoff: nextEntries.handoff,
    hasDispatch: nextEntries.dispatch,
    hasReview: nextEntries.review,
    hasRecovery: nextEntries.recovery
  });
}

export function buildRuntimePackHandoffOverview(handoffs, dispatch, review, recovery) {
  return {
    handoffs: handoffs?.counts ?? null,
    dispatch: dispatch?.counts ?? null,
    review: review?.counts ?? null,
    recovery: recovery?.counts ?? null
  };
}

export function buildRuntimePackHandoffSurfaces(handoffs, dispatch, review, recovery) {
  return {
    handoffs,
    dispatch,
    review,
    recovery
  };
}

export function buildRuntimePackTriageEntries(focus, alerts, review, recovery) {
  return {
    focus: focus?.focus ?? null,
    alert: alerts?.alerts?.[0] ?? null,
    review: review?.next ?? null,
    recovery: recovery?.next ?? null
  };
}

export function buildRuntimePackTriageMetadata(nextEntries = {}) {
  return buildRuntimePackPresenceMetadata({
    hasFocus: nextEntries.focus,
    hasAlert: nextEntries.alert,
    hasReview: nextEntries.review,
    hasRecovery: nextEntries.recovery
  });
}

export function buildRuntimePackTriageOverview(focus, alerts, review, recovery) {
  return {
    focus: buildRuntimePackFocusOverview(focus),
    alerts: alerts?.counts ?? null,
    review: review?.counts ?? null,
    recovery: recovery?.counts ?? null
  };
}

export function buildRuntimePackTriageSurfaces(focus, alerts, review, recovery) {
  return {
    focus,
    alerts,
    review,
    recovery
  };
}

export function buildRuntimePackSignalEntries(focus, alerts, activity, roles) {
  return {
    focus: focus?.focus ?? null,
    alert: alerts?.alerts?.[0] ?? null,
    activity: activity?.next ?? null,
    role: roles?.next ?? null
  };
}

export function buildRuntimePackSignalMetadata(nextEntries = {}) {
  return buildRuntimePackPresenceMetadata({
    hasFocus: nextEntries.focus,
    hasAlert: nextEntries.alert,
    hasActivity: nextEntries.activity,
    hasRole: nextEntries.role
  });
}

export function buildRuntimePackSignalOverview(focus, alerts, activity, roles) {
  return {
    focus: buildRuntimePackFocusOverview(focus),
    alerts: alerts?.counts ?? null,
    activity: activity?.counts ?? null,
    roles: roles?.counts ?? null
  };
}

export function buildRuntimePackSignalSurfaces(focus, alerts, activity, roles) {
  return {
    focus,
    alerts,
    activity,
    roles
  };
}

export function buildRuntimePackCloseoutEntries(closeout, summaryPack, leaderPack) {
  return {
    closeout: closeout?.next ?? null,
    summary: summaryPack?.next?.closeout ?? null,
    leader: leaderPack?.next?.closeout ?? null
  };
}

export function buildRuntimePackCloseoutMetadata(closeout, summaryPack, leaderPack) {
  return buildRuntimePackPresenceMetadata({
    hasCloseout: closeout?.next,
    hasSummaryCloseout: summaryPack?.next?.closeout,
    hasLeaderCloseout: leaderPack?.next?.closeout
  });
}

export function buildRuntimePackCloseoutOverview(closeout, summaryPack, leaderPack) {
  return {
    closeout: closeout?.counts ?? null,
    summary: summaryPack?.overview?.closeout ?? null,
    leader: leaderPack?.overview?.closeout ?? null
  };
}

export function buildRuntimePackCloseoutSurfaces(closeout, summaryPack, leaderPack) {
  return {
    closeout,
    summaryPack,
    leaderPack
  };
}

export function buildRuntimePackRecoveryEntries(recovery, handoffs, focus) {
  return {
    recovery: recovery?.next ?? null,
    handoff: handoffs?.next ?? null,
    focus: focus?.focus ?? null
  };
}

export function buildRuntimePackRecoveryMetadata(recovery, handoffs, focus) {
  return buildRuntimePackPresenceMetadata({
    hasRecovery: recovery?.next,
    hasHandoff: handoffs?.next,
    hasFocus: focus?.focus
  });
}

export function buildRuntimePackRecoveryOverview(recovery, handoffs) {
  return {
    recovery: recovery?.counts ?? null,
    handoffs: handoffs?.counts ?? null
  };
}

export function buildRuntimePackRecoverySurfaces(recovery, handoffs, focus) {
  return {
    recovery,
    handoffs,
    focus
  };
}

export function buildRuntimePackOperatorEntries(focus, handoffs, closeout, alerts) {
  return {
    focus: focus?.focus ?? null,
    handoff: handoffs?.next ?? null,
    closeout: closeout?.next ?? null,
    alert: alerts?.alerts?.[0] ?? null
  };
}

export function buildRuntimePackOperatorMetadata(focus, handoffs, closeout, alerts) {
  return buildRuntimePackPresenceMetadata({
    hasFocus: focus?.focus,
    hasHandoff: handoffs?.next,
    hasCloseout: closeout?.next,
    hasAlert: alerts?.alerts?.[0]
  });
}

export function buildRuntimePackOperatorOverview(dashboard, alerts, handoffs, closeout) {
  return {
    dashboard: dashboard?.counts ?? null,
    alerts: alerts?.counts ?? null,
    handoffs: handoffs?.counts ?? null,
    closeout: closeout?.counts ?? null
  };
}

export function buildRuntimePackOperatorSurfaces(dashboard, focus, alerts, handoffs, closeout) {
  return {
    dashboard,
    focus,
    alerts,
    handoffs,
    closeout
  };
}

export function buildRuntimePackReviewEntries(review, roles, verifierPack) {
  return {
    review: review?.next ?? null,
    role: roles?.next ?? null,
    verifier: verifierPack?.next ?? null
  };
}

export function buildRuntimePackReviewMetadata(review, roles, verifierPack) {
  return buildRuntimePackPresenceMetadata({
    hasReview: review?.next,
    hasRole: roles?.next,
    hasVerifier: verifierPack?.next
  });
}

export function buildRuntimePackReviewOverview(review, roles, verifierPack) {
  return {
    review: review?.counts ?? null,
    roles: roles?.counts ?? null,
    verifier: verifierPack?.overview ?? null
  };
}

export function buildRuntimePackReviewSurfaces(review, roles, verifierPack) {
  return {
    review,
    roles,
    verifierPack
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

export function resolveRuntimePackPurposeGuidance(...sources) {
  for (const source of sources) {
    if (source?.purposeGuidance) {
      return source.purposeGuidance;
    }
  }

  return null;
}

export function buildRuntimePackFallbackPurposeGuidance(taskLike, ...sources) {
  return resolveRuntimePackPurposeGuidance(...sources) ?? buildPurposeGuidanceForTaskLike(taskLike ?? null);
}

export function buildRuntimePackSessionOverview(session) {
  return {
    session: session?.counts ?? null,
    inbox: session?.inbox?.counts ?? null
  };
}

export function requireRuntimePackRoleWorkerSelection(input) {
  if (!input?.role || !input?.workerId) {
    return null;
  }

  return {
    role: input.role,
    workerId: input.workerId
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
