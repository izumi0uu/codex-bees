export function deriveSwarmStatus(swarm, tasks) {
  if (swarm.status === "cancelled") {
    return "cancelled";
  }

  const laneTaskIds = new Set(swarm.lanes.map((lane) => lane.taskId).filter(Boolean));
  const relatedTasks = tasks.filter((task) => laneTaskIds.size === 0 || laneTaskIds.has(task.id));

  if (swarm.lanes.length === 0 || relatedTasks.length === 0) {
    return "planned";
  }

  const allDone = relatedTasks.length === swarm.lanes.length && relatedTasks.every((task) => task.queueStatus === "done");
  if (allDone) {
    return "completed";
  }

  const hasRunnable = relatedTasks.some((task) =>
    ["queued", "released", "claimed", "ready_for_review"].includes(task.queueStatus)
  );
  if (hasRunnable) {
    return "active";
  }

  const hasBlocked = relatedTasks.some((task) => task.queueStatus === "blocked");
  if (hasBlocked) {
    return "blocked";
  }

  return swarm.status === "completed" ? "completed" : "active";
}
