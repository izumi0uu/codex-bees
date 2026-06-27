import { buildPurposeGuidanceForTaskLike } from "./lane-purpose.js";
import { buildRecommendedFieldsFromResult } from "../runtime/recommendation/helpers.js";
import { buildRuntimeTaskIdentityFields } from "../runtime/task-entry/helpers.js";

export function buildRuntimeReviewTaskEntry(task, position, describeRole, taskBrief) {
  const brief = taskBrief(task.id);
  return {
    position,
    ...buildRuntimeTaskIdentityFields(task),
    objective: task.objective,
    purposeGuidance: buildPurposeGuidanceForTaskLike(task),
    owner: describeRole(task.owner),
    claimedBy: task.claimedBy,
    updatedAt: task.updatedAt,
    plannerAssessment: brief?.planning?.assessment ?? null,
    ...buildRecommendedFieldsFromResult(
      {
        actor: {
          type: "verifier_role",
          id: task.verifier,
          claimedBy: null
        },
        action: "review_and_decide",
        commands: [
          `node ./src/index.js task:approve --id ${task.id} --by ${task.verifier ?? "<verifier-role>"}`,
          `node ./src/index.js task:reject --id ${task.id} --by ${task.verifier ?? "<verifier-role>"} --status claimed --notes "<changes requested>"`
        ]
      },
      { includeTaskBrief: true, taskBrief: brief }
    ),
    summary: `Review ${task.id} for verifier ${task.verifier ?? "unknown"}.`
  };
}

export function compareRuntimeReviewGroups(left, right) {
  if (right.count !== left.count) {
    return right.count - left.count;
  }
  return (left.verifier?.id ?? left.verifier?.name ?? "").localeCompare(right.verifier?.id ?? right.verifier?.name ?? "");
}
