import { buildPurposeGuidanceForTaskLike } from "../../state-lane-purpose.js";

export function buildPreviewTaskPickupView(
  input,
  {
    taskNext,
    describeRole,
    normalizeNextMode,
    getTask,
    pickupOutcome,
    pickupFollowupCommand
  },
  {
    deriveTaskPickupPreviewReason
  }
) {
  if (!input.role || !input.workerId) {
    return null;
  }

  const next = taskNext({
    role: input.role,
    workerId: input.workerId,
    mode: input.mode ?? "any"
  });

  if (!next?.candidate) {
    return {
      kind: "task_pickup_preview",
      role: describeRole(input.role),
      workerId: input.workerId,
      mode: next?.mode ?? normalizeNextMode(input.mode),
      outcome: "none",
      recommendedReason: "no_pickup_candidate",
      metadata: {
        hasCandidate: false,
        hasTask: false,
        hasBrief: false,
        taskId: null
      },
      candidate: null,
      task: null,
      brief: null,
      purposeGuidance: buildPurposeGuidanceForTaskLike(null),
      command: null
    };
  }

  const relation = next.candidate.relation;
  const currentTask = getTask(next.candidate.id);

  if (relation === "owner_claimable") {
    return {
      kind: "task_pickup_preview",
      role: describeRole(input.role),
      workerId: input.workerId,
      mode: next.mode,
      outcome: "claimable",
      recommendedReason: "claimable_pickup_preview",
      metadata: {
        hasCandidate: true,
        hasTask: Boolean(currentTask),
        hasBrief: Boolean(next.brief),
        taskId: next.candidate.id
      },
      candidate: next.candidate,
      task: currentTask,
      brief: next.brief,
      purposeGuidance: buildPurposeGuidanceForTaskLike(next.candidate ?? next.brief?.coordination ?? currentTask),
      command: `node ./src/index.js task:pickup --role ${input.role} --worker ${input.workerId} --mode ${next.mode}`
    };
  }

  return {
    kind: "task_pickup_preview",
    role: describeRole(input.role),
    workerId: input.workerId,
    mode: next.mode,
    outcome: pickupOutcome(relation),
    recommendedReason: deriveTaskPickupPreviewReason(relation),
    metadata: {
      hasCandidate: true,
      hasTask: Boolean(currentTask),
      hasBrief: Boolean(next.brief),
      taskId: next.candidate.id
    },
    candidate: next.candidate,
    task: currentTask,
    brief: next.brief,
    purposeGuidance: buildPurposeGuidanceForTaskLike(next.candidate ?? next.brief?.coordination ?? currentTask),
    command: pickupFollowupCommand(next.candidate, input.workerId)
  };
}

export function buildPreviewTaskPickupViewFromSources(input, sources, helpers) {
  return buildPreviewTaskPickupView(input, sources, helpers);
}
