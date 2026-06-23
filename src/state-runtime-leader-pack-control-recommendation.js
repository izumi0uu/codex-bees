export function deriveRuntimeControlPackSurface({ summaryPack, workspacePack, operatorPack, leaderPack }) {
  if (summaryPack?.recommendedSurface) {
    return 'runtime:summary-pack';
  }
  if (workspacePack?.recommendedSurface) {
    return 'runtime:workspace-pack';
  }
  if (operatorPack?.recommendedSurface) {
    return 'runtime:operator-pack';
  }
  if (leaderPack?.recommendedSurface) {
    return 'runtime:leader-pack';
  }
  return 'runtime:summary-pack';
}

export function deriveRuntimeControlPackReason({ summaryPack, workspacePack, operatorPack, leaderPack }) {
  if (summaryPack?.recommendedSurface) {
    return 'summary_priority';
  }
  if (workspacePack?.recommendedSurface) {
    return 'workspace_priority';
  }
  if (operatorPack?.recommendedSurface) {
    return 'operator_priority';
  }
  if (leaderPack?.recommendedSurface) {
    return 'leader_priority';
  }
  return 'default_summary_priority';
}

export function buildRuntimeControlPackSummary(recommendedSurface, summaryPack, workspacePack, operatorPack, leaderPack) {
  const detail =
    summaryPack?.summary ??
    workspacePack?.summary ??
    operatorPack?.summary ??
    leaderPack?.summary ??
    'Runtime control pack has no current control detail.';
  return `Runtime control pack recommends ${recommendedSurface} next. ${detail}`;
}
