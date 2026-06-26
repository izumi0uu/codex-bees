import { compareLanePurposes } from "../../state/queue/views.js";
import { buildRecommendedFieldsFromResult } from "../runtime/recommendation-helpers.js";
import { buildSwarmOverviewStatusFields } from "../../state/swarm/overview-status-helpers.js";
import { buildSwarmOrchestrationView, findLaneOrchestrationContext } from "../../state/swarm/orchestration.js";
import { createLoadedValueView } from "../../state-view-helpers.js";
import { buildHistoryView, buildPlanningView } from "../../state-view-metadata.js";

export function buildSwarmBriefView(
  id,
  {
    swarmOverview,
    getRuntimeCatalog,
    validateSwarmValue,
    runtimeRoleCatalog,
    recommendLaneAction,
    recommendSwarmAction,
    describeRole,
    buildSwarmHandoff,
    deriveSwarmBriefReason
  }
) {
  const overview = swarmOverview(id);
  if (!overview) {
    return null;
  }

  const catalog = getRuntimeCatalog();
  const validation = validateSwarmValue(overview.swarm, runtimeRoleCatalog());
  const orchestration = buildSwarmOrchestrationView(overview.swarm, overview.lanes);
  const swarmHistory = buildHistoryView(overview.swarm.history ?? [], { limit: 5, newestFirst: true });
  const lanes = overview.lanes.map((laneSummary) => {
    const task = laneSummary.taskId
      ? overview.tasks.find((item) => item.id === laneSummary.taskId) ?? null
      : overview.tasks.find((item) => item.lane === laneSummary.lane) ?? null;
    const laneRecommended = recommendLaneAction(laneSummary, task, overview.tasks);
    const laneOrchestration = findLaneOrchestrationContext(orchestration, laneSummary.lane);

    return {
      lane: laneSummary.lane,
      purpose: laneSummary.purpose ?? null,
      summary: laneSummary.summary,
      owner: describeRole(laneSummary.owner, catalog),
      verifier: describeRole(laneSummary.verifier, catalog),
      taskId: laneSummary.taskId,
      taskQueueStatus: task?.queueStatus ?? null,
      claimedBy: task?.claimedBy ?? null,
      scope: laneSummary.scope ?? [],
      dependsOn: laneSummary.dependsOn ?? [],
      dependencyReady: laneSummary.dependencyReady ?? true,
      dependencySummary: laneSummary.dependencySummary ?? null,
      acceptance: task?.acceptance ?? [],
      verification: task?.verification ?? [],
      ready: laneSummary.ready,
      done: laneSummary.done,
      wave: laneOrchestration?.wave ?? null,
      wavePosition: laneOrchestration?.wavePosition ?? null,
      waveStatus: laneOrchestration?.waveStatus ?? null,
      waveParallelizable: laneOrchestration?.waveParallelizable ?? null,
      waveLaneCount: laneOrchestration?.waveLaneCount ?? null,
      waveOwnerCount: laneOrchestration?.waveOwnerCount ?? null,
      ...buildRecommendedFieldsFromResult(laneRecommended)
    };
  });
  const recommended = recommendSwarmAction(overview, lanes);
  const recommendedReason = deriveSwarmBriefReason(recommended);

  return createLoadedValueView("swarm_execution_brief", "swarm", overview.swarm, {
    recommendedReason,
    counts: overview.counts,
    extra: {
      planning: buildPlanningView(overview.swarm.plannerProvenance),
      ...buildSwarmOverviewStatusFields(overview, {
        includeStatusAligned: true,
        includeReadyToComplete: true,
        includeDispatchableCount: true
      }),
      history: swarmHistory,
      orchestration,
      owner: describeRole(overview.swarm.owner, catalog),
      lanes,
      nextLane: lanes.find((lane) => lane.lane === overview.nextLane?.lane) ?? null,
      validation,
      leaderHandoff: buildSwarmHandoff(overview, recommended, orchestration),
      ...buildRecommendedFieldsFromResult(recommended)
    }
  });
}

export function buildSwarmBriefViewFromSources(id, sources) {
  return buildSwarmBriefView(id, sources);
}

export function buildSwarmBundleView(
  id,
  {
    swarmOverview,
    swarmBrief,
    taskReport,
    deriveSwarmBundleReason,
    buildSwarmBundleSummary
  }
) {
  const overview = swarmOverview(id);
  if (!overview) {
    return null;
  }

  const brief = swarmBrief(id);
  const orchestration = brief?.orchestration ?? buildSwarmOrchestrationView(overview.swarm, overview.lanes);
  const history = brief?.history ?? buildHistoryView(overview.swarm.history ?? [], { limit: 5, newestFirst: true });
  const laneBundles = overview.lanes
    .map((laneSummary) => {
      const task = laneSummary.taskId
        ? overview.tasks.find((item) => item.id === laneSummary.taskId) ?? null
        : overview.tasks.find((item) => item.lane === laneSummary.lane) ?? null;
      const laneOrchestration = findLaneOrchestrationContext(orchestration, laneSummary.lane);
      return {
        lane: laneSummary.lane,
        purpose: laneSummary.purpose ?? null,
        summary: laneSummary.summary,
        owner: laneSummary.owner,
        verifier: laneSummary.verifier,
        taskId: task?.id ?? null,
        queueStatus: task?.queueStatus ?? null,
        claimedBy: task?.claimedBy ?? null,
        dependsOn: laneSummary.dependsOn ?? [],
        dependencyReady: laneSummary.dependencyReady ?? true,
        ready: laneSummary.ready,
        done: laneSummary.done,
        wave: laneOrchestration?.wave ?? null,
        wavePosition: laneOrchestration?.wavePosition ?? null,
        waveStatus: laneOrchestration?.waveStatus ?? null,
        waveParallelizable: laneOrchestration?.waveParallelizable ?? null,
        report: task ? taskReport(task.id) : null
      };
    })
    .sort((left, right) => compareLanePurposes(left.purpose ?? null, right.purpose ?? null));
  const recommendedReason = deriveSwarmBundleReason({ overview, laneBundles });

  return createLoadedValueView("swarm_bundle", "swarm", overview.swarm, {
    recommendedReason,
    counts: overview.counts,
    extra: {
      brief,
      ...buildSwarmOverviewStatusFields(overview, {
        includeReadyToComplete: true
      }),
      history,
      orchestration,
      nextLane: overview.nextLane,
      lanes: laneBundles,
      summary: buildSwarmBundleSummary(overview, laneBundles)
    }
  });
}

export function buildSwarmBundleViewFromSources(id, sources) {
  return buildSwarmBundleView(id, sources);
}
