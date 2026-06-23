import {
  COORDINATION_PLANNER_PROFILE_ID,
  COORDINATION_SIGNAL_TERMS
} from "./planner-profile-specs.js";

function buildPlannerProfileMatch(profile, taskLower) {
  const matchedKeywords = profile.selectionHints.keywords.filter((keyword) => taskLower.includes(keyword));
  const matchedCoordinationBias =
    profile.planningHints.coordinationBias &&
    COORDINATION_SIGNAL_TERMS.some((term) => taskLower.includes(term));
  return {
    profileId: profile.id,
    sourceKind: profile.sourceKind ?? "shipped",
    priority: profile.selectionHints.priority,
    matchedKeywords,
    matchedCoordinationBias,
    matchCount: matchedKeywords.length + (matchedCoordinationBias ? 1 : 0)
  };
}

function rankPlannerProfileMatches(task, context) {
  const lower = typeof task === "string" ? task.toLowerCase() : "";
  return Array.from(context.registry.values())
    .filter((profile) => profile.id !== context.defaultProfileId)
    .map((profile) => buildPlannerProfileMatch(profile, lower))
    .filter((entry) => entry.matchCount > 0)
    .sort((left, right) => {
      const priorityDelta = right.priority - left.priority;
      if (priorityDelta !== 0) {
        return priorityDelta;
      }
      const matchDelta = right.matchCount - left.matchCount;
      if (matchDelta !== 0) {
        return matchDelta;
      }
      return left.profileId.localeCompare(right.profileId);
    });
}

function toPlannerSelectionPayload({
  inputProfile,
  requestedProfile,
  resolvedProfile,
  usedDefaultProfile,
  selectionMode,
  reason,
  context,
  heuristicMatches
}) {
  const resolvedProfileRecord = context.registry.get(resolvedProfile) ?? null;
  const resolvedMatch =
    heuristicMatches.find((entry) => entry.profileId === resolvedProfile) ??
    buildPlannerProfileMatch(
      resolvedProfileRecord ??
        context.registry.get(context.defaultProfileId) ?? {
          id: resolvedProfile,
          selectionHints: { keywords: [], priority: 0 },
          planningHints: { coordinationBias: false }
        },
      ""
    );

  return {
    inputProfile,
    requestedProfile,
    resolvedProfile,
    resolvedSourceKind: resolvedProfileRecord?.sourceKind ?? null,
    defaultProfile: context.defaultProfileId,
    availableProfiles: Array.from(context.registry.keys()),
    profileFiles: [...context.profileFiles],
    usedDefaultProfile,
    selectionMode,
    reason,
    matchedSignals: {
      keywords: [...resolvedMatch.matchedKeywords],
      coordinationBias: resolvedMatch.matchedCoordinationBias
    },
    heuristicMatches
  };
}

export function selectPlannerProfile(task, profileId, context) {
  const trimmedProfileId =
    typeof profileId === "string" && profileId.trim().length > 0
      ? profileId.trim()
      : null;
  const heuristicMatches = rankPlannerProfileMatches(task, context);

  if (trimmedProfileId) {
    const resolvedProfile = context.registry.has(trimmedProfileId)
      ? trimmedProfileId
      : context.defaultProfileId;
    return toPlannerSelectionPayload({
      inputProfile: trimmedProfileId,
      requestedProfile: trimmedProfileId,
      resolvedProfile,
      usedDefaultProfile: resolvedProfile !== trimmedProfileId,
      selectionMode: resolvedProfile === trimmedProfileId ? "explicit" : "fallback",
      reason:
        resolvedProfile === trimmedProfileId
          ? "explicit_profile_requested"
          : "missing_profile_fallback",
      context,
      heuristicMatches
    });
  }

  const inferredProfile = heuristicMatches[0]?.profileId ?? context.defaultProfileId;

  return toPlannerSelectionPayload({
    inputProfile: null,
    requestedProfile: inferredProfile,
    resolvedProfile: inferredProfile,
    usedDefaultProfile: false,
    selectionMode: "heuristic",
    reason:
      inferredProfile === COORDINATION_PLANNER_PROFILE_ID
        ? "coordination_profile_inferred"
        : inferredProfile === context.defaultProfileId
          ? "default_profile_inferred"
          : "profile_hint_inferred",
    context,
    heuristicMatches
  });
}
