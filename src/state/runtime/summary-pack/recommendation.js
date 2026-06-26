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
  return `Runtime summary pack recommends ${recommendedSurface} next. ${detail}`;
}
