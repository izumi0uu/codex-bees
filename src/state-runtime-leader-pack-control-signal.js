import { buildRuntimePackCommand, buildRuntimePackExpansionEntry, normalizeRuntimePackDetail } from "./state-runtime-pack-detail.js";

export function deriveRuntimeControlPackSurface({ summaryPack, workspacePack, operatorPack, leaderPack }) {
  if (summaryPack?.recommendedSurface) {
    return "runtime:summary-pack";
  }
  if (workspacePack?.recommendedSurface) {
    return "runtime:workspace-pack";
  }
  if (operatorPack?.recommendedSurface) {
    return "runtime:operator-pack";
  }
  if (leaderPack?.recommendedSurface) {
    return "runtime:leader-pack";
  }
  return "runtime:summary-pack";
}

export function deriveRuntimeControlPackReason({ summaryPack, workspacePack, operatorPack, leaderPack }) {
  if (summaryPack?.recommendedSurface) {
    return "summary_priority";
  }
  if (workspacePack?.recommendedSurface) {
    return "workspace_priority";
  }
  if (operatorPack?.recommendedSurface) {
    return "operator_priority";
  }
  if (leaderPack?.recommendedSurface) {
    return "leader_priority";
  }
  return "default_summary_priority";
}

export function buildRuntimeControlPackSummary(recommendedSurface, summaryPack, workspacePack, operatorPack, leaderPack) {
  const detail =
    summaryPack?.summary ??
    workspacePack?.summary ??
    operatorPack?.summary ??
    leaderPack?.summary ??
    "Runtime control pack has no current control detail.";
  return `Runtime control pack recommends ${recommendedSurface} next. ${detail}`;
}

function stripRoleContractsDeep(value) {
  if (Array.isArray(value)) {
    return value.map((entry) => stripRoleContractsDeep(entry));
  }

  if (!value || typeof value !== "object") {
    return value;
  }

  const result = Object.fromEntries(
    Object.entries(value).map(([key, entry]) => [key, stripRoleContractsDeep(entry)])
  );

  if (
    "contract" in result &&
    "id" in result &&
    "promptPath" in result &&
    "source" in result
  ) {
    delete result.contract;
  }

  return result;
}

export function buildRuntimeControlPackView(
  input,
  {
    runtimeSummaryPack,
    runtimeWorkspacePack,
    runtimeOperatorPack,
    runtimeLeaderPack
  },
  {
    deriveRuntimeControlPackSurface,
    deriveRuntimeControlPackReason,
    buildRuntimeControlPackSummary
  }
) {
  const detailLevel = normalizeRuntimePackDetail(input.detail);
  const summaryPack = runtimeSummaryPack(input);
  const workspacePack = runtimeWorkspacePack(input);
  const operatorPack = runtimeOperatorPack();
  const leaderPack = runtimeLeaderPack(input);
  const recommendedSurface = deriveRuntimeControlPackSurface({ summaryPack, workspacePack, operatorPack, leaderPack });
  const recommendedReason = deriveRuntimeControlPackReason({ summaryPack, workspacePack, operatorPack, leaderPack });
  const nextEntries = {
    summary: summaryPack?.focus?.focus ?? null,
    workspace: workspacePack?.next ?? null,
    operator: operatorPack?.next ?? null,
    leader: leaderPack?.next ?? null
  };
  const expansion = {
    full: buildRuntimePackExpansionEntry("runtime:control-pack", buildRuntimePackCommand("runtime:control-pack", input, { detail: "full" })),
    summaryPack: buildRuntimePackExpansionEntry("runtime:summary-pack", buildRuntimePackCommand("runtime:summary-pack", input)),
    workspacePack: buildRuntimePackExpansionEntry("runtime:workspace-pack", buildRuntimePackCommand("runtime:workspace-pack", input)),
    operatorPack: buildRuntimePackExpansionEntry("runtime:operator-pack", "node ./src/index.js runtime:operator-pack"),
    leaderPack: buildRuntimePackExpansionEntry("runtime:leader-pack", buildRuntimePackCommand("runtime:leader-pack", input))
  };

  const pack = {
    kind: "runtime_control_pack",
    detailLevel,
    availableDetails: ["compact", "full"],
    recommendedSurface,
    recommendedReason,
    metadata: {
      hasSummary: Boolean(nextEntries.summary),
      hasWorkspace: Boolean(nextEntries.workspace),
      hasOperator: Boolean(nextEntries.operator),
      hasLeader: Boolean(nextEntries.leader)
    },
    counts: {
      surfacedNextEntries: Object.values(nextEntries).filter(Boolean).length
    },
    overview: {
      summary: summaryPack?.overview ?? null,
      workspace: workspacePack?.overview ?? null,
      operator: operatorPack?.overview ?? null,
      leader: leaderPack?.overview ?? null
    },
    next: nextEntries,
    expansion: detailLevel === "compact" ? expansion : null,
    summary: buildRuntimeControlPackSummary(recommendedSurface, summaryPack, workspacePack, operatorPack, leaderPack)
  };

  if (detailLevel === "full") {
    pack.surfaces = {
      summaryPack,
      workspacePack,
      operatorPack,
      leaderPack
    };
  }

  return stripRoleContractsDeep(pack);
}

