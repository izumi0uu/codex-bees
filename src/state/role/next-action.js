import { buildPurposeGuidanceForTaskLike } from "../../state-lane-purpose.js";

export function buildRuntimeRoleNextAction(roleId, ownerNext, verifierNext, dispatchableAssignments = []) {
  if (verifierNext?.candidate) {
    return {
      lane: "verifier",
      task: verifierNext.candidate,
      purposeGuidance: buildPurposeGuidanceForTaskLike(verifierNext.candidate),
      command: `node ./src/index.js task:next --role ${roleId} --mode verifier`,
      reason: `Verifier lane can decide ${verifierNext.candidate.id} next.`
    };
  }

  if (ownerNext?.candidate) {
    return {
      lane: "owner",
      task: ownerNext.candidate,
      purposeGuidance: buildPurposeGuidanceForTaskLike(ownerNext.candidate),
      command: `node ./src/index.js task:next --role ${roleId} --mode owner`,
      reason: `Owner lane can move ${ownerNext.candidate.id} next.`
    };
  }

  const assignment = dispatchableAssignments[0] ?? null;
  if (assignment) {
    return {
      lane: "dispatch",
      task: {
        id: assignment.taskId,
        lane: assignment.lane,
        lanePurpose: assignment.purpose ?? null,
        swarmId: assignment.swarmId,
        owner: assignment.owner?.id ?? assignment.owner?.name ?? roleId,
        verifier: assignment.verifier?.id ?? assignment.verifier?.name ?? null,
        queueStatus: assignment.taskQueueStatus,
        recommendedAction: assignment.recommendedNextAction,
        summary: assignment.summary
      },
      purposeGuidance: assignment.purposeGuidance ?? buildPurposeGuidanceForTaskLike({ lanePurpose: assignment.purpose ?? null }),
      command: assignment.recommendedCommands?.[0] ?? `node ./src/index.js leader:assignments`,
      reason: `Leader can dispatch ${assignment.lane} from ${assignment.swarmId} to ${roleId}.`
    };
  }

  return {
    lane: "idle",
    task: null,
    command: null,
    reason: `Role ${roleId} has no immediate owner or verifier work.`
  };
}
