import { buildRuntimePackPresenceMetadata } from "./state-runtime-pack-detail-core.js";

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
