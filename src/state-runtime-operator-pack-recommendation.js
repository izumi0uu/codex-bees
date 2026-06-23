export function buildRuntimeOperatorPackSummary(recommendedSurface, focus, alerts) {
  const detail =
    focus?.summary ??
    alerts?.summary ??
    'Runtime operator pack has no current operator detail.';
  return `Runtime operator pack recommends ${recommendedSurface} next. ${detail}`;
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
