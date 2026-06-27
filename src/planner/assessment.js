import { buildWeightedScore } from "../state/core/priority-score.js";

function toBand(score, { medium = 20, high = 50 } = {}) {
  if (score >= high) {
    return "high";
  }
  if (score >= medium) {
    return "medium";
  }
  return "low";
}

function uniqueStrings(values = []) {
  return Array.from(new Set(values.filter(Boolean)));
}

function countLanesByPurpose(lanes = [], purpose) {
  return lanes.filter((lane) => lane?.purpose === purpose).length;
}

function buildAssessmentSummary({
  taskClass,
  complexity,
  coordinationIntensity,
  publicSurfaceRisk,
  verificationPressure,
  executionPressure,
  dispatchBias,
  recommendedParallelism
}) {
  return `${taskClass} plan is ${complexity} complexity with ${coordinationIntensity} coordination pressure, ${publicSurfaceRisk} public-surface risk, ${verificationPressure} verification pressure, ${executionPressure} execution pressure, and ${dispatchBias} dispatch bias (parallelism ${recommendedParallelism}).`;
}

export function buildPlannerAssessment({
  plannerSelection,
  evidence,
  lanes = [],
  orchestration = {}
} = {}) {
  const selectionContext = plannerSelection?.selectionContext ?? {};
  const strategy = evidence?.strategy ?? {};
  const intentTags = uniqueStrings(selectionContext.intentTags ?? []);
  const taskClass = selectionContext.taskClass ?? strategy.taskClass ?? "general";
  const laneStrategy = selectionContext.laneStrategy ?? strategy.laneStrategy ?? "implement-verify";
  const primaryScopeCount = evidence?.scopeHints?.primary?.length ?? 0;
  const discoveryScopeCount = evidence?.scopeHints?.discovery?.length ?? 0;
  const verificationScopeCount = evidence?.scopeHints?.verification?.length ?? 0;
  const documentationScopeCount = evidence?.scopeHints?.documentation?.length ?? 0;
  const laneCount = lanes.length;
  const waveCount = Number(orchestration?.waveCount ?? 0) || 0;
  const peakParallelOwners = Number(orchestration?.peakParallelOwners ?? 0) || 0;
  const peakParallelLanes = Number(orchestration?.peakParallelLanes ?? 0) || 0;
  const discoveryLaneCount = countLanesByPurpose(lanes, "discovery");
  const implementationLaneCount = countLanesByPurpose(lanes, "implementation");
  const verificationLaneCount = countLanesByPurpose(lanes, "verification");
  const documentationLaneCount = countLanesByPurpose(lanes, "documentation");
  const publicSurface = strategy.publicSurface === true;

  const complexityScore = buildWeightedScore([
    {
      key: "primary_scope_count",
      value: primaryScopeCount,
      weight: 10,
      active: primaryScopeCount > 0
    },
    {
      key: "lane_count",
      value: laneCount,
      weight: 8,
      active: laneCount > 0
    },
    {
      key: "wave_count",
      value: waveCount,
      weight: 6,
      active: waveCount > 0
    },
    {
      key: "discovery_scope",
      value: discoveryScopeCount,
      weight: 5,
      active: discoveryScopeCount > 0
    },
    {
      key: "documentation_scope",
      value: documentationScopeCount,
      weight: 4,
      active: documentationScopeCount > 0
    },
    {
      key: "public_surface",
      value: 1,
      weight: 18,
      active: publicSurface
    },
    {
      key: "verification_scope",
      value: verificationScopeCount,
      weight: 7,
      active: verificationScopeCount > 0
    }
  ]);

  const coordinationScore = buildWeightedScore([
    {
      key: "coordination_task_class",
      value: 1,
      weight: 30,
      active: taskClass === "coordination-kernel"
    },
    {
      key: "dispatch_intent",
      value: intentTags.filter((tag) => ["coordination", "dispatch-flow", "review-flow", "swarm-flow"].includes(tag)).length,
      weight: 12,
      active: intentTags.some((tag) => ["coordination", "dispatch-flow", "review-flow", "swarm-flow"].includes(tag))
    },
    {
      key: "peak_parallel_owners",
      value: peakParallelOwners,
      weight: 10,
      active: peakParallelOwners > 0
    },
    {
      key: "peak_parallel_lanes",
      value: peakParallelLanes,
      weight: 8,
      active: peakParallelLanes > 0
    },
    {
      key: "wave_count",
      value: waveCount,
      weight: 5,
      active: waveCount > 1
    }
  ]);

  const publicSurfaceScore = buildWeightedScore([
    {
      key: "public_surface",
      value: 1,
      weight: 35,
      active: publicSurface
    },
    {
      key: "public_runtime_tag",
      value: 1,
      weight: 18,
      active: intentTags.includes("public-runtime")
    },
    {
      key: "public_state_bridge",
      value: 1,
      weight: 22,
      active: intentTags.includes("public-state-bridge")
    },
    {
      key: "documentation_scope",
      value: documentationScopeCount,
      weight: 4,
      active: documentationScopeCount > 0
    }
  ]);

  const verificationScore = buildWeightedScore([
    {
      key: "verification_required",
      value: 1,
      weight: 28,
      active: strategy.needsVerification === true
    },
    {
      key: "verification_scope",
      value: verificationScopeCount,
      weight: 10,
      active: verificationScopeCount > 0
    },
    {
      key: "verification_lanes",
      value: verificationLaneCount,
      weight: 16,
      active: verificationLaneCount > 0
    },
    {
      key: "review_flow",
      value: 1,
      weight: 14,
      active: intentTags.includes("review-flow")
    },
    {
      key: "public_surface",
      value: 1,
      weight: 10,
      active: publicSurface
    }
  ]);

  const complexity = toBand(complexityScore.score, { medium: 25, high: 55 });
  const coordinationIntensity = toBand(coordinationScore.score, { medium: 20, high: 50 });
  const publicSurfaceRisk = toBand(publicSurfaceScore.score, { medium: 12, high: 35 });
  const verificationPressure = toBand(verificationScore.score, { medium: 16, high: 40 });
  const executionPressure =
    orchestration?.executionShape === "parallel-handoff" || peakParallelOwners > 1 || peakParallelLanes > 1
      ? "parallel"
      : complexity === "high" || coordinationIntensity === "high" || verificationPressure === "high"
        ? "elevated"
        : "steady";
  const dispatchBias =
    peakParallelOwners > 1
      ? "parallelize-by-owner"
      : peakParallelLanes > 1
        ? "parallelize-by-lane"
        : laneStrategy === "discover-implement-verify" || laneStrategy === "discover-implement-verify-docs"
          ? "serial-handoff"
          : "single-owner";
  const recommendedParallelism =
    executionPressure === "parallel"
      ? Math.max(2, Number(orchestration?.maxWorkers ?? 0) || 0, peakParallelOwners, peakParallelLanes)
      : executionPressure === "elevated"
        ? Math.max(1, Math.min(2, Number(orchestration?.maxWorkers ?? 1) || 1))
        : 1;

  return {
    complexity,
    coordinationIntensity,
    publicSurfaceRisk,
    verificationPressure,
    executionPressure,
    dispatchBias,
    recommendedParallelism,
    scoreHints: {
      complexity: complexityScore.score,
      coordinationIntensity: coordinationScore.score,
      publicSurfaceRisk: publicSurfaceScore.score,
      verificationPressure: verificationScore.score
    },
    signals: {
      taskClass,
      laneStrategy,
      intentTags,
      primaryScopeCount,
      discoveryScopeCount,
      verificationScopeCount,
      documentationScopeCount,
      laneCount,
      waveCount,
      peakParallelOwners,
      peakParallelLanes,
      discoveryLaneCount,
      implementationLaneCount,
      verificationLaneCount,
      documentationLaneCount
    },
    summary: buildAssessmentSummary({
      taskClass,
      complexity,
      coordinationIntensity,
      publicSurfaceRisk,
      verificationPressure,
      executionPressure,
      dispatchBias,
      recommendedParallelism
    })
  };
}
