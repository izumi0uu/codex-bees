import { buildWeightedScore } from "../../core/priority-score.js";

function bandValue(level) {
  if (level === "high") {
    return 2;
  }
  if (level === "medium") {
    return 1;
  }
  return 0;
}

function executionPressureValue(level) {
  if (level === "parallel") {
    return 2;
  }
  if (level === "elevated") {
    return 1;
  }
  return 0;
}

export function buildPlannerAssessmentPackFactors(
  assessment = null,
  {
    keyPrefix = "planner_assessment",
    executionWeight = 8,
    coordinationWeight = 8,
    verificationWeight = 8,
    publicWeight = 6
  } = {}
) {
  if (!assessment || typeof assessment !== "object") {
    return [];
  }

  const executionPressure = executionPressureValue(assessment.executionPressure);
  const coordinationIntensity = bandValue(assessment.coordinationIntensity);
  const verificationPressure = bandValue(assessment.verificationPressure);
  const publicSurfaceRisk = bandValue(assessment.publicSurfaceRisk);

  return [
    {
      key: `${keyPrefix}_execution_pressure`,
      value: executionPressure,
      weight: executionWeight,
      active: executionPressure > 0
    },
    {
      key: `${keyPrefix}_coordination_intensity`,
      value: coordinationIntensity,
      weight: coordinationWeight,
      active: coordinationIntensity > 0
    },
    {
      key: `${keyPrefix}_verification_pressure`,
      value: verificationPressure,
      weight: verificationWeight,
      active: verificationPressure > 0
    },
    {
      key: `${keyPrefix}_public_surface_risk`,
      value: publicSurfaceRisk,
      weight: publicWeight,
      active: publicSurfaceRisk > 0
    }
  ];
}

export function buildRecommendedNextFields(source = {}, { includeTaskBrief = false, taskBrief } = {}) {
  const fields = {
    recommendedNextActor: source?.recommendedNextActor ?? null,
    recommendedNextAction: source?.recommendedNextAction ?? null,
    recommendedCommands: source?.recommendedCommands ?? []
  };

  if (includeTaskBrief) {
    fields.taskBrief = taskBrief ?? source?.taskBrief ?? null;
  }

  return fields;
}

export function buildRecommendedFieldsFromResult(recommended = {}, options = {}) {
  return buildRecommendedNextFields(
    {
      recommendedNextActor: recommended?.actor ?? null,
      recommendedNextAction: recommended?.action ?? null,
      recommendedCommands: recommended?.commands ?? []
    },
    options
  );
}

export function buildDispatchPriorityScore(assignment = {}) {
  const plannerAssessment = assignment?.plannerAssessment ?? null;
  const lanePurpose = assignment?.purpose ?? assignment?.lanePurpose ?? null;
  const verificationPressure = bandValue(plannerAssessment?.verificationPressure);
  const publicSurfaceRisk = bandValue(plannerAssessment?.publicSurfaceRisk);
  const coordinationIntensity = bandValue(plannerAssessment?.coordinationIntensity);
  const executionPressure = executionPressureValue(plannerAssessment?.executionPressure);
  const dispatchBiasBoost =
    plannerAssessment?.dispatchBias === "parallelize-by-owner" || plannerAssessment?.dispatchBias === "parallelize-by-lane"
      ? 1
      : 0;

  return buildWeightedScore([
    {
      key: "queue_ready",
      label: "Queue ready",
      value: 1,
      weight: 40,
      active: assignment.taskQueueStatus === "queued" || assignment.taskQueueStatus === "released",
      detail: assignment.taskQueueStatus ?? null
    },
    {
      key: "dependency_ready",
      label: "Dependency ready",
      value: 1,
      weight: 30,
      active: assignment.dependencyReady !== false
    },
    {
      key: "earlier_wave",
      label: "Earlier wave priority",
      value: Math.max(0, 10 - Number(assignment.wave ?? 10)),
      weight: 5,
      active: Number.isFinite(Number(assignment.wave))
    },
    {
      key: "parallel_wave_bonus",
      label: "Parallel wave bonus",
      value: 1,
      weight: 8,
      active: assignment.waveParallelizable === true
    },
    {
      key: "purpose_priority",
      label: "Purpose priority",
      value: Math.max(0, 5 - Number(assignment.purposeRank ?? 4)),
      weight: 3,
      active: true,
      detail: assignment.purpose ?? assignment.lanePurpose ?? null
    },
    {
      key: "execution_pressure",
      label: "Execution pressure",
      value: executionPressure,
      weight: 7,
      active: executionPressure > 0,
      detail: plannerAssessment?.executionPressure ?? null
    },
    {
      key: "coordination_intensity",
      label: "Coordination intensity",
      value: coordinationIntensity,
      weight: 6,
      active: coordinationIntensity > 0,
      detail: plannerAssessment?.coordinationIntensity ?? null
    },
    {
      key: "parallel_dispatch_bias",
      label: "Parallel dispatch bias",
      value: dispatchBiasBoost,
      weight: 8,
      active: dispatchBiasBoost > 0 && assignment.waveParallelizable === true,
      detail: plannerAssessment?.dispatchBias ?? null
    },
    {
      key: "verification_pressure",
      label: "Verification pressure",
      value: verificationPressure,
      weight: 9,
      active: verificationPressure > 0 && lanePurpose === "verification",
      detail: plannerAssessment?.verificationPressure ?? null
    },
    {
      key: "public_surface_risk",
      label: "Public surface risk",
      value: publicSurfaceRisk,
      weight: 5,
      active: publicSurfaceRisk > 0,
      detail: plannerAssessment?.publicSurfaceRisk ?? null
    }
  ]);
}

