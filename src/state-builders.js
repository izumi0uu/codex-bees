import {
  normalizeMemory,
  normalizeSwarm,
  normalizeTask
} from "./state-normalize.js";

export function buildTask(input, nextId) {
  return normalizeTask({
    id: `task-${nextId}`,
    title: input.title,
    status: input.status ?? "todo",
    queueStatus: input.queueStatus ?? "queued",
    owner: input.owner ?? null,
    verifier: input.verifier ?? null,
    objective: input.objective ?? null,
    lane: input.lane ?? null,
    lanePurpose: input.lanePurpose ?? null,
    swarmId: input.swarmId ?? null,
    scope: input.scope ?? null,
    dependsOn: input.dependsOn ?? null,
    acceptance: input.acceptance ?? null,
    verification: input.verification ?? null,
    claimedBy: input.claimedBy ?? null,
    notes: input.notes ?? null,
    reviewedBy: input.reviewedBy ?? null,
    reviewedAt: input.reviewedAt ?? null,
    reviewOutcome: input.reviewOutcome ?? null,
    reviewNotes: input.reviewNotes ?? null,
    reviewEvidence: input.reviewEvidence ?? null,
    archivedAt: input.archivedAt ?? null,
    archivedBy: input.archivedBy ?? null,
    archiveReason: input.archiveReason ?? null,
    annotations: input.annotations ?? [],
    history: [
      {
        id: "event-1",
        at: new Date().toISOString(),
        type: "created",
        fromQueueStatus: null,
        toQueueStatus: input.queueStatus ?? "queued",
        actor: input.claimedBy ?? null,
        notes: input.notes ?? null,
        evidence: [],
        outcome: null
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
}

export function buildTaskHistoryEntry(current, nextQueueStatus, input) {
  const actor = input.reviewedBy ?? input.claimedBy ?? current.claimedBy ?? null;
  const isVerifierApproval = nextQueueStatus === "done";
  const isVerifierReturn =
    current.queueStatus === "ready_for_review" &&
    ["claimed", "blocked", "released"].includes(nextQueueStatus);

  let type = "updated";
  let outcome = null;
  if (nextQueueStatus === "claimed" && current.queueStatus !== "ready_for_review") {
    type = "claimed";
  } else if (nextQueueStatus === "blocked") {
    type = "blocked";
  } else if (nextQueueStatus === "ready_for_review") {
    type = "ready_for_review";
  } else if (nextQueueStatus === "released") {
    type = "released";
  } else if (isVerifierApproval) {
    type = "approved";
    outcome = "approved";
  } else if (isVerifierReturn) {
    type = "changes_requested";
    outcome = "changes_requested";
  }

  return {
    at: new Date().toISOString(),
    type,
    fromQueueStatus: current.queueStatus,
    toQueueStatus: nextQueueStatus,
    actor,
    notes: input.notes ?? null,
    evidence: input.reviewEvidence ?? [],
    outcome
  };
}

export function buildSwarmHistoryEntry(current, nextStatus, input = {}, options = {}) {
  const actor = options.actor ?? input.claimedBy ?? input.owner ?? current?.owner ?? null;
  const type = options.type ?? "updated";
  const notes = options.notes ?? input.notes ?? null;

  return {
    at: options.at ?? new Date().toISOString(),
    type,
    fromStatus: current?.status ?? null,
    toStatus: nextStatus ?? null,
    actor,
    lane: options.lane ?? null,
    taskId: options.taskId ?? null,
    notes,
    outcome: options.outcome ?? null
  };
}

export function buildMemory(input, nextMemoryId) {
  return normalizeMemory({
    id: `memory-${nextMemoryId}`,
    namespace: input.namespace ?? "default",
    kind: input.kind ?? "note",
    title: input.title ?? null,
    content: input.content,
    agent: input.agent ?? null,
    tags: input.tags ?? [],
    notes: input.notes ?? null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
}

export function buildSwarm(input, nextSwarmId) {
  const initialStatus = input.status ?? "planned";
  return normalizeSwarm({
    id: `swarm-${nextSwarmId}`,
    objective: input.objective,
    status: initialStatus,
    topology: input.topology ?? "bounded-local",
    maxWorkers: input.maxWorkers ?? 1,
    executionShape: input.executionShape ?? null,
    waveCount: input.waveCount ?? null,
    waves: input.waves ?? null,
    owner: input.owner ?? null,
    laneSource: input.laneSource ?? "manual",
    lanes: input.lanes ?? [],
    history: [
      {
        id: "event-1",
        ...buildSwarmHistoryEntry(null, initialStatus, input, {
          type: "created"
        })
      }
    ],
    queuedAt: input.queuedAt ?? null,
    archivedAt: input.archivedAt ?? null,
    archivedBy: input.archivedBy ?? null,
    archiveReason: input.archiveReason ?? null,
    archivedTaskIds: input.archivedTaskIds ?? [],
    archivedTaskCount: input.archivedTaskCount ?? null,
    notes: input.notes ?? null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
}
