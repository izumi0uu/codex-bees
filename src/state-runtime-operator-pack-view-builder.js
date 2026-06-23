export function buildRuntimeOperatorPackView(
  {
    runtimeDashboard,
    runtimeFocus,
    runtimeAlerts,
    runtimeHandoffs,
    runtimeCloseout
  },
  {
    deriveRuntimeOperatorPackSurface,
    deriveRuntimeOperatorPackReason,
    buildRuntimeOperatorPackSummary
  }
) {
  const dashboard = runtimeDashboard();
  const focus = runtimeFocus();
  const alerts = runtimeAlerts();
  const handoffs = runtimeHandoffs();
  const closeout = runtimeCloseout();
  const recommendedSurface = deriveRuntimeOperatorPackSurface({ focus, handoffs, closeout, dashboard, alerts });
  const recommendedReason = deriveRuntimeOperatorPackReason({ focus, handoffs, closeout, dashboard, alerts });
  const nextEntries = {
    focus: focus?.focus ?? null,
    handoff: handoffs?.next ?? null,
    closeout: closeout?.next ?? null,
    alert: alerts?.alerts?.[0] ?? null
  };

  return {
    kind: 'runtime_operator_pack',
    recommendedSurface,
    recommendedReason,
    metadata: {
      hasFocus: Boolean(focus?.focus),
      hasHandoff: Boolean(handoffs?.next),
      hasCloseout: Boolean(closeout?.next),
      hasAlert: Boolean(alerts?.alerts?.[0])
    },
    counts: {
      surfacedNextEntries: Object.values(nextEntries).filter(Boolean).length
    },
    focus,
    overview: {
      dashboard: dashboard?.counts ?? null,
      alerts: alerts?.counts ?? null,
      handoffs: handoffs?.counts ?? null,
      closeout: closeout?.counts ?? null
    },
    next: nextEntries,
    surfaces: {
      dashboard,
      focus,
      alerts,
      handoffs,
      closeout
    },
    summary: buildRuntimeOperatorPackSummary(recommendedSurface, focus, alerts)
  };
}

export function buildRuntimeOperatorPackViewFromSources(
  {
    runtimeDashboard,
    runtimeFocus,
    runtimeAlerts,
    runtimeHandoffs,
    runtimeCloseout
  },
  {
    deriveRuntimeOperatorPackSurface,
    deriveRuntimeOperatorPackReason,
    buildRuntimeOperatorPackSummary,
    buildRuntimeOperatorPackView
  }
) {
  return buildRuntimeOperatorPackView(
    {
      runtimeDashboard,
      runtimeFocus,
      runtimeAlerts,
      runtimeHandoffs,
      runtimeCloseout
    },
    {
      deriveRuntimeOperatorPackSurface,
      deriveRuntimeOperatorPackReason,
      buildRuntimeOperatorPackSummary
    }
  );
}
