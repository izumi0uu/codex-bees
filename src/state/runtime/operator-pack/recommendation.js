import { buildPackRecommendationScore, buildPlannerAssessmentPackFactors } from "../recommendation/helpers.js";

export function buildRuntimeOperatorPackSummary(recommendedSurface, focus, alerts) {
  const detail =
    focus?.summary ??
    alerts?.summary ??
    'Runtime operator pack has no current operator detail.';
  const plannerAssessmentSummary = focus?.focus?.plannerAssessment?.summary ?? null;
  return `Runtime operator pack recommends ${recommendedSurface} next. ${detail}${plannerAssessmentSummary ? ` ${plannerAssessmentSummary}` : ""}`;
}

export function deriveRuntimeOperatorPackSurface({ focus, handoffs, closeout, dashboard, alerts }) {
  if (focus?.focus?.type === 'blocked_task' || focus?.focus?.type === 'review_task') {
    return 'runtime:focus';
  }
  if ((handoffs?.counts?.reviewDecisions ?? 0) > 0 || (handoffs?.counts?.blockedRecoveries ?? 0) > 0) {
    return 'runtime:handoffs';
  }
  if ((closeout?.counts?.totalReady ?? 0) > 0) {
    return 'runtime:closeout';
  }
  if ((alerts?.counts?.high ?? 0) > 0) {
    return 'runtime:alerts';
  }
  if ((dashboard?.counts?.tasks ?? 0) > 0 || (dashboard?.counts?.leaderQueueItems ?? 0) > 0) {
    return 'runtime:dashboard';
  }
  return 'runtime:focus';
}

export function deriveRuntimeOperatorPackReason({ focus, handoffs, closeout, dashboard, alerts }) {
  if (focus?.focus?.type === 'blocked_task') {
    return 'blocked_focus_priority';
  }
  if (focus?.focus?.type === 'review_task') {
    return 'review_focus_priority';
  }
  if ((handoffs?.counts?.reviewDecisions ?? 0) > 0) {
    return 'review_handoff_priority';
  }
  if ((handoffs?.counts?.blockedRecoveries ?? 0) > 0) {
    return 'blocked_recovery_priority';
  }
  if ((closeout?.counts?.totalReady ?? 0) > 0) {
    return 'closeout_priority';
  }
  if ((alerts?.counts?.high ?? 0) > 0) {
    return 'high_alert_priority';
  }
  if ((dashboard?.counts?.tasks ?? 0) > 0 || (dashboard?.counts?.leaderQueueItems ?? 0) > 0) {
    return 'dashboard_visibility';
  }
  return 'default_focus_priority';
}

export function buildRuntimeOperatorPackScoring({ focus, handoffs, closeout, dashboard, alerts }) {
  return buildPackRecommendationScore([
    {
      key: "operator_focus",
      surface: "runtime:focus",
      reason: focus?.focus?.type === "review_task" ? "review_focus_priority" : "blocked_focus_priority",
      summary: focus?.summary ?? null,
      factors: [
        { key: "focus_priority_score", value: focus?.focus?.priorityScore ?? 0, weight: 1, active: Boolean(focus?.focus) },
        ...buildPlannerAssessmentPackFactors(focus?.focus?.plannerAssessment ?? null, {
          keyPrefix: "operator_focus",
          executionWeight: 6,
          coordinationWeight: 7,
          verificationWeight: 10,
          publicWeight: 7
        })
      ]
    },
    {
      key: "operator_handoffs_review",
      surface: "runtime:handoffs",
      reason: "review_handoff_priority",
      summary: handoffs?.summary ?? null,
      factors: [
        { key: "review_decisions", value: handoffs?.counts?.reviewDecisions ?? 0, weight: 14, active: (handoffs?.counts?.reviewDecisions ?? 0) > 0 }
      ]
    },
    {
      key: "operator_handoffs_recovery",
      surface: "runtime:handoffs",
      reason: "blocked_recovery_priority",
      summary: handoffs?.summary ?? null,
      factors: [
        { key: "blocked_recoveries", value: handoffs?.counts?.blockedRecoveries ?? 0, weight: 12, active: (handoffs?.counts?.blockedRecoveries ?? 0) > 0 }
      ]
    },
    {
      key: "operator_closeout",
      surface: "runtime:closeout",
      reason: "closeout_priority",
      summary: closeout?.summary ?? null,
      factors: [
        { key: "closeout_ready", value: closeout?.counts?.totalReady ?? 0, weight: 10, active: (closeout?.counts?.totalReady ?? 0) > 0 }
      ]
    },
    {
      key: "operator_alerts",
      surface: "runtime:alerts",
      reason: "high_alert_priority",
      summary: alerts?.summary ?? null,
      factors: [
        { key: "high_alerts", value: alerts?.counts?.high ?? 0, weight: 9, active: (alerts?.counts?.high ?? 0) > 0 }
      ]
    },
    {
      key: "operator_dashboard",
      surface: "runtime:dashboard",
      reason: "dashboard_visibility",
      summary: dashboard?.summary ?? null,
      factors: [
        { key: "dashboard_tasks", value: dashboard?.counts?.tasks ?? 0, weight: 4, active: (dashboard?.counts?.tasks ?? 0) > 0 },
        { key: "dashboard_queue", value: dashboard?.counts?.leaderQueueItems ?? 0, weight: 4, active: (dashboard?.counts?.leaderQueueItems ?? 0) > 0 }
      ]
    }
  ]);
}
