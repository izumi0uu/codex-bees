export function deriveRuntimeHandoffPackSurface({ handoffs, dispatch, review, recovery }) {
  if ((handoffs?.counts?.reviewDecisions ?? 0) > 0) {
    return "runtime:handoffs";
  }
  if ((review?.counts?.totalPendingReview ?? 0) > 0) {
    return "runtime:review";
  }
  if ((recovery?.counts?.totalEntries ?? 0) > 0) {
    return "runtime:recovery";
  }
  if ((dispatch?.counts?.totalAssignments ?? 0) > 0) {
    return "runtime:dispatch";
  }
  return "runtime:handoffs";
}

export function deriveRuntimeHandoffPackReason({ handoffs, dispatch, review, recovery }) {
  if ((handoffs?.counts?.reviewDecisions ?? 0) > 0) {
    return "review_handoffs_waiting";
  }
  if ((review?.counts?.totalPendingReview ?? 0) > 0) {
    return "review_queue_waiting";
  }
  if ((recovery?.counts?.totalEntries ?? 0) > 0) {
    return "recovery_queue_waiting";
  }
  if ((dispatch?.counts?.totalAssignments ?? 0) > 0) {
    return "dispatch_handoff_waiting";
  }
  return "default_handoff_priority";
}

export function buildRuntimeHandoffPackSummary(recommendedSurface, handoffs, review, recovery, dispatch) {
  const detail =
    handoffs?.summary ??
    review?.summary ??
    recovery?.summary ??
    dispatch?.summary ??
    "Runtime handoff pack has no current transfer detail.";
  return `Runtime handoff pack recommends ${recommendedSurface} next. ${detail}`;
}

export function buildRuntimeHandoffPackView(
  {
    runtimeHandoffs,
    runtimeDispatch,
    runtimeReview,
    runtimeRecovery
  },
  {
    deriveRuntimeHandoffPackSurface,
    deriveRuntimeHandoffPackReason,
    buildRuntimeHandoffPackSummary
  }
) {
  const handoffs = runtimeHandoffs();
  const dispatch = runtimeDispatch();
  const review = runtimeReview();
  const recovery = runtimeRecovery();
  const recommendedSurface = deriveRuntimeHandoffPackSurface({ handoffs, dispatch, review, recovery });
  const recommendedReason = deriveRuntimeHandoffPackReason({ handoffs, dispatch, review, recovery });
  const nextEntries = {
    handoff: handoffs?.next ?? null,
    dispatch: dispatch?.next ?? null,
    review: review?.next ?? null,
    recovery: recovery?.next ?? null
  };

  return {
    kind: "runtime_handoff_pack",
    recommendedSurface,
    recommendedReason,
    metadata: {
      hasHandoff: Boolean(nextEntries.handoff),
      hasDispatch: Boolean(nextEntries.dispatch),
      hasReview: Boolean(nextEntries.review),
      hasRecovery: Boolean(nextEntries.recovery)
    },
    counts: {
      surfacedNextEntries: Object.values(nextEntries).filter(Boolean).length
    },
    overview: {
      handoffs: handoffs?.counts ?? null,
      dispatch: dispatch?.counts ?? null,
      review: review?.counts ?? null,
      recovery: recovery?.counts ?? null
    },
    next: nextEntries,
    surfaces: {
      handoffs,
      dispatch,
      review,
      recovery
    },
    summary: buildRuntimeHandoffPackSummary(recommendedSurface, handoffs, review, recovery, dispatch)
  };
}

export function buildRuntimeHandoffPackViewFromSources(
  {
    runtimeHandoffs,
    runtimeDispatch,
    runtimeReview,
    runtimeRecovery
  },
  {
    deriveRuntimeHandoffPackSurface,
    deriveRuntimeHandoffPackReason,
    buildRuntimeHandoffPackSummary,
    buildRuntimeHandoffPackView
  }
) {
  return buildRuntimeHandoffPackView(
    {
      runtimeHandoffs,
      runtimeDispatch,
      runtimeReview,
      runtimeRecovery
    },
    {
      deriveRuntimeHandoffPackSurface,
      deriveRuntimeHandoffPackReason,
      buildRuntimeHandoffPackSummary
    }
  );
}