export function buildRuntimeControlPackViewFromSources(
  input,
  {
    runtimeSummaryPack,
    runtimeWorkspacePack,
    runtimeOperatorPack,
    runtimeLeaderPack
  },
  {
    deriveRuntimeControlPackSurface,
    deriveRuntimeControlPackReason,
    buildRuntimeControlPackSummary,
    buildRuntimeControlPackView
  }
) {
  return buildRuntimeControlPackView(
    input,
    {
      runtimeSummaryPack,
      runtimeWorkspacePack,
      runtimeOperatorPack,
      runtimeLeaderPack
    },
    {
      deriveRuntimeControlPackSurface,
      deriveRuntimeControlPackReason,
      buildRuntimeControlPackSummary
    }
  );
}

export function deriveRuntimeSignalPackSurface({ focus, alerts, activity, roles }) {
  if (focus?.focus?.type === "blocked_task" || focus?.focus?.type === "review_task") {
    return "runtime:focus";
  }
  if ((alerts?.counts?.high ?? 0) > 0 || (alerts?.counts?.medium ?? 0) > 0) {
    return "runtime:alerts";
  }
  if ((roles?.counts?.withPendingReview ?? 0) > 0 || (roles?.counts?.withBlockedOwnerWork ?? 0) > 0) {
    return "runtime:roles";
  }
  if ((activity?.counts?.totalEntries ?? 0) > 0) {
    return "runtime:activity";
  }
  return "runtime:focus";
}

export function deriveRuntimeSignalPackReason({ focus, alerts, activity, roles }) {
  if (focus?.focus?.type === "blocked_task") {
    return "blocked_focus_priority";
  }
  if (focus?.focus?.type === "review_task") {
    return "review_focus_priority";
  }
  if ((alerts?.counts?.high ?? 0) > 0) {
    return "high_alert_priority";
  }
  if ((alerts?.counts?.medium ?? 0) > 0) {
    return "medium_alert_priority";
  }
  if ((roles?.counts?.withPendingReview ?? 0) > 0) {
    return "review_role_pressure";
  }
  if ((roles?.counts?.withBlockedOwnerWork ?? 0) > 0) {
    return "blocked_role_pressure";
  }
  if ((activity?.counts?.totalEntries ?? 0) > 0) {
    return "activity_visible";
  }
  return "default_focus_priority";
}

export function buildRuntimeSignalPackSummary(recommendedSurface, focus, alerts, activity, roles) {
  const detail =
    focus?.summary ??
    alerts?.summary ??
    roles?.summary ??
    activity?.summary ??
    "Runtime signal pack has no current signal detail.";
  return `Runtime signal pack recommends ${recommendedSurface} next. ${detail}`;
}

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
    metadata: {
      hasFocus: Boolean(nextEntries.focus),
      hasAlert: Boolean(nextEntries.alert),
      hasActivity: Boolean(nextEntries.activity),
      hasRole: Boolean(nextEntries.role)
    },
    counts: {
      surfacedNextEntries: Object.values(nextEntries).filter(Boolean).length
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
