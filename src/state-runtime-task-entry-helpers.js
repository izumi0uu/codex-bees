export function buildRuntimeTaskIdentityFields(task) {
  return {
    taskId: task.id,
    title: task.title,
    owner: task.owner,
    verifier: task.verifier,
    swarmId: task.swarmId,
    lane: task.lane,
    lanePurpose: task.lanePurpose ?? null
  };
}

export function buildRuntimeTaskRecommendationFields(brief) {
  return {
    recommendedNextActor: brief?.recommendedNextActor ?? null,
    recommendedNextAction: brief?.recommendedNextAction ?? null,
    recommendedCommands: brief?.recommendedCommands ?? [],
    taskBrief: brief ?? null
  };
}

export function buildRuntimeTaskDashboardFields(task) {
  return {
    id: task.id,
    title: task.title,
    swarmId: task.swarmId,
    lane: task.lane,
    lanePurpose: task.lanePurpose ?? null,
    owner: task.owner,
    verifier: task.verifier
  };
}
