import { VALID_QUEUE_STATUSES } from "./state-rules.js";
import { buildPlannerProvenance } from "./planner-provenance.js";
import { normalizeTaskAnnotation, normalizeTaskHistoryEntry } from "./state-normalize-task-history.js";

export function normalizeTask(task) {
  return {
    ...task,
    queueStatus: VALID_QUEUE_STATUSES.has(task.queueStatus) ? task.queueStatus : "queued",
    claimedBy: task.claimedBy ?? null,
    owner: task.owner ?? null,
    verifier: task.verifier ?? null,
    objective: task.objective ?? null,
    lane: task.lane ?? null,
    lanePurpose: task.lanePurpose ?? null,
    swarmId: task.swarmId ?? null,
    plannerProvenance: buildPlannerProvenance(task.plannerProvenance),
    scope: Array.isArray(task.scope) ? task.scope : null,
    dependsOn: Array.isArray(task.dependsOn) ? Array.from(new Set(task.dependsOn.filter(Boolean))) : null,
    acceptance: Array.isArray(task.acceptance) ? task.acceptance : null,
    verification: Array.isArray(task.verification) ? task.verification : null,
    notes: task.notes ?? null,
    reviewedBy: task.reviewedBy ?? null,
    reviewedAt: task.reviewedAt ?? null,
    reviewOutcome: task.reviewOutcome ?? null,
    reviewNotes: task.reviewNotes ?? null,
    reviewEvidence: Array.isArray(task.reviewEvidence) ? task.reviewEvidence : null,
    archivedAt: task.archivedAt ?? null,
    archivedBy: task.archivedBy ?? null,
    archiveReason: task.archiveReason ?? null,
    history: Array.isArray(task.history) ? task.history.map(normalizeTaskHistoryEntry) : [],
    annotations: Array.isArray(task.annotations) ? task.annotations.map(normalizeTaskAnnotation) : []
  };
}
