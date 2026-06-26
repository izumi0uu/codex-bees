export function normalizeTaskHistoryEntry(entry, index = 0) {
  return {
    id: entry.id ?? `event-${index + 1}`,
    at: entry.at ?? null,
    type: entry.type ?? "updated",
    fromQueueStatus: entry.fromQueueStatus ?? null,
    toQueueStatus: entry.toQueueStatus ?? null,
    actor: entry.actor ?? null,
    notes: entry.notes ?? null,
    evidence: Array.isArray(entry.evidence) ? entry.evidence : [],
    outcome: entry.outcome ?? null
  };
}

export function normalizeTaskAnnotation(annotation, index = 0) {
  return {
    id: annotation.id ?? `annotation-${index + 1}`,
    at: annotation.at ?? null,
    actor: annotation.actor ?? null,
    kind: annotation.kind ?? "note",
    content: annotation.content ?? ""
  };
}
