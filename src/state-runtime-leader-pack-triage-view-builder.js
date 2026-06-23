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
