export function appendSwarmHistoryEntry(swarm, entry) {
  const existing = Array.isArray(swarm.history) ? swarm.history : [];
  return [
    ...existing,
    {
      id: `event-${existing.length + 1}`,
      ...entry
    }
  ];
}
