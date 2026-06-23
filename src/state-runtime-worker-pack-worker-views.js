import { buildPurposeGuidanceForTaskLike } from "./state-lane-purpose.js";

export function deriveRuntimeWorkerPackSurface({ session, handoff, closeout, next }) {
  if (session?.focus?.kind === "active_task" || session?.focus?.kind === "blocked_task") {
    return "worker:session";
  }
  if (session?.focus?.kind === "review_task") {
    return "worker:closeout";
  }
  if (handoff?.currentTask?.id) {
    return "worker:handoff";
  }
  if (next?.candidate?.id) {
    return "task:pickup";
  }
  if (closeout?.report?.task?.id) {
    return "worker:closeout";
  }
  return "worker:session";
}
export function deriveRuntimeWorkerPackReason({ session, handoff, closeout, next }) {
  if (session?.focus?.kind === "active_task") {
    return "active_task_priority";
  }
  if (session?.focus?.kind === "blocked_task") {
    return "blocked_task_priority";
  }
  if (session?.focus?.kind === "review_task") {
    return "review_task_priority";
  }
  if (handoff?.currentTask?.id) {
    return "handoff_priority";
  }
  if (next?.candidate?.id) {
    return "pickup_next_priority";
  }
  if (closeout?.report?.task?.id) {
    return "closeout_report_ready";
  }
  return "default_worker_priority";
}
export function buildRuntimeWorkerPackSummary(recommendedSurface, session) {
  const detail = session?.focus?.reason ?? "worker has no current focus detail.";
  return `Runtime worker pack recommends ${recommendedSurface} next. ${detail}`;
}
export function buildRuntimeWorkerPackView(
  input,
  {
    workerSession,
    workerHandoff,
    workerCloseout,
    taskNext,
    describeRole,
    normalizeNextMode
  },
  {
    deriveRuntimeWorkerPackSurface,
    deriveRuntimeWorkerPackReason,
    buildRuntimeWorkerPackSummary
  }
) {
  if (!input.role || !input.workerId) {
    return null;
  }

  const session = workerSession(input);
  const handoff = workerHandoff(input);
  const closeout = workerCloseout(input);
  const next = taskNext({
    role: input.role,
    workerId: input.workerId,
    mode: input.mode ?? "any"
  });
  const recommendedSurface = deriveRuntimeWorkerPackSurface({ session, handoff, closeout, next });
  const recommendedReason = deriveRuntimeWorkerPackReason({ session, handoff, closeout, next });
  const purposeGuidance =
    session?.purposeGuidance ??
    handoff?.purposeGuidance ??
    buildPurposeGuidanceForTaskLike(next?.candidate ?? null);
  const nextEntries = {
    focus: session?.focus ?? null,
    candidate: next?.candidate ?? null,
    handoff: handoff?.currentTask ?? null,
    closeout: closeout?.report?.task ?? null
  };

  return {
    kind: "runtime_worker_pack",
    role: session?.role ?? describeRole(input.role),
    workerId: input.workerId,
    mode: session?.mode ?? normalizeNextMode(input.mode),
    recommendedSurface,
    recommendedReason,
    purposeGuidance,
    metadata: {
      hasFocus: Boolean(session?.focus),
      hasCandidate: Boolean(next?.candidate),
      hasHandoff: Boolean(handoff?.currentTask),
      hasCloseout: Boolean(closeout?.report?.task)
    },
    counts: {
      surfacedNextEntries: Object.values(nextEntries).filter(Boolean).length
    },
    overview: {
      session: session?.counts ?? null,
      inbox: session?.inbox?.counts ?? null
    },
    next: nextEntries,
    surfaces: {
      session,
      handoff,
      closeout,
      next
    },
    summary: buildRuntimeWorkerPackSummary(recommendedSurface, session)
  };
}
export function buildRuntimeWorkerPackViewFromSources(
  input,
  {
    workerSession,
    workerHandoff,
    workerCloseout,
    taskNext,
    describeRole,
    normalizeNextMode
  },
  {
    deriveRuntimeWorkerPackSurface,
    deriveRuntimeWorkerPackReason,
    buildRuntimeWorkerPackSummary,
    buildRuntimeWorkerPackView
  }
) {
  return buildRuntimeWorkerPackView(
    input,
    {
      workerSession,
      workerHandoff,
      workerCloseout,
      taskNext,
      describeRole,
      normalizeNextMode
    },
    {
      deriveRuntimeWorkerPackSurface,
      deriveRuntimeWorkerPackReason,
      buildRuntimeWorkerPackSummary
    }
  );
}
