import { getRuntimeCatalogPaths } from "./catalog.js";
import { buildPlannerProvenance } from "./planner-provenance.js";
import {
  buildPlanLanes,
  buildPlannerOrchestration,
  derivePlannerStrategy
} from "./planner-lanes.js";
import {
  chooseDiscoveryScope,
  chooseDocumentationScope,
  choosePrimaryScope,
  chooseVerificationScope,
  directoryExists,
  inferPlannerIntent,
  runtimeRoleFilePath
} from "./planner-scope.js";
import {
  DEFAULT_PLANNER_PROFILE_ID,
  getPlannerProfileRecord,
  getPlannerProfilesRecords,
  registerPlannerProfile,
  registerPlannerProfiles,
  resetRegisteredPlannerProfiles,
  resolvePlannerProfileContext,
  selectPlannerProfile,
  toPlannerProfile
} from "./planner-registry.js";
import { createCollectionView, createResolvedItemView } from "./state-view-helpers.js";

function plannerEvidenceForProfile(task, plannerProfile = getPlannerProfileRecord(DEFAULT_PLANNER_PROFILE_ID)) {
  const catalogPaths = getRuntimeCatalogPaths();
  const implementationScope = choosePrimaryScope(task);
  const intent = inferPlannerIntent(task, implementationScope);
  const strategy = derivePlannerStrategy(task, implementationScope, intent, plannerProfile);
  const documentationScope = strategy.needsDocumentation || intent.docsOnly
    ? chooseDocumentationScope(implementationScope)
    : [];
  const verificationScope = strategy.needsVerification ? chooseVerificationScope(task, implementationScope) : [];

  return {
    task,
    intent,
    strategy,
    repoSignals: {
      hasSrc: directoryExists("src"),
      hasScripts: directoryExists("scripts"),
      hasAgents: directoryExists(catalogPaths.agentDir),
      hasSkills: directoryExists(catalogPaths.skillDir)
    },
    scopeHints: {
      primary: implementationScope,
      discovery: strategy.needsDiscovery ? chooseDiscoveryScope(implementationScope) : [],
      verification: verificationScope,
      documentation: documentationScope
    },
    roleFiles: ["explore", "executor", "reviewer", "tester"]
      .map((role) => ({ role, path: runtimeRoleFilePath(role) }))
      .filter((entry) => entry.path)
  };
}

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

export function planTask(task, options = {}) {
  const plannerContext = resolvePlannerProfileContext(options);
  const plannerSelection = selectPlannerProfile(task, options.profileId, plannerContext);
  const profile = getPlannerProfileRecord(plannerSelection.resolvedProfile, options);
  const planner = toPlannerProfile(profile);
  const lanes = buildPlanLanes(task, profile);
  const orchestration = buildPlannerOrchestration(lanes);
  const recommendedReason = lanes.length > 1 ? "multi_lane_plan_ready" : "single_lane_plan_ready";

  return {
    kind: "task_plan",
    recommendedReason,
    objective: task,
    requestedProfile: plannerSelection.requestedProfile,
    planner,
    plannerSelection,
    evidence: plannerEvidenceForProfile(task, profile),
    orchestration,
    lanes
  };
}

export function planSwarm(task, options = {}) {
  const plan = planTask(task, options);
  const recommendedReason = plan.lanes.length > 1 ? "multi_lane_swarm_ready" : "single_lane_swarm_ready";
  const plannerProvenance = buildPlannerProvenance({
    requestedProfile: plan.requestedProfile,
    planner: plan.planner,
    plannerSelection: plan.plannerSelection
  });
  return {
    kind: "planned_swarm",
    recommendedReason,
    objective: task,
    requestedProfile: plan.requestedProfile,
    planner: plan.planner,
    plannerSelection: plan.plannerSelection,
    evidence: plan.evidence,
    orchestration: plan.orchestration,
    swarm: {
      objective: task,
      topology: plan.planner.topology,
      maxWorkers: plan.orchestration.maxWorkers,
      executionShape: plan.orchestration.executionShape,
      waveCount: plan.orchestration.waveCount,
      waves: plan.orchestration.waves,
      laneSource: plan.planner.laneSource,
      plannerProvenance,
      lanes: plan.lanes,
      notes: `Generated from plan for: ${task}`
    }
  };
}

export function queueTasksFromPlan(task, addTasks, options = {}) {
  const plan = planTask(task, options);
  const plannerProvenance = buildPlannerProvenance({
    requestedProfile: plan.requestedProfile,
    planner: plan.planner,
    plannerSelection: plan.plannerSelection
  });
  const tasks = plan.lanes.map((lane) => ({
    title: lane.summary,
    status: "todo",
    queueStatus: "queued",
    owner: lane.owner,
    verifier: lane.verifier,
    objective: task,
    lane: lane.lane,
    lanePurpose: lane.purpose,
    plannerProvenance,
    scope: lane.scope,
    dependsOn: lane.dependsOn ?? null,
    acceptance: lane.acceptance,
    verification: lane.verification,
    notes: `Generated from plan for: ${task}`
  }));

  const created = addTasks(tasks);
  const recommendedReason = created.length > 1 ? "multiple_plan_tasks_queued" : "single_plan_task_queued";
  return {
    kind: "queued_plan",
    recommendedReason,
    objective: task,
    requestedProfile: plan.requestedProfile,
    planner: plan.planner,
    plannerSelection: plan.plannerSelection,
    orchestration: plan.orchestration,
    lanes: plan.lanes,
    created
  };
}

export function queueSwarmFromPlan(task, { initSwarm, queueSwarmTasks }, options = {}) {
  const planned = planSwarm(task, options);
  const swarm = initSwarm(planned.swarm);
  const queued = queueSwarmTasks({ id: swarm.id });
  if (!queued || queued.error) {
    return queued;
  }

  return {
    kind: "queued_plan_swarm",
    recommendedReason: queued.created.length > 1 ? "multiple_swarm_lane_tasks_queued" : "single_swarm_lane_task_queued",
    objective: task,
    requestedProfile: planned.requestedProfile,
    planner: planned.planner,
    plannerSelection: planned.plannerSelection,
    evidence: planned.evidence,
    orchestration: planned.orchestration,
    swarm: queued.swarm,
    created: queued.created
  };
}

export { registerPlannerProfile, registerPlannerProfiles };

export function resetPlannerProfiles() {
  resetRegisteredPlannerProfiles();
}
