import { buildPackRecommendationScore } from "../recommendation/helpers.js";

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

export function buildRuntimeSignalPackScoring({ focus, alerts, activity, roles }) {
  return buildPackRecommendationScore([
    {
      key: "runtime_focus_blocked",
      surface: "runtime:focus",
      reason: "blocked_focus_priority",
      summary: focus?.summary ?? null,
      factors: [
        { key: "blocked_focus", value: focus?.focus?.priorityScore ?? 0, weight: 1, active: focus?.focus?.type === "blocked_task" }
      ]
    },
    {
      key: "runtime_focus_review",
      surface: "runtime:focus",
      reason: "review_focus_priority",
      summary: focus?.summary ?? null,
      factors: [
        { key: "review_focus", value: focus?.focus?.priorityScore ?? 0, weight: 1, active: focus?.focus?.type === "review_task" }
      ]
    },
    {
      key: "runtime_alerts",
      surface: "runtime:alerts",
      reason: (alerts?.counts?.high ?? 0) > 0 ? "high_alert_priority" : "medium_alert_priority",
      summary: alerts?.summary ?? null,
      factors: [
        { key: "high_alerts", value: alerts?.counts?.high ?? 0, weight: 25, active: (alerts?.counts?.high ?? 0) > 0 },
        { key: "medium_alerts", value: alerts?.counts?.medium ?? 0, weight: 12, active: (alerts?.counts?.medium ?? 0) > 0 }
      ]
    },
    {
      key: "runtime_roles",
      surface: "runtime:roles",
      reason: (roles?.counts?.withPendingReview ?? 0) > 0 ? "review_role_pressure" : "blocked_role_pressure",
      summary: roles?.summary ?? null,
      factors: [
        { key: "roles_pending_review", value: roles?.counts?.withPendingReview ?? 0, weight: 18, active: (roles?.counts?.withPendingReview ?? 0) > 0 },
        { key: "roles_blocked_owner", value: roles?.counts?.withBlockedOwnerWork ?? 0, weight: 15, active: (roles?.counts?.withBlockedOwnerWork ?? 0) > 0 }
      ]
    },
    {
      key: "runtime_activity",
      surface: "runtime:activity",
      reason: "activity_visible",
      summary: activity?.summary ?? null,
      factors: [
        { key: "activity_entries", value: activity?.counts?.totalEntries ?? 0, weight: 4, active: (activity?.counts?.totalEntries ?? 0) > 0 }
      ]
    }
  ]);
}
