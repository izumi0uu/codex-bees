import {
  buildRuntimePackPresenceMetadata,
  countRuntimePackEntries
} from './state-runtime-pack-detail.js';

export function buildRuntimeSignalPackView(
  input,
  {
    runtimeFocus,
    runtimeAlerts,
    runtimeActivity,
    runtimeRoles
  },
  {
    deriveRuntimeSignalPackSurface,
    deriveRuntimeSignalPackReason,
    buildRuntimeSignalPackSummary
  }
) {
  const focus = runtimeFocus();
  const alerts = runtimeAlerts();
  const activity = runtimeActivity(input);
  const roles = runtimeRoles(input);
  const recommendedSurface = deriveRuntimeSignalPackSurface({ focus, alerts, activity, roles });
  const recommendedReason = deriveRuntimeSignalPackReason({ focus, alerts, activity, roles });
  const nextEntries = {
    focus: focus?.focus ?? null,
    alert: alerts?.alerts?.[0] ?? null,
    activity: activity?.next ?? null,
    role: roles?.next ?? null
  };

  return {
    kind: "runtime_signal_pack",
    recommendedSurface,
    recommendedReason,
    metadata: buildRuntimePackPresenceMetadata({
      hasFocus: nextEntries.focus,
      hasAlert: nextEntries.alert,
      hasActivity: nextEntries.activity,
      hasRole: nextEntries.role
    }),
    counts: {
      surfacedNextEntries: countRuntimePackEntries(nextEntries)
    },
    overview: {
      focus: focus?.focus ? { type: focus.focus.type, priority: focus.focus.priority } : null,
      alerts: alerts?.counts ?? null,
      activity: activity?.counts ?? null,
      roles: roles?.counts ?? null
    },
    next: nextEntries,
    surfaces: {
      focus,
      alerts,
      activity,
      roles
    },
    summary: buildRuntimeSignalPackSummary(recommendedSurface, focus, alerts, activity, roles)
  };
}

export function buildRuntimeSignalPackViewFromSources(
  input,
  {
    runtimeFocus,
    runtimeAlerts,
    runtimeActivity,
    runtimeRoles
  },
  {
    deriveRuntimeSignalPackSurface,
    deriveRuntimeSignalPackReason,
    buildRuntimeSignalPackSummary,
    buildRuntimeSignalPackView
  }
) {
  return buildRuntimeSignalPackView(
    input,
    {
      runtimeFocus,
      runtimeAlerts,
      runtimeActivity,
      runtimeRoles
    },
    {
      deriveRuntimeSignalPackSurface,
      deriveRuntimeSignalPackReason,
      buildRuntimeSignalPackSummary
    }
  );
}
