import { createLoadedValueView } from "./state-view-helpers.js";

export function deriveWorkerCloseoutCommand(handoff, report) {
  if (!handoff.currentTask?.id) {
    return null;
  }

  if (handoff.focus?.kind === "active_task") {
    return `node ./src/index.js task:review --id ${handoff.currentTask.id} --by ${handoff.workerId}`;
  }
  if (handoff.focus?.kind === "review_task") {
    return `node ./src/index.js task:approve --id ${handoff.currentTask.id} --by ${handoff.role.id ?? handoff.role.name ?? "<verifier-role>"}`;
  }
  if (handoff.focus?.kind === "blocked_task") {
    return `node ./src/index.js task:release --id ${handoff.currentTask.id} --by ${handoff.workerId}`;
  }
  if (report?.closure?.closureReady) {
    return report.closure.nextGate?.command ?? null;
  }
  return handoff.nextCommand ?? null;
}

export function buildWorkerCloseoutSummary(handoff, report) {
  if (!handoff.currentTask?.id) {
    return `Worker ${handoff.workerId} has no current closeout target.`;
  }
  if (report?.closure?.reviewOutcome === "approved") {
    return `Task ${handoff.currentTask.id} is approved and ready for final handoff or archive.`;
  }
  if (handoff.focus?.kind === "review_task") {
    return `Task ${handoff.currentTask.id} is awaiting verifier closeout by ${handoff.role.id ?? handoff.role.name}.`;
  }
  if (handoff.focus?.kind === "active_task") {
    return `Task ${handoff.currentTask.id} is still actively owned by ${handoff.workerId} and should be handed to review next.`;
  }
  if (handoff.focus?.kind === "blocked_task") {
    return `Task ${handoff.currentTask.id} is blocked and should be released or clarified before closeout.`;
  }
  return `Task ${handoff.currentTask.id} has a closeout bundle ready for the next actor.`;
}

export function buildWorkerCloseoutView(
  input,
  {
    workerHandoff,
    taskReport,
    deriveWorkerCloseoutReason,
    deriveWorkerCloseoutCommand,
    buildWorkerCloseoutSummary
  }
) {
  if (!input.role || !input.workerId) {
    return null;
  }

  const handoff = workerHandoff(input);
  if (!handoff) {
    return null;
  }

  const report = handoff.currentTask?.id ? taskReport(handoff.currentTask.id) : null;
  const recommendedReason = deriveWorkerCloseoutReason(handoff, report);
  return createLoadedValueView("worker_closeout", "handoff", handoff, {
    recommendedReason,
    includeCounts: false,
    extra: {
      role: handoff.role,
      workerId: handoff.workerId,
      mode: handoff.mode,
      focus: handoff.focus,
      report,
      command: deriveWorkerCloseoutCommand(handoff, report),
      summary: buildWorkerCloseoutSummary(handoff, report)
    }
  });
}

export function buildWorkerCloseoutViewFromSources(
  input,
  {
    workerHandoff,
    taskReport,
    deriveWorkerCloseoutReason,
    deriveWorkerCloseoutCommand,
    buildWorkerCloseoutSummary
  },
  {
    buildWorkerCloseoutView
  }
) {
  return buildWorkerCloseoutView(
    input,
    {
      workerHandoff,
      taskReport,
      deriveWorkerCloseoutReason,
      deriveWorkerCloseoutCommand,
      buildWorkerCloseoutSummary
    }
  );
}
