import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  COORDINATION_PLANNER_PROFILE_ID,
  DEFAULT_PLANNER_PROFILE_ID,
  SHIPPED_PLANNER_PROFILE_SPECS,
  getShippedPlannerProfileIds
} from "./specs.js";
import {
  normalizePlannerProfile,
  toPlannerProfile
} from "./normalize.js";
import { selectPlannerProfile } from "./selection.js";

let registeredPlannerProfiles = [];
let registeredPlannerDefaultProfileId = null;

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

export {
  COORDINATION_PLANNER_PROFILE_ID,
  DEFAULT_PLANNER_PROFILE_ID,
  getShippedPlannerProfileIds,
  selectPlannerProfile,
  toPlannerProfile
};
