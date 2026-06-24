import {
  DEFAULT_PLANNER_PROFILE_ID,
  getPlannerProfilesRecords,
  registerPlannerProfile,
  registerPlannerProfiles,
  resetRegisteredPlannerProfiles,
  resolvePlannerProfileContext,
  toPlannerProfile
} from "./planner-registry.js";
import { createCollectionView, createResolvedItemView } from "./state-view-helpers.js";

export function getPlannerProfiles(options = {}) {
  return getPlannerProfilesRecords(options).profiles.map(toPlannerProfile);
}

export function getPlannerProfile(id = DEFAULT_PLANNER_PROFILE_ID, options = {}) {
  const context = resolvePlannerProfileContext(options);
  const profileId = typeof id === "string" && id.trim().length > 0 ? id.trim() : context.defaultProfileId;
  const profile = context.registry.get(profileId);
  return profile ? toPlannerProfile(profile) : undefined;
}

export function getPlannerProfilesView(options = {}) {
  const context = getPlannerProfilesRecords(options);
  const profiles = context.profiles.map(toPlannerProfile);
  return createCollectionView("planner_profile_list_view", "profiles", profiles, {
    loadedReason: "planner_profiles_loaded",
    emptyReason: "planner_profiles_empty",
    counts: {
      totalProfiles: profiles.length
    },
    extra: {
      defaultProfile: context.defaultProfileId
    }
  });
}

export function getPlannerProfileView(id = DEFAULT_PLANNER_PROFILE_ID, options = {}) {
  const context = resolvePlannerProfileContext(options);
  const profileId = typeof id === "string" && id.trim().length > 0 ? id.trim() : context.defaultProfileId;
  const profile = getPlannerProfile(profileId, options);
  return createResolvedItemView("planner_profile_view", {
    requestLabel: "id",
    requestValue: profileId,
    matchedLabel: "matchedProfile",
    matchedValue: profile?.id,
    valueLabel: "profile",
    value: profile,
    loadedReason: "planner_profile_loaded",
    missingReason: "planner_profile_missing",
    extra: {
      defaultProfile: context.defaultProfileId
    }
  });
}

export { registerPlannerProfile, registerPlannerProfiles };

export function resetPlannerProfiles() {
  resetRegisteredPlannerProfiles();
}
