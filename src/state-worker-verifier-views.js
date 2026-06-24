export function buildVerifierDecisionCommands(taskSummary, role) {
  if (!taskSummary?.id) {
    return {
      approve: null,
      rejectToClaimed: null,
      rejectToReleased: null
    };
  }

  return {
    approve: `node ./src/index.js task:approve --id ${taskSummary.id} --by ${role}`,
    rejectToClaimed: `node ./src/index.js task:reject --id ${taskSummary.id} --by ${role} --status claimed --notes "<changes requested>"`,
    rejectToReleased: `node ./src/index.js task:reject --id ${taskSummary.id} --by ${role} --status released --notes "<changes requested>"`
  };
}

export function buildVerifierBundleSummary(taskSummary, role, workerId) {
  if (!taskSummary?.id) {
    return `Verifier ${workerId} has no pending review target.`;
  }

  return `Verifier ${workerId} (${role}) can decide ${taskSummary.id} now with approve or changes-requested actions.`;
}

export function buildVerifierBundleView(
  input,
  {
    workerSession,
    workerHandoff,
    taskReport,
    describeRole,
    deriveVerifierBundleReason,
    buildVerifierDecisionCommands,
    buildVerifierBundleSummary
  }
) {
  if (!input.role || !input.workerId) {
    return null;
  }

  const normalized = {
    ...input,
    mode: "verifier"
  };
  const session = workerSession(normalized);
  const handoff = workerHandoff(normalized);
  const reviewSnapshot = session?.reviewQueue?.[0] ?? null;
  const report = reviewSnapshot?.summary?.id ? taskReport(reviewSnapshot.summary.id) : null;
  const recommendedReason = deriveVerifierBundleReason({ reviewSnapshot, report, handoff });
  const recentHistory = reviewSnapshot?.recentHistory ?? [];
  const recentAnnotations = reviewSnapshot?.recentAnnotations ?? [];
  const commands = buildVerifierDecisionCommands(reviewSnapshot?.summary, input.role);

  return {
    kind: "verifier_bundle",
    role: describeRole(input.role),
    workerId: input.workerId,
    recommendedReason,
    metadata: {
      hasCurrentTask: Boolean(reviewSnapshot?.summary?.id),
      hasReport: Boolean(report),
      reviewTaskId: reviewSnapshot?.summary?.id ?? null
    },
    counts: {
      recentHistoryEntries: recentHistory.length,
      recentAnnotationEntries: recentAnnotations.length,
      decisionCommands: Object.values(commands).filter(Boolean).length
    },
    handoff,
    currentTask: reviewSnapshot?.summary ?? null,
    report,
    recentHistory,
    recentAnnotations,
    commands,
    summary: buildVerifierBundleSummary(reviewSnapshot?.summary, input.role, input.workerId)
  };
}

export function buildVerifierBundleViewFromSources(input, sources) {
  return buildVerifierBundleView(input, sources);
}
