export function appendTaskHistoryEntry(task, entry) {
  const existing = Array.isArray(task.history) ? task.history : [];
  return [
    ...existing,
    {
      id: `event-${existing.length + 1}`,
      ...entry
    }
  ];
}

export function appendTaskAnnotation(task, annotation) {
  const existing = Array.isArray(task.annotations) ? task.annotations : [];
  return [
    ...existing,
    {
      id: `annotation-${existing.length + 1}`,
      ...annotation
    }
  ];
}