export function deriveRuntimeTriagePackSurface({ focus, alerts, review, recovery }) {
  if (focus?.focus?.type === "blocked_task" || focus?.focus?.type === "review_task") {
    return "runtime:focus";
  }
  if ((recovery?.counts?.totalEntries ?? 0) > 0) {
    return "runtime:recovery";
  }
  if ((review?.counts?.totalPendingReview ?? 0) > 0) {
    return "runtime:review";
  }
  if ((alerts?.counts?.high ?? 0) > 0 || (alerts?.counts?.medium ?? 0) > 0) {
    return "runtime:alerts";
  }
  return "runtime:focus";
}

export function deriveRuntimeTriagePackReason({ focus, alerts, review, recovery }) {
  if (focus?.focus?.type === "blocked_task") {
    return "blocked_focus_priority";
  }
  if (focus?.focus?.type === "review_task") {
    return "review_focus_priority";
  }
  if ((recovery?.counts?.totalEntries ?? 0) > 0) {
    return "recovery_priority";
  }
  if ((review?.counts?.totalPendingReview ?? 0) > 0) {
    return "review_queue_priority";
  }
  if ((alerts?.counts?.high ?? 0) > 0) {
    return "high_alert_priority";
  }
  if ((alerts?.counts?.medium ?? 0) > 0) {
    return "medium_alert_priority";
  }
  return "default_focus_priority";
}

export function buildRuntimeTriagePackSummary(recommendedSurface, focus, alerts, review, recovery) {
  const detail =
    focus?.summary ??
    recovery?.summary ??
    review?.summary ??
    alerts?.summary ??
    "Runtime triage pack has no current triage detail.";
  return `Runtime triage pack recommends ${recommendedSurface} next. ${detail}`;
}

export function buildRuntimeTriagePackView(
  {
    runtimeFocus,
    runtimeAlerts,
    runtimeReview,
    runtimeRecovery
  },
  {
    deriveRuntimeTriagePackSurface,
    deriveRuntimeTriagePackReason,
    buildRuntimeTriagePackSummary
  }
) {
  const focus = runtimeFocus();
  const alerts = runtimeAlerts();
  const review = runtimeReview();
  const recovery = runtimeRecovery();
  const recommendedSurface = deriveRuntimeTriagePackSurface({ focus, alerts, review, recovery });
  const recommendedReason = deriveRuntimeTriagePackReason({ focus, alerts, review, recovery });
  const nextEntries = {
    focus: focus?.focus ?? null,
    alert: alerts?.alerts?.[0] ?? null,
    review: review?.next ?? null,
    recovery: recovery?.next ?? null
  };

  return {
    kind: "runtime_triage_pack",
    recommendedSurface,
    recommendedReason,
    metadata: {
      hasFocus: Boolean(nextEntries.focus),
      hasAlert: Boolean(nextEntries.alert),
      hasReview: Boolean(nextEntries.review),
      hasRecovery: Boolean(nextEntries.recovery)
    },
    counts: {
      surfacedNextEntries: Object.values(nextEntries).filter(Boolean).length
    },
    overview: {
      focus: focus?.focus ? { type: focus.focus.type, priority: focus.focus.priority } : null,
      alerts: alerts?.counts ?? null,
      review: review?.counts ?? null,
      recovery: recovery?.counts ?? null
    },
    next: nextEntries,
    surfaces: {
      focus,
      alerts,
      review,
      recovery
    },
    summary: buildRuntimeTriagePackSummary(recommendedSurface, focus, alerts, review, recovery)
  };
}

export function buildRuntimeTriagePackViewFromSources(
  {
    runtimeFocus,
    runtimeAlerts,
    runtimeReview,
    runtimeRecovery
  },
  {
    deriveRuntimeTriagePackSurface,
    deriveRuntimeTriagePackReason,
    buildRuntimeTriagePackSummary,
    buildRuntimeTriagePackView
  }
) {
  return buildRuntimeTriagePackView(
    {
      runtimeFocus,
      runtimeAlerts,
      runtimeReview,
      runtimeRecovery
    },
    {
      deriveRuntimeTriagePackSurface,
      deriveRuntimeTriagePackReason,
      buildRuntimeTriagePackSummary
    }
  );
}

