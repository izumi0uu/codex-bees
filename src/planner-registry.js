import { readFileSync } from "node:fs";
import { resolve } from "node:path";

export const DEFAULT_PLANNER_PROFILE_ID = "bounded-local";
export const COORDINATION_PLANNER_PROFILE_ID = "coordination-local";
const COORDINATION_SIGNAL_TERMS = [
  "swarm",
  "parallel",
  "dispatch",
  "orchestrate",
  "orchestration",
  "leader",
  "assignment",
  "handoff",
  "worker",
  "multi-agent",
  "multi agent"
];

const SHIPPED_PLANNER_PROFILE_SPECS = [
  {
    id: DEFAULT_PLANNER_PROFILE_ID,
    description: "Adaptive local bounded planner for Codex-only execution.",
    topology: "bounded-local",
    laneSource: "planner",
    adaptive: true,
    laneModel: "adaptive-bounded-lanes",
    executionModel: "dependency-wave-local",
    roles: ["explore", "reviewer", "executor", "tester"],
    constraints: [
      "codex-only runtime boundary",
      "disjoint lane ownership",
      "local state-backed task queue"
    ],
    selectionHints: {
      keywords: [],
      priority: 0
    },
    planningHints: {
      documentationMode: "serial",
      coordinationBias: false
    }
  },
  {
    id: COORDINATION_PLANNER_PROFILE_ID,
    description: "Parallel-biased bounded planner for swarm-heavy Codex coordination.",
    topology: "bounded-local",
    laneSource: "planner",
    adaptive: true,
    laneModel: "coordination-bounded-lanes",
    executionModel: "coordination-wave-local",
    roles: ["explore", "executor", "reviewer", "tester"],
    constraints: [
      "codex-only runtime boundary",
      "disjoint lane ownership",
      "wave-aware swarm launch sequencing",
      "local state-backed task queue"
    ],
    selectionHints: {
      keywords: [
        "swarm",
        "parallel",
        "dispatch",
        "orchestrate",
        "orchestration",
        "leader",
        "assignment",
        "handoff",
        "worker",
        "multi-agent",
        "multi agent"
      ],
      priority: 100
    },
    planningHints: {
      documentationMode: "discovery-sidecar",
      coordinationBias: true
    }
  }
];

let registeredPlannerProfiles = [];
let registeredPlannerDefaultProfileId = null;

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
  const priorityCandidate =
    selectionHints.priority ?? baseSelectionHints.priority ?? 0;

  return {
    keywords: uniqueStrings(keywords, { lowerCase: true }),
    priority: Number.isFinite(Number(priorityCandidate)) ? Number(priorityCandidate) : 0
  };
}

function normalizePlanningHints(planningHints = {}, basePlanningHints = {}) {
  const documentationModeCandidate = planningHints.documentationMode ?? basePlanningHints.documentationMode ?? "serial";
  const documentationMode = documentationModeCandidate === "discovery-sidecar" ? "discovery-sidecar" : "serial";
  const coordinationBiasCandidate = planningHints.coordinationBias ?? basePlanningHints.coordinationBias ?? false;

  return {
    documentationMode,
    coordinationBias: coordinationBiasCandidate === true
  };
}

