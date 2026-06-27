import { buildPackRecommendationScore, buildPlannerAssessmentPackFactors } from "../recommendation/helpers.js";

export function deriveRuntimeSummaryPackSurface({ focus, recovery, closeout, handoffs, dashboard }) {
  if (focus?.focus?.type === 'blocked_task') {
    return 'runtime:focus';
  }
  if ((recovery?.counts?.totalEntries ?? 0) > 0) {
    return 'runtime:recovery';
  }
  if ((handoffs?.counts?.totalHandoffs ?? 0) > 0) {
    return 'runtime:handoffs';
  }
  if ((closeout?.counts?.totalReady ?? 0) > 0) {
    return 'runtime:closeout';
  }
  if ((dashboard?.counts?.leaderQueueItems ?? 0) > 0) {
    return 'runtime:dashboard';
  }
  return 'runtime:focus';
}

export function deriveRuntimeSummaryPackReason({ focus, recovery, closeout, handoffs, dashboard }) {
  if (focus?.focus?.type === 'blocked_task') {
    return 'blocked_focus_priority';
  }
  if ((recovery?.counts?.totalEntries ?? 0) > 0) {
    return 'recovery_work_waiting';
  }
  if ((handoffs?.counts?.totalHandoffs ?? 0) > 0) {
    return 'handoffs_waiting';
  }
  if ((closeout?.counts?.totalReady ?? 0) > 0) {
    return 'closeout_ready';
  }
  if ((dashboard?.counts?.leaderQueueItems ?? 0) > 0) {
    return 'dashboard_queue_visible';
  }
  return 'no_higher_priority_runtime_signal';
}

export function buildRuntimeSummaryPackSummary(recommendedSurface, focus) {
  const detail = focus?.summary ?? 'Runtime summary pack has no current focus detail.';
  const plannerAssessmentSummary = focus?.focus?.plannerAssessment?.summary ?? null;
  return `Runtime summary pack recommends ${recommendedSurface} next. ${detail}${plannerAssessmentSummary ? ` ${plannerAssessmentSummary}` : ""}`;
}

export function buildRuntimeSummaryPackScoring({ focus, recovery, closeout, handoffs, dashboard }) {
  return buildPackRecommendationScore([
    {
      key: "runtime_focus",
      surface: "runtime:focus",
      reason: "blocked_focus_priority",
      summary: focus?.summary ?? null,
      factors: [
        { key: "focus_priority_score", value: focus?.focus?.priorityScore ?? 0, weight: 1, active: Boolean(focus?.focus) },
        ...buildPlannerAssessmentPackFactors(focus?.focus?.plannerAssessment ?? null, {
          keyPrefix: "summary_focus",
          executionWeight: 6,
          coordinationWeight: 7,
          verificationWeight: 10,
          publicWeight: 7
        })
      ]
    },
    {
      key: "runtime_recovery",
      surface: "runtime:recovery",
      reason: "recovery_work_waiting",
      summary: recovery?.summary ?? null,
      factors: [
        { key: "recovery_entries", value: recovery?.counts?.totalEntries ?? 0, weight: 20, active: (recovery?.counts?.totalEntries ?? 0) > 0 }
      ]
    },
    {
      key: "runtime_handoffs",
      surface: "runtime:handoffs",
      reason: "handoffs_waiting",
      summary: handoffs?.summary ?? null,
      factors: [
        { key: "handoff_entries", value: handoffs?.counts?.totalHandoffs ?? 0, weight: 14, active: (handoffs?.counts?.totalHandoffs ?? 0) > 0 }
      ]
    },
    {
      key: "runtime_closeout",
      surface: "runtime:closeout",
      reason: "closeout_ready",
      summary: closeout?.summary ?? null,
      factors: [
        { key: "closeout_ready", value: closeout?.counts?.totalReady ?? 0, weight: 12, active: (closeout?.counts?.totalReady ?? 0) > 0 }
      ]
    },
    {
      key: "runtime_dashboard",
      surface: "runtime:dashboard",
      reason: "dashboard_queue_visible",
      summary: dashboard?.summary ?? null,
      factors: [
        { key: "leader_queue_items", value: dashboard?.counts?.leaderQueueItems ?? 0, weight: 6, active: (dashboard?.counts?.leaderQueueItems ?? 0) > 0 }
      ]
    }
  ]);
}
