import {
  buildRuntimePackFocusOverview,
  buildRuntimePackPresenceMetadata
} from "./core.js";

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