function normalizePlannerProfile(profile, registry, { sourceKind, sourcePath } = {}) {
  if (!profile || typeof profile !== "object" || Array.isArray(profile)) {
    throw new Error("Planner profile must be a plain object");
  }

  const id = typeof profile.id === "string" ? profile.id.trim() : "";
  if (!id) {
    throw new Error("Planner profile id is required");
  }

  const extendsId = typeof profile.extends === "string" && profile.extends.trim().length > 0
    ? profile.extends.trim()
    : null;
  const baseProfile = extendsId ? registry.get(extendsId) : registry.get(id);

  if (extendsId && !baseProfile) {
    throw new Error(`Unknown planner profile to extend: ${extendsId}`);
  }

  const description = typeof profile.description === "string" && profile.description.trim().length > 0
    ? profile.description.trim()
    : baseProfile?.description ?? null;
  const topology = typeof profile.topology === "string" && profile.topology.trim().length > 0
    ? profile.topology.trim()
    : baseProfile?.topology ?? "bounded-local";
  const laneSource = typeof profile.laneSource === "string" && profile.laneSource.trim().length > 0
    ? profile.laneSource.trim()
    : baseProfile?.laneSource ?? "planner";
  const laneModel = typeof profile.laneModel === "string" && profile.laneModel.trim().length > 0
    ? profile.laneModel.trim()
    : baseProfile?.laneModel ?? null;
  const executionModel = typeof profile.executionModel === "string" && profile.executionModel.trim().length > 0
    ? profile.executionModel.trim()
    : baseProfile?.executionModel ?? null;
  const roles = uniqueStrings(
    Array.isArray(profile.roles) ? profile.roles : Array.isArray(baseProfile?.roles) ? baseProfile.roles : []
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

function createPlannerRegistry() {
  return new Map();
}

function registerProfilesIntoRegistry(registry, profiles, sourceMeta = {}) {
  const pending = profiles.slice();
  let progress = true;

  while (pending.length > 0 && progress) {
    progress = false;

    for (let index = 0; index < pending.length; ) {
      const profile = pending[index];
      const extendsId = typeof profile?.extends === "string" && profile.extends.trim().length > 0
        ? profile.extends.trim()
        : null;

      if (extendsId && !registry.has(extendsId)) {
        index += 1;
        continue;
      }

      const normalized = normalizePlannerProfile(profile, registry, sourceMeta);
      registry.set(normalized.id, normalized);
      pending.splice(index, 1);
      progress = true;
    }
  }

  if (pending.length > 0) {
    const unresolved = pending
      .map((profile) => typeof profile?.id === "string" ? profile.id.trim() : "<unknown>")
      .join(", ");
    throw new Error(`Unable to resolve planner profile inheritance for: ${unresolved}`);
  }
}

export function resetRegisteredPlannerProfiles() {
  registeredPlannerProfiles = [];
  registeredPlannerDefaultProfileId = null;
}

export function registerPlannerProfile(profile, options = {}) {
  registeredPlannerProfiles = [
    ...registeredPlannerProfiles.filter((entry) => entry.id !== profile?.id),
    profile
  ];
  if (typeof options.defaultProfileId === "string" && options.defaultProfileId.trim().length > 0) {
    registeredPlannerDefaultProfileId = options.defaultProfileId.trim();
  } else if (options.makeDefault === true && typeof profile?.id === "string") {
    registeredPlannerDefaultProfileId = profile.id.trim();
  }
  return profile;
}

export function registerPlannerProfiles(profiles = [], options = {}) {
  for (const profile of profiles) {
    registerPlannerProfile(profile, options);
  }
  return profiles;
}

export function readPlannerProfileFile(profileFile) {
  if (typeof profileFile !== "string" || profileFile.trim().length === 0) {
    throw new Error("Planner profile file path is required");
  }

  const resolvedPath = resolve(profileFile.trim());
  const raw = JSON.parse(readFileSync(resolvedPath, "utf8"));
  const profiles = Array.isArray(raw)
    ? raw
    : Array.isArray(raw?.profiles)
      ? raw.profiles
      : [raw];

  return {
    path: resolvedPath,
    defaultProfileId:
      typeof raw?.defaultProfileId === "string" && raw.defaultProfileId.trim().length > 0
        ? raw.defaultProfileId.trim()
        : typeof raw?.defaultProfile === "string" && raw.defaultProfile.trim().length > 0
          ? raw.defaultProfile.trim()
          : null,
    profiles
  };
}

export function resolvePlannerProfileContext(options = {}) {
  const registry = createPlannerRegistry();
  registerProfilesIntoRegistry(registry, SHIPPED_PLANNER_PROFILE_SPECS, { sourceKind: "shipped" });

  if (Array.isArray(registeredPlannerProfiles) && registeredPlannerProfiles.length > 0) {
    registerProfilesIntoRegistry(registry, registeredPlannerProfiles, { sourceKind: "registered" });
  }

  const profileFiles = [];
  let loadedDefaultProfileId = null;
  const requestedFiles = [
    ...(Array.isArray(options.profileFiles) ? options.profileFiles : []),
    ...(typeof options.profileFile === "string" ? [options.profileFile] : [])
  ].filter(Boolean);

  for (const profileFile of requestedFiles) {
    const fileConfig = readPlannerProfileFile(profileFile);
    profileFiles.push(fileConfig.path);
    registerProfilesIntoRegistry(registry, fileConfig.profiles, {
      sourceKind: "file",
      sourcePath: fileConfig.path
    });
    if (fileConfig.defaultProfileId) {
      loadedDefaultProfileId = fileConfig.defaultProfileId;
    }
  }

  const requestedDefaultProfileId =
    typeof options.defaultProfileId === "string" && options.defaultProfileId.trim().length > 0
      ? options.defaultProfileId.trim()
      : loadedDefaultProfileId ?? registeredPlannerDefaultProfileId ?? DEFAULT_PLANNER_PROFILE_ID;

  const defaultProfileId = registry.has(requestedDefaultProfileId)
    ? requestedDefaultProfileId
    : DEFAULT_PLANNER_PROFILE_ID;

  return {
    registry,
    defaultProfileId,
    profileFiles
  };
}

export function getPlannerProfileRecord(id = DEFAULT_PLANNER_PROFILE_ID, options = {}) {
  const context = resolvePlannerProfileContext(options);
  const profileId = typeof id === "string" && id.trim().length > 0 ? id.trim() : context.defaultProfileId;
  return context.registry.get(profileId) ?? context.registry.get(context.defaultProfileId);
}

export function getPlannerProfilesRecords(options = {}) {
  const context = resolvePlannerProfileContext(options);
  return {
    ...context,
    profiles: Array.from(context.registry.values())
  };
}

function buildPlannerProfileMatch(profile, taskLower) {
  const matchedKeywords = profile.selectionHints.keywords.filter((keyword) => taskLower.includes(keyword));
  const matchedCoordinationBias = profile.planningHints.coordinationBias && COORDINATION_SIGNAL_TERMS.some((term) => taskLower.includes(term));
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
      resolvedProfileRecord ?? context.registry.get(context.defaultProfileId) ?? { id: resolvedProfile, selectionHints: { keywords: [], priority: 0 }, planningHints: { coordinationBias: false } },
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

export function selectPlannerProfile(task, profileId, context = resolvePlannerProfileContext()) {
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

export function getShippedPlannerProfileIds() {
  return SHIPPED_PLANNER_PROFILE_SPECS.map((profile) => profile.id);
}
