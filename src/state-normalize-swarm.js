import { VALID_SWARM_STATUSES } from "./state-rules.js";
import { buildPlannerProvenance } from "./planner-provenance.js";

export function normalizeSwarmLane(lane, index = 0) {
  return {
    lane: lane.lane ?? `lane-${index + 1}`,
    purpose: lane.purpose ?? null,
    summary: lane.summary ?? `Lane ${index + 1}`,
    owner: lane.owner ?? null,
    verifier: lane.verifier ?? null,
    scope: Array.isArray(lane.scope) ? lane.scope : null,
    dependsOn: Array.isArray(lane.dependsOn) ? Array.from(new Set(lane.dependsOn.filter(Boolean))) : null,
    acceptance: Array.isArray(lane.acceptance) ? lane.acceptance : null,
    verification: Array.isArray(lane.verification) ? lane.verification : null,
    taskId: lane.taskId ?? null
  };
}

export function normalizeSwarmHistoryEntry(entry, index = 0) {
  return {
    id: entry.id ?? `event-${index + 1}`,
    at: entry.at ?? null,
    type: entry.type ?? "updated",
    fromStatus: entry.fromStatus ?? null,
    toStatus: entry.toStatus ?? null,
    actor: entry.actor ?? null,
    lane: entry.lane ?? null,
    taskId: entry.taskId ?? null,
    notes: entry.notes ?? null,
    outcome: entry.outcome ?? null
  };
}

export function normalizeSwarm(swarm) {
  return {
    ...swarm,
    status: VALID_SWARM_STATUSES.has(swarm.status) ? swarm.status : "planned",
    topology: swarm.topology ?? "bounded-local",
    maxWorkers:
      Number.isInteger(Number(swarm.maxWorkers)) && Number(swarm.maxWorkers) > 0
        ? Number(swarm.maxWorkers)
        : 1,
    executionShape: swarm.executionShape ?? null,
    waveCount:
      Number.isInteger(Number(swarm.waveCount)) && Number(swarm.waveCount) >= 0
        ? Number(swarm.waveCount)
        : null,
    waves: Array.isArray(swarm.waves) ? swarm.waves : null,
    owner: swarm.owner ?? null,
    laneSource: swarm.laneSource ?? "manual",
    plannerProvenance: buildPlannerProvenance(swarm.plannerProvenance),
    lanes: Array.isArray(swarm.lanes)
      ? swarm.lanes.map((lane, index) => normalizeSwarmLane(lane, index))
      : [],
    history: Array.isArray(swarm.history) ? swarm.history.map(normalizeSwarmHistoryEntry) : [],
    queuedAt: swarm.queuedAt ?? null,
    archivedAt: swarm.archivedAt ?? null,
    archivedBy: swarm.archivedBy ?? null,
    archiveReason: swarm.archiveReason ?? null,
    archivedTaskIds: Array.isArray(swarm.archivedTaskIds)
      ? Array.from(new Set(swarm.archivedTaskIds.filter(Boolean)))
      : [],
    archivedTaskCount:
      Number.isInteger(Number(swarm.archivedTaskCount)) && Number(swarm.archivedTaskCount) >= 0
        ? Number(swarm.archivedTaskCount)
        : null,
    notes: swarm.notes ?? null
  };
}
