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
      taskClasses: Array.isArray(planner.selectionHints?.taskClasses) ? [...planner.selectionHints.taskClasses] : [],
      intentTags: Array.isArray(planner.selectionHints?.intentTags) ? [...planner.selectionHints.intentTags] : [],
      excludeIntentTags: Array.isArray(planner.selectionHints?.excludeIntentTags) ? [...planner.selectionHints.excludeIntentTags] : [],
      scopePrefixes: Array.isArray(planner.selectionHints?.scopePrefixes) ? [...planner.selectionHints.scopePrefixes] : [],
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

function clonePlannerAssessmentSnapshot(assessment) {
  if (!assessment || typeof assessment !== "object" || Array.isArray(assessment)) {
    return null;
  }

  return {
    ...assessment,
    scoreHints: { ...(assessment.scoreHints ?? {}) },
    signals: {
      ...(assessment.signals ?? {}),
      intentTags: Array.isArray(assessment.signals?.intentTags) ? [...assessment.signals.intentTags] : []
    }
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
    selectionContext: selection.selectionContext
      ? {
          ...selection.selectionContext,
          implementationScope: Array.isArray(selection.selectionContext.implementationScope)
            ? [...selection.selectionContext.implementationScope]
            : [],
          intentTags: Array.isArray(selection.selectionContext.intentTags)
            ? [...selection.selectionContext.intentTags]
            : []
        }
      : undefined,
    matchedSignals: {
      keywords: Array.isArray(selection.matchedSignals?.keywords) ? [...selection.matchedSignals.keywords] : [],
      taskClasses: Array.isArray(selection.matchedSignals?.taskClasses) ? [...selection.matchedSignals.taskClasses] : [],
      intentTags: Array.isArray(selection.matchedSignals?.intentTags) ? [...selection.matchedSignals.intentTags] : [],
      scopePrefixes: Array.isArray(selection.matchedSignals?.scopePrefixes) ? [...selection.matchedSignals.scopePrefixes] : [],
      coordinationBias: selection.matchedSignals?.coordinationBias === true
    },
    heuristicMatches: Array.isArray(selection.heuristicMatches)
      ? selection.heuristicMatches.map((entry) => ({
          ...entry,
          matchedKeywords: Array.isArray(entry?.matchedKeywords) ? [...entry.matchedKeywords] : [],
          matchedTaskClasses: Array.isArray(entry?.matchedTaskClasses) ? [...entry.matchedTaskClasses] : [],
          matchedIntentTags: Array.isArray(entry?.matchedIntentTags) ? [...entry.matchedIntentTags] : [],
          matchedScopePrefixes: Array.isArray(entry?.matchedScopePrefixes) ? [...entry.matchedScopePrefixes] : [],
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
  const assessment = clonePlannerAssessmentSnapshot(value?.assessment ?? value?.plannerAssessment);
  const requestedProfileCandidate =
    value?.requestedProfile ?? plannerSelection?.requestedProfile ?? null;
  const requestedProfile =
    typeof requestedProfileCandidate === "string" && requestedProfileCandidate.trim().length > 0
      ? requestedProfileCandidate.trim()
      : null;

  if (!requestedProfile && !planner && !plannerSelection && !assessment) {
    return null;
  }

  return {
    requestedProfile,
    planner,
    plannerSelection,
    assessment
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
    assessment: provenance.assessment ?? null,
    sourcePath: provenance.planner?.sourcePath ?? null,
    profileFiles: Array.isArray(provenance.plannerSelection?.profileFiles)
      ? [...provenance.plannerSelection.profileFiles]
      : []
  };
}
