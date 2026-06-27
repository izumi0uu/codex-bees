function clonePlannerAssessment(assessment = null) {
  if (!assessment || typeof assessment !== "object") {
    return null;
  }

  return {
    ...assessment,
    scoreHints: { ...(assessment.scoreHints ?? {}) },
    signals: {
      ...(assessment.signals ?? {}),
      intentTags: [...(assessment.signals?.intentTags ?? [])]
    }
  };
}

function cloneRankingEntries(entries = []) {
  return entries.map((entry) => ({
    ...entry,
    dispatchScoreBreakdown: { ...(entry?.dispatchScoreBreakdown ?? {}) },
    plannerAssessment: clonePlannerAssessment(entry?.plannerAssessment ?? null)
  }));
}

function cloneFocusCandidates(candidates = []) {
  return candidates.map((candidate) => ({
    ...candidate,
    scoreBreakdown: { ...(candidate?.scoreBreakdown ?? {}) },
    priorityScoreBreakdown: { ...(candidate?.priorityScoreBreakdown ?? {}) },
    focus: candidate?.focus
      ? {
          ...candidate.focus,
          plannerAssessment: clonePlannerAssessment(candidate.focus?.plannerAssessment ?? null),
          scoreInput: { ...(candidate.focus?.scoreInput ?? {}) }
        }
      : candidate?.focus
  }));
}

export function buildLeaderAssignmentRankingView(assignmentsView) {
  const assignments = cloneRankingEntries(assignmentsView?.ranking ?? []);
  const topAssignment = assignments[0] ?? null;

  return {
    kind: "leader_assignment_ranking_view",
    recommendedReason: assignmentsView?.recommendedReason ?? "leader_assignment_ranking_loaded",
    filters: { ...(assignmentsView?.filters ?? {}) },
    counts: {
      totalAssignments: assignmentsView?.counts?.totalAssignments ?? assignments.length,
      ownerGroups: assignmentsView?.counts?.ownerGroups ?? 0
    },
    next: assignmentsView?.next ?? null,
    assignments,
    summary: topAssignment
      ? `${topAssignment.lane} from ${topAssignment.swarmId} is the top leader assignment.`
      : "Leader assignment ranking has no dispatchable work right now."
  };
}

export function buildRuntimeDispatchRankingView(dispatchView) {
  const assignments = cloneRankingEntries(dispatchView?.ranking ?? []);
  const topAssignment = assignments[0] ?? null;

  return {
    kind: "runtime_dispatch_ranking_view",
    recommendedReason: dispatchView?.recommendedReason ?? "runtime_dispatch_ranking_loaded",
    counts: {
      ownerGroups: dispatchView?.counts?.ownerGroups ?? 0,
      totalAssignments: dispatchView?.counts?.totalAssignments ?? assignments.length
    },
    next: dispatchView?.next ?? null,
    assignments,
    summary: topAssignment
      ? `${topAssignment.lane} from ${topAssignment.swarmId} is the top runtime dispatch candidate.`
      : "Runtime dispatch ranking has no owner-grouped work ready right now."
  };
}

export function buildRuntimeFocusCandidatesView(focusView) {
  const candidates = cloneFocusCandidates(focusView?.candidates ?? []);
  const topCandidate = candidates[0] ?? null;

  return {
    kind: "runtime_focus_candidates_view",
    recommendedReason: focusView?.recommendedReason ?? "runtime_focus_candidates_loaded",
    counts: {
      totalCandidates: candidates.length
    },
    focus: focusView?.focus ?? null,
    priorityScore: focusView?.priorityScore ?? focusView?.focus?.priorityScore ?? 0,
    priorityScoreBreakdown: {
      ...(focusView?.priorityScoreBreakdown ?? focusView?.focus?.priorityScoreBreakdown ?? {})
    },
    candidates,
    summary: topCandidate
      ? `${topCandidate.key} is the current top runtime focus candidate.`
      : "Runtime focus has no active candidates right now."
  };
}
