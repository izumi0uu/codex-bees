export function buildRecommendedNextFields(source = {}, { includeTaskBrief = false, taskBrief } = {}) {
  const fields = {
    recommendedNextActor: source?.recommendedNextActor ?? null,
    recommendedNextAction: source?.recommendedNextAction ?? null,
    recommendedCommands: source?.recommendedCommands ?? []
  };

  if (includeTaskBrief) {
    fields.taskBrief = taskBrief ?? source?.taskBrief ?? null;
  }

  return fields;
}

export function buildRecommendedFieldsFromResult(recommended = {}, options = {}) {
  return buildRecommendedNextFields(
    {
      recommendedNextActor: recommended?.actor ?? null,
      recommendedNextAction: recommended?.action ?? null,
      recommendedCommands: recommended?.commands ?? []
    },
    options
  );
}
