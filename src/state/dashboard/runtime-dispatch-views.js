import { buildPurposeGuidanceForTaskLike } from '../task/lane-purpose.js';
import {
  buildDispatchPriorityScore,
  buildRecommendedNextFields
} from "../runtime/recommendation/helpers.js";

export function deriveRuntimeDispatchReason({ groups, totalAssignments, next }) {
  if ((groups?.length ?? 0) > 1) {
    return 'parallel_owner_groups_visible';
  }
  if ((totalAssignments ?? 0) > 1) {
    return 'multiple_assignments_visible';
  }
  if (next?.taskId) {
    return 'next_dispatch_ready';
  }
  if ((groups?.length ?? 0) > 0) {
    return 'owner_group_visible';
  }
  return 'no_dispatch_ready';
}

export function buildRuntimeDispatchSummary(groups, next) {
  if (groups.length === 0) {
    return 'Runtime dispatch has no owner-grouped work ready right now.';
  }

  if (!next) {
    return `Runtime dispatch is tracking ${groups.length} owner group${groups.length === 1 ? '' : 's'}.`;
  }

  return `Runtime dispatch has ${groups.length} owner group${groups.length === 1 ? '' : 's'}; ${next.lane} from ${next.swarmId} is the next ${next.purposeGuidance?.label ?? 'implementation'} handoff.`;
}

export function buildRuntimeDispatchView(
  {
    leaderAssignments
  },
  {
    deriveRuntimeDispatchReason,
    buildRuntimeDispatchSummary
  }
) {
  const assignments = leaderAssignments();
  const groups = (assignments?.groups ?? []).map((group) => ({
    owner: group.owner,
    count: group.count,
    next: group.assignments?.[0] ?? null,
    assignments: (group.assignments ?? []).map((assignment, index) => {
      const dispatchPriority = buildDispatchPriorityScore(assignment);
      return {
        position: index + 1,
        swarmId: assignment.swarmId,
        objective: assignment.objective,
        lane: assignment.lane,
        purpose: assignment.purpose ?? null,
        purposeGuidance: assignment.purposeGuidance ?? buildPurposeGuidanceForTaskLike(assignment),
        taskId: assignment.taskId,
        taskQueueStatus: assignment.taskQueueStatus,
        verifier: assignment.verifier,
        plannerAssessment: assignment.plannerAssessment ?? null,
        dispatchScore: assignment.dispatchScore ?? dispatchPriority.score,
        dispatchScoreBreakdown: assignment.dispatchScoreBreakdown ?? dispatchPriority.scoreBreakdown,
        ...buildRecommendedNextFields(assignment, { includeTaskBrief: true }),
        summary: assignment.summary
      };
    })
  }));
  const next = groups[0]?.assignments?.[0] ?? null;
  const totalAssignments = groups.reduce((total, group) => total + (group.count ?? 0), 0);
  const recommendedReason = deriveRuntimeDispatchReason({ groups, totalAssignments, next });
  const ranking = groups
    .flatMap((group) => group.assignments ?? [])
    .sort((left, right) => {
      const scoreDelta = (right.dispatchScore ?? 0) - (left.dispatchScore ?? 0);
      if (scoreDelta !== 0) {
        return scoreDelta;
      }
      return (left.lane ?? "").localeCompare(right.lane ?? "");
    })
    .map((assignment, index) => ({
      rank: index + 1,
      swarmId: assignment.swarmId,
      lane: assignment.lane,
      taskId: assignment.taskId,
      purpose: assignment.purpose ?? null,
      dispatchScore: assignment.dispatchScore ?? 0,
      dispatchScoreBreakdown: assignment.dispatchScoreBreakdown ?? {},
      plannerAssessment: assignment.plannerAssessment ?? null,
      summary: assignment.summary
    }));

  return {
    kind: 'runtime_dispatch',
    recommendedReason,
    counts: {
      ownerGroups: groups.length,
      totalAssignments
    },
    groups,
    next,
    ranking,
    summary: buildRuntimeDispatchSummary(groups, next)
  };
}

export function buildRuntimeDispatchViewFromSources(sources, helpers) {
  return buildRuntimeDispatchView(sources, helpers);
}
