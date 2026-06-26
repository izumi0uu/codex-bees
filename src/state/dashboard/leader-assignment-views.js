import { buildPurposeGuidanceForTaskLike } from "../../state-lane-purpose.js";
import { compareLanePurposes } from "../../state/queue/views.js";
import { buildRecommendedNextFields } from "../runtime/recommendation-helpers.js";
import { findLaneOrchestrationContext } from "../../state/swarm/orchestration.js";

export function buildLeaderAssignmentsSummary(assignments, groups) {
  if (assignments.length === 0) {
    return "Leader assignments has no dispatchable work right now.";
  }

  const next = assignments[0];
  const purposeLabel = next.purposeGuidance?.label ?? "implementation";
  const waveLabel = next.wave ? ` wave ${next.wave}` : "";
  return `Leader assignments has ${assignments.length} dispatchable lane${assignments.length === 1 ? "" : "s"} across ${groups.length} owner group${groups.length === 1 ? "" : "s"}; ${next.lane} from ${next.swarmId}${waveLabel} is first for ${purposeLabel} work.`;
}

export function deriveLeaderAssignmentsReason({ assignments, groups, next }) {
  if ((groups?.length ?? 0) > 1) {
    return "parallel_owner_groups_visible";
  }
  if ((assignments?.length ?? 0) > 1) {
    return "multiple_assignments_visible";
  }
  if (next?.taskId) {
    return "next_assignment_ready";
  }
  if ((groups?.length ?? 0) > 0) {
    return "owner_group_visible";
  }
  return "no_dispatch_assignments";
}

export function buildLeaderAssignmentsView(
  input,
  {
    leaderWorkspace,
    swarmBrief,
    taskBrief
  },
  {
    deriveLeaderAssignmentsReason
  }
) {
  const workspace = leaderWorkspace(input);
  if (!workspace) {
    return null;
  }

  const assignments = workspace.swarms.flatMap((swarm) => {
    const brief = swarmBrief(swarm.id);
    const orchestration = brief?.orchestration ?? null;
    return (brief?.lanes ?? [])
      .filter(
        (lane) =>
          (lane.taskQueueStatus === "queued" || lane.taskQueueStatus === "released") &&
          lane.dependencyReady !== false
      )
      .map((lane) => {
        const laneOrchestration =
          findLaneOrchestrationContext(orchestration, lane.lane) ?? {
            wave: lane.wave ?? null,
            wavePosition: lane.wavePosition ?? null,
            waveStatus: lane.waveStatus ?? null,
            waveParallelizable: lane.waveParallelizable ?? null,
            waveLaneCount: lane.waveLaneCount ?? null,
            waveOwnerCount: lane.waveOwnerCount ?? null
          };

        return {
          swarmId: swarm.id,
          objective: swarm.objective,
          lane: lane.lane,
          purpose: lane.purpose ?? null,
          purposeGuidance: buildPurposeGuidanceForTaskLike(lane),
          owner: lane.owner,
          verifier: lane.verifier,
          taskId: lane.taskId,
          taskQueueStatus: lane.taskQueueStatus,
          ...buildRecommendedNextFields(lane, {
            includeTaskBrief: true,
            taskBrief: lane.taskId ? taskBrief(lane.taskId) : null
          }),
          swarmExecutionShape: orchestration?.executionShape ?? null,
          swarmWaveCount: orchestration?.waveCount ?? null,
          swarmMaxWorkers: orchestration?.maxWorkers ?? null,
          wave: laneOrchestration.wave,
          wavePosition: laneOrchestration.wavePosition,
          waveStatus: laneOrchestration.waveStatus,
          waveParallelizable: laneOrchestration.waveParallelizable,
          waveLaneCount: laneOrchestration.waveLaneCount,
          waveOwnerCount: laneOrchestration.waveOwnerCount,
          summary: `Dispatch ${lane.lane} from ${swarm.id}${laneOrchestration.wave ? ` wave ${laneOrchestration.wave}` : ""} to ${lane.owner.id ?? lane.owner.name ?? "unknown"}.`
        };
      });
  }).sort((left, right) => {
    const leftWave = Number.isInteger(Number(left.wave)) ? Number(left.wave) : Number.MAX_SAFE_INTEGER;
    const rightWave = Number.isInteger(Number(right.wave)) ? Number(right.wave) : Number.MAX_SAFE_INTEGER;
    if (leftWave !== rightWave) {
      return leftWave - rightWave;
    }
    const purposeDiff = compareLanePurposes(left.purpose ?? null, right.purpose ?? null);
    if (purposeDiff !== 0) {
      return purposeDiff;
    }
    return (left.swarmId ?? "").localeCompare(right.swarmId ?? "");
  });

  const groupsByOwner = new Map();
  for (const assignment of assignments) {
    const ownerId = assignment.owner?.id ?? assignment.owner?.name ?? "unknown";
    const current = groupsByOwner.get(ownerId) ?? {
      owner: assignment.owner,
      count: 0,
      assignments: []
    };
    current.assignments.push(assignment);
    current.count += 1;
    current.assignments.sort((left, right) => {
      const leftWave = Number.isInteger(Number(left.wave)) ? Number(left.wave) : Number.MAX_SAFE_INTEGER;
      const rightWave = Number.isInteger(Number(right.wave)) ? Number(right.wave) : Number.MAX_SAFE_INTEGER;
      if (leftWave !== rightWave) {
        return leftWave - rightWave;
      }
      const purposeDiff = compareLanePurposes(left.purpose ?? null, right.purpose ?? null);
      if (purposeDiff !== 0) {
        return purposeDiff;
      }
      return (left.swarmId ?? "").localeCompare(right.swarmId ?? "");
    });
    groupsByOwner.set(ownerId, current);
  }

  const groups = [...groupsByOwner.values()].sort((left, right) => {
    const leftWave = Number.isInteger(Number(left.assignments?.[0]?.wave))
      ? Number(left.assignments[0].wave)
      : Number.MAX_SAFE_INTEGER;
    const rightWave = Number.isInteger(Number(right.assignments?.[0]?.wave))
      ? Number(right.assignments[0].wave)
      : Number.MAX_SAFE_INTEGER;
    if (leftWave !== rightWave) {
      return leftWave - rightWave;
    }
    const leftPurpose = left.assignments?.[0]?.purpose ?? null;
    const rightPurpose = right.assignments?.[0]?.purpose ?? null;
    const purposeDiff = compareLanePurposes(leftPurpose, rightPurpose);
    if (purposeDiff !== 0) {
      return purposeDiff;
    }
    if (right.count !== left.count) {
      return right.count - left.count;
    }
    return (left.owner?.id ?? left.owner?.name ?? "").localeCompare(right.owner?.id ?? right.owner?.name ?? "");
  });
  const next = assignments[0] ?? null;
  const recommendedReason = deriveLeaderAssignmentsReason({ assignments, groups, next });

  return {
    kind: "leader_assignments",
    recommendedReason,
    filters: workspace.filters,
    counts: {
      totalAssignments: assignments.length,
      ownerGroups: groups.length
    },
    next,
    groups,
    summary: buildLeaderAssignmentsSummary(assignments, groups)
  };
}

export function buildLeaderAssignmentsViewFromSources(input, sources, helpers) {
  return buildLeaderAssignmentsView(input, sources, helpers);
}
