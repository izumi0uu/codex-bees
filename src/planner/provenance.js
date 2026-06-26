function clonePlannerSnapshot(planner) {
  if (!planner || typeof planner !== "object" || Array.isArray(planner)) {
    return null;
  }

  return {
    ...planner,
    roles: Array.isArray(planner.roles) ? [...planner.roles] : [],
    constraints: Array.isArray(planner.constraints) ? [...planner.constraints] : [],
    selectionHints: {
      keywords: Array.isArray(planner.selectionHints?.keywords) ? [...planner.selectionHints.keywords] : [],
      priority: Number.isFinite(Number(planner.selectionHints?.priority)) ? Number(planner.selectionHints.priority) : 0
    },
    planningHints: {
      documentationMode: planner.planningHints?.documentationMode ?? "serial",
      coordinationBias: planner.planningHints?.coordinationBias === true
    },
    sourceKind: planner.sourceKind ?? null,
    sourcePath: planner.sourcePath ?? null
  };
}

function clonePlannerSelectionSnapshot(selection) {
  if (!selection || typeof selection !== "object" || Array.isArray(selection)) {
    return null;
  }

  return {
    ...selection,
    availableProfiles: Array.isArray(selection.availableProfiles) ? [...selection.availableProfiles] : [],
    profileFiles: Array.isArray(selection.profileFiles) ? [...selection.profileFiles] : [],
    matchedSignals: {
      keywords: Array.isArray(selection.matchedSignals?.keywords) ? [...selection.matchedSignals.keywords] : [],
      coordinationBias: selection.matchedSignals?.coordinationBias === true
    },
    heuristicMatches: Array.isArray(selection.heuristicMatches)
      ? selection.heuristicMatches.map((entry) => ({
          ...entry,
          matchedKeywords: Array.isArray(entry?.matchedKeywords) ? [...entry.matchedKeywords] : [],
          matchedCoordinationBias: entry?.matchedCoordinationBias === true,
          matchCount: Number.isFinite(Number(entry?.matchCount)) ? Number(entry.matchCount) : 0,
          priority: Number.isFinite(Number(entry?.priority)) ? Number(entry.priority) : 0
        }))
      : []
  };
}

export function buildPlannerProvenance(value) {
  const planner = clonePlannerSnapshot(value?.planner);
  const plannerSelection = clonePlannerSelectionSnapshot(value?.plannerSelection);
  const requestedProfileCandidate =
    value?.requestedProfile ?? plannerSelection?.requestedProfile ?? null;
  const requestedProfile =
    typeof requestedProfileCandidate === "string" && requestedProfileCandidate.trim().length > 0
      ? requestedProfileCandidate.trim()
      : null;

  if (!requestedProfile && !planner && !plannerSelection) {
    return null;
  }

  return {
    requestedProfile,
    planner,
    plannerSelection
  };
}

export function hasPlannerProvenance(value) {
  return buildPlannerProvenance(value) !== null;
}

export function summarizePlannerProvenance(value) {
  const provenance = buildPlannerProvenance(value);
  if (!provenance) {
    return null;
  }

  return {
    requestedProfile: provenance.requestedProfile,
    plannerId: provenance.planner?.id ?? null,
    resolvedProfile:
      provenance.plannerSelection?.resolvedProfile ??
      provenance.planner?.id ??
      provenance.requestedProfile ??
      null,
    sourceKind: provenance.plannerSelection?.resolvedSourceKind ?? provenance.planner?.sourceKind ?? null,
    selectionMode: provenance.plannerSelection?.selectionMode ?? null,
    reason: provenance.plannerSelection?.reason ?? null,
    sourcePath: provenance.planner?.sourcePath ?? null,
    profileFiles: Array.isArray(provenance.plannerSelection?.profileFiles)
      ? [...provenance.plannerSelection.profileFiles]
      : []
  };
}
