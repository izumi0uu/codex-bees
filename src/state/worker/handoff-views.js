import { buildPurposeGuidanceForTaskLike, buildPurposeSentence } from "../../state-lane-purpose.js";
import { createLoadedValueView } from "../../state-view-helpers.js";

export function buildWorkerHandoffSummary(session, focusTaskSnapshot) {
  const purposeSentence = buildPurposeSentence(
    focusTaskSnapshot?.summary ?? session.next?.candidate ?? null,
    session.focus?.purpose ?? null
  );

  if (session.focus?.kind === "active_task" && focusTaskSnapshot) {
    return `Worker ${session.workerId} owns ${focusTaskSnapshot.summary.id} and should continue execution before handoff to verifier ${focusTaskSnapshot.summary.verifier}. ${purposeSentence}`;
  }
  if (session.focus?.kind === "review_task" && focusTaskSnapshot) {
    return `Worker ${session.workerId} is acting as verifier for ${focusTaskSnapshot.summary.id} and should decide approval or requested changes. ${purposeSentence}`;
  }
  if (session.focus?.kind === "blocked_task" && focusTaskSnapshot) {
    return `Worker ${session.workerId} is blocked on ${focusTaskSnapshot.summary.id} and should release or annotate the blocker context. ${purposeSentence}`;
  }
  if (session.focus?.kind === "awaiting_review" && focusTaskSnapshot) {
    return `Worker ${session.workerId} already handed ${focusTaskSnapshot.summary.id} to its verifier and is waiting on review. ${purposeSentence}`;
  }
  if (session.focus?.kind === "pickup_next" && session.next?.candidate) {
    return `Worker ${session.workerId} has no active task and can pick up ${session.next.candidate.id} next. ${purposeSentence}`;
  }
  return `Worker ${session.workerId} is idle with no current handoff target.`;
}

export function buildWorkerHandoffView(
  input,
  {
    workerSession,
    deriveWorkerHandoffReason,
    buildWorkerHandoffSummary
  }
) {
  if (!input.role || !input.workerId) {
    return null;
  }

  const session = workerSession(input);
  if (!session) {
    return null;
  }

  const focusTaskSnapshot =
    session.activeOwned[0] ??
    session.reviewQueue[0] ??
    session.blockedOwned[0] ??
    session.handoffsAwaitingReview[0] ??
    null;
  const focusBrief = focusTaskSnapshot?.brief ?? session.next?.brief ?? null;
  const recommendedReason = deriveWorkerHandoffReason(session, focusTaskSnapshot);

  const purposeGuidance = focusTaskSnapshot?.purposeGuidance ?? session.purposeGuidance ?? buildPurposeGuidanceForTaskLike(session.next?.candidate ?? null);

  return createLoadedValueView("worker_handoff", "currentTask", focusTaskSnapshot?.summary ?? null, {
    recommendedReason,
    includeCounts: false,
    extra: {
      role: session.role,
      workerId: session.workerId,
      mode: session.mode,
      focus: session.focus,
      brief: focusBrief,
      purposeGuidance,
      recentHistory: focusTaskSnapshot?.recentHistory ?? [],
      recentAnnotations: focusTaskSnapshot?.recentAnnotations ?? [],
      nextCandidate: session.next?.candidate ?? null,
      nextCommand: session.focus?.command ?? null,
      summary: buildWorkerHandoffSummary(session, focusTaskSnapshot)
    }
  });
}

export function buildWorkerHandoffViewFromSources(input, sources) {
  return buildWorkerHandoffView(input, sources);
}
