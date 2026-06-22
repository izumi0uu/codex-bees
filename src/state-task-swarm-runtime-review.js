export function buildRuntimeReviewTaskEntry(task, position, describeRole, taskBrief) {
  return {
    position,
    taskId: task.id,
    title: task.title,
    objective: task.objective,
    swarmId: task.swarmId,
    lane: task.lane,
    owner: describeRole(task.owner),
    claimedBy: task.claimedBy,
    updatedAt: task.updatedAt,
    recommendedNextActor: {
      type: "verifier_role",
      id: task.verifier,
      claimedBy: null
    },
    recommendedNextAction: "review_and_decide",
    recommendedCommands: [
      `node ./src/index.js task:approve --id ${task.id} --by ${task.verifier ?? "<verifier-role>"}`,
      `node ./src/index.js task:reject --id ${task.id} --by ${task.verifier ?? "<verifier-role>"} --status claimed --notes "<changes requested>"`
    ],
    taskBrief: taskBrief(task.id),
    summary: `Review ${task.id} for verifier ${task.verifier ?? "unknown"}.`
  };
}

export function compareRuntimeReviewGroups(left, right) {
  if (right.count !== left.count) {
    return right.count - left.count;
  }
  return (left.verifier?.id ?? left.verifier?.name ?? "").localeCompare(right.verifier?.id ?? right.verifier?.name ?? "");
}
