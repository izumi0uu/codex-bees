import { resolvePlannerProfileContext } from "./registry.js";
import { selectPlannerProfile } from "./selection.js";

function cloneSelectionCandidates(selection) {
  return Array.isArray(selection?.selectionCandidates)
    ? selection.selectionCandidates.map((candidate) => ({
        ...candidate,
        scoreBreakdown: { ...(candidate?.scoreBreakdown ?? {}) },
        matchedKeywords: [...(candidate?.matchedKeywords ?? [])],
        matchedTaskClasses: [...(candidate?.matchedTaskClasses ?? [])],
        matchedIntentTags: [...(candidate?.matchedIntentTags ?? [])],
        matchedScopePrefixes: [...(candidate?.matchedScopePrefixes ?? [])]
      }))
    : [];
}

export function buildPlannerProfileRankingView(task, selection) {
  const profiles = cloneSelectionCandidates(selection);
  const topProfile = profiles[0] ?? null;

  return {
    kind: "planner_profile_ranking_view",
    recommendedReason: selection?.reason ?? "planner_profile_ranking_loaded",
    task,
    counts: {
      totalCandidates: profiles.length,
      matchedSignalCount: selection?.matchedSignalCount ?? 0
    },
    inputProfile: selection?.inputProfile ?? null,
    requestedProfile: selection?.requestedProfile ?? null,
    resolvedProfile: selection?.resolvedProfile ?? null,
    resolvedSourceKind: selection?.resolvedSourceKind ?? null,
    defaultProfile: selection?.defaultProfile ?? null,
    availableProfiles: [...(selection?.availableProfiles ?? [])],
    profileFiles: [...(selection?.profileFiles ?? [])],
    selectionMode: selection?.selectionMode ?? null,
    usedDefaultProfile: selection?.usedDefaultProfile ?? false,
    selectionContext: {
      taskClass: selection?.selectionContext?.taskClass ?? null,
      laneStrategy: selection?.selectionContext?.laneStrategy ?? null,
      implementationScope: [...(selection?.selectionContext?.implementationScope ?? [])],
      intentTags: [...(selection?.selectionContext?.intentTags ?? [])]
    },
    matchedSignals: {
      keywords: [...(selection?.matchedSignals?.keywords ?? [])],
      taskClasses: [...(selection?.matchedSignals?.taskClasses ?? [])],
      intentTags: [...(selection?.matchedSignals?.intentTags ?? [])],
      scopePrefixes: [...(selection?.matchedSignals?.scopePrefixes ?? [])],
      coordinationBias: selection?.matchedSignals?.coordinationBias ?? false
    },
    selectionScore: selection?.selectionScore ?? 0,
    selectionScoreBreakdown: { ...(selection?.selectionScoreBreakdown ?? {}) },
    profiles,
    summary: topProfile
      ? `${topProfile.profileId} is the top planner profile for "${task}" (${selection?.selectionContext?.taskClass ?? "general"} / ${selection?.selectionContext?.laneStrategy ?? "plan"}).`
      : `No non-default planner profile signals matched "${task}"; ${selection?.resolvedProfile ?? selection?.defaultProfile ?? "default"} remains selected.`
  };
}

export function getPlannerProfileRankingView(task, options = {}) {
  const context = resolvePlannerProfileContext(options);
  const selection = selectPlannerProfile(task, options.profileId, context);
  return buildPlannerProfileRankingView(task, selection);
}