export function buildRuntimeFocusPriorityScore({
  blockedTask = false,
  reviewTask = false,
  dispatchLane = false,
  rolePressure = false,
  leaderQueue = false,
  blockedTasks = 0,
  pendingReview = 0,
  dispatchAssignments = 0,
  pendingRoleReview = 0,
  blockedOwnerWork = 0,
  claimableOwnerWork = 0,
  leaderQueueItems = 0,
  verificationPressure = 0,
  coordinationIntensity = 0,
  publicSurfaceRisk = 0
} = {}) {
  return buildWeightedScore([
    {
      key: "blocked_task",
      label: "Blocked task priority",
      value: 1 + blockedTasks,
      weight: 100,
      active: blockedTask
    },
    {
      key: "review_task",
      label: "Review priority",
      value: 1 + pendingReview,
      weight: 70,
      active: reviewTask
    },
    {
      key: "dispatch_lane",
      label: "Dispatch priority",
      value: 1 + dispatchAssignments,
      weight: 50,
      active: dispatchLane
    },
    {
      key: "role_pressure",
      label: "Role pressure",
      value: 1 + pendingRoleReview + blockedOwnerWork + claimableOwnerWork,
      weight: 30,
      active: rolePressure
    },
    {
      key: "leader_queue",
      label: "Leader queue pressure",
      value: 1 + leaderQueueItems,
      weight: 15,
      active: leaderQueue
    },
    {
      key: "verification_pressure",
      label: "Verification pressure",
      value: verificationPressure,
      weight: 18,
      active: reviewTask && verificationPressure > 0
    },
    {
      key: "coordination_intensity",
      label: "Coordination intensity",
      value: coordinationIntensity,
      weight: 12,
      active: dispatchLane && coordinationIntensity > 0
    },
    {
      key: "public_surface_risk",
      label: "Public surface risk",
      value: publicSurfaceRisk,
      weight: 10,
      active: (dispatchLane || reviewTask) && publicSurfaceRisk > 0
    }
  ]);
}

export function buildPackRecommendationScore(candidates = []) {
  const normalized = candidates
    .filter((candidate) => candidate && typeof candidate.key === "string" && candidate.key.trim().length > 0)
    .map((candidate) => {
      const scoring = buildWeightedScore(candidate.factors ?? []);
      return {
        key: candidate.key,
        surface: candidate.surface ?? null,
        reason: candidate.reason ?? null,
        summary: candidate.summary ?? null,
        score: scoring.score,
        scoreBreakdown: scoring.scoreBreakdown,
        scoreEntries: scoring.scoreEntries,
        matchedSignalCount: scoring.matchedSignalCount
      };
    })
    .sort((left, right) => {
      const scoreDelta = right.score - left.score;
      if (scoreDelta !== 0) {
        return scoreDelta;
      }
      return left.key.localeCompare(right.key);
    });

  const top = normalized[0] ?? null;
  return {
    score: top?.score ?? 0,
    scoreBreakdown: top?.scoreBreakdown ?? {},
    scoreEntries: top?.scoreEntries ?? [],
    rankedCandidates: normalized
  };
}

export function rankRuntimeFocusCandidates(candidates = []) {
  return candidates
    .filter((candidate) => candidate && candidate.focus && typeof candidate.key === "string")
    .map((candidate) => {
      const scoring = buildRuntimeFocusPriorityScore(candidate.scoreInput ?? {});
      return {
        key: candidate.key,
        recommendedReason: candidate.recommendedReason ?? null,
        focus: {
          ...candidate.focus,
          priorityScore: scoring.score,
          priorityScoreBreakdown: scoring.scoreBreakdown
        },
        priorityScore: scoring.score,
        priorityScoreBreakdown: scoring.scoreBreakdown,
        priorityScoreEntries: scoring.scoreEntries,
        summary: candidate.summary ?? candidate.focus?.summary ?? null
      };
    })
    .sort((left, right) => {
      const scoreDelta = (right.priorityScore ?? 0) - (left.priorityScore ?? 0);
      if (scoreDelta !== 0) {
        return scoreDelta;
      }
      return left.key.localeCompare(right.key);
    });
}
