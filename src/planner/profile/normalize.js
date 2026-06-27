function uniqueStrings(values = [], { lowerCase = false } = {}) {
  return Array.from(
    new Set(
      values
        .filter((value) => typeof value === "string")
        .map((value) => value.trim())
        .filter(Boolean)
        .map((value) => (lowerCase ? value.toLowerCase() : value))
    )
  );
}

function normalizeSelectionHints(selectionHints = {}, baseSelectionHints = {}) {
  const keywords = Array.isArray(selectionHints.keywords)
    ? selectionHints.keywords
    : Array.isArray(baseSelectionHints.keywords)
      ? baseSelectionHints.keywords
      : [];
  const taskClasses = Array.isArray(selectionHints.taskClasses)
    ? selectionHints.taskClasses
    : Array.isArray(baseSelectionHints.taskClasses)
      ? baseSelectionHints.taskClasses
      : [];
  const intentTags = Array.isArray(selectionHints.intentTags)
    ? selectionHints.intentTags
    : Array.isArray(baseSelectionHints.intentTags)
      ? baseSelectionHints.intentTags
      : [];
  const excludeIntentTags = Array.isArray(selectionHints.excludeIntentTags)
    ? selectionHints.excludeIntentTags
    : Array.isArray(baseSelectionHints.excludeIntentTags)
      ? baseSelectionHints.excludeIntentTags
      : [];
  const scopePrefixes = Array.isArray(selectionHints.scopePrefixes)
    ? selectionHints.scopePrefixes
    : Array.isArray(baseSelectionHints.scopePrefixes)
      ? baseSelectionHints.scopePrefixes
      : [];
  const priorityCandidate =
    selectionHints.priority ?? baseSelectionHints.priority ?? 0;

  return {
    keywords: uniqueStrings(keywords, { lowerCase: true }),
    taskClasses: uniqueStrings(taskClasses, { lowerCase: true }),
    intentTags: uniqueStrings(intentTags, { lowerCase: true }),
    excludeIntentTags: uniqueStrings(excludeIntentTags, { lowerCase: true }),
    scopePrefixes: uniqueStrings(scopePrefixes),
    priority: Number.isFinite(Number(priorityCandidate)) ? Number(priorityCandidate) : 0
  };
}

function normalizePlanningHints(planningHints = {}, basePlanningHints = {}) {
  const documentationModeCandidate =
    planningHints.documentationMode ?? basePlanningHints.documentationMode ?? "serial";
  const documentationMode =
    documentationModeCandidate === "discovery-sidecar" ? "discovery-sidecar" : "serial";
  const coordinationBiasCandidate =
    planningHints.coordinationBias ?? basePlanningHints.coordinationBias ?? false;

  return {
    documentationMode,
    coordinationBias: coordinationBiasCandidate === true
  };
}

export function normalizePlannerProfile(profile, registry, { sourceKind, sourcePath } = {}) {
  if (!profile || typeof profile !== "object" || Array.isArray(profile)) {
    throw new Error("Planner profile must be a plain object");
  }

  const id = typeof profile.id === "string" ? profile.id.trim() : "";
  if (!id) {
    throw new Error("Planner profile id is required");
  }

  const extendsId =
    typeof profile.extends === "string" && profile.extends.trim().length > 0
      ? profile.extends.trim()
      : null;
  const baseProfile = extendsId ? registry.get(extendsId) : registry.get(id);

  if (extendsId && !baseProfile) {
    throw new Error(`Unknown planner profile to extend: ${extendsId}`);
  }

  const description =
    typeof profile.description === "string" && profile.description.trim().length > 0
      ? profile.description.trim()
      : baseProfile?.description ?? null;
  const topology =
    typeof profile.topology === "string" && profile.topology.trim().length > 0
      ? profile.topology.trim()
      : baseProfile?.topology ?? "bounded-local";
  const laneSource =
    typeof profile.laneSource === "string" && profile.laneSource.trim().length > 0
      ? profile.laneSource.trim()
      : baseProfile?.laneSource ?? "planner";
  const laneModel =
    typeof profile.laneModel === "string" && profile.laneModel.trim().length > 0
      ? profile.laneModel.trim()
      : baseProfile?.laneModel ?? null;
  const executionModel =
    typeof profile.executionModel === "string" && profile.executionModel.trim().length > 0
      ? profile.executionModel.trim()
      : baseProfile?.executionModel ?? null;
  const roles = uniqueStrings(
    Array.isArray(profile.roles)
      ? profile.roles
      : Array.isArray(baseProfile?.roles)
        ? baseProfile.roles
        : []
  );
  const constraints = uniqueStrings(
    Array.isArray(profile.constraints)
      ? profile.constraints
      : Array.isArray(baseProfile?.constraints)
        ? baseProfile.constraints
        : []
  );
  const selectionHints = normalizeSelectionHints(profile.selectionHints, baseProfile?.selectionHints);
  const planningHints = normalizePlanningHints(profile.planningHints, baseProfile?.planningHints);

  if (!description) {
    throw new Error(`Planner profile ${id} is missing a description`);
  }
  if (!laneModel) {
    throw new Error(`Planner profile ${id} is missing a lane model`);
  }
  if (!executionModel) {
    throw new Error(`Planner profile ${id} is missing an execution model`);
  }
  if (roles.length === 0) {
    throw new Error(`Planner profile ${id} must declare at least one role`);
  }
  if (constraints.length === 0) {
    throw new Error(`Planner profile ${id} must declare at least one constraint`);
  }

  return {
    id,
    description,
    topology,
    laneSource,
    adaptive: profile.adaptive ?? baseProfile?.adaptive ?? true,
    laneModel,
    executionModel,
    roles,
    constraints,
    selectionHints,
    planningHints,
    sourceKind,
    sourcePath: sourcePath ?? null
  };
}

export function toPlannerProfile(profile) {
  return {
    id: profile.id,
    description: profile.description,
    topology: profile.topology,
    laneSource: profile.laneSource,
    adaptive: profile.adaptive,
    laneModel: profile.laneModel,
    executionModel: profile.executionModel,
    roles: [...profile.roles],
    constraints: [...profile.constraints],
    selectionHints: {
      keywords: [...profile.selectionHints.keywords],
      taskClasses: [...profile.selectionHints.taskClasses],
      intentTags: [...profile.selectionHints.intentTags],
      excludeIntentTags: [...profile.selectionHints.excludeIntentTags],
      scopePrefixes: [...profile.selectionHints.scopePrefixes],
      priority: profile.selectionHints.priority
    },
    planningHints: {
      documentationMode: profile.planningHints.documentationMode,
      coordinationBias: profile.planningHints.coordinationBias
    },
    sourceKind: profile.sourceKind ?? "shipped",
    sourcePath: profile.sourcePath ?? null
  };
}
