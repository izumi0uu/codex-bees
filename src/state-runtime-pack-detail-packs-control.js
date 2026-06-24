import {
  buildRuntimePackPresenceMetadata
} from "./state-runtime-pack-detail-core.js";

export function buildRuntimePackControlEntries(summaryPack, workspacePack, operatorPack, leaderPack) {
  return {
    summary: summaryPack?.focus?.focus ?? null,
    workspace: workspacePack?.next ?? null,
    operator: operatorPack?.next ?? null,
    leader: leaderPack?.next ?? null
  };
}

export function buildRuntimePackControlMetadata(nextEntries = {}) {
  return buildRuntimePackPresenceMetadata({
    hasSummary: nextEntries.summary,
    hasWorkspace: nextEntries.workspace,
    hasOperator: nextEntries.operator,
    hasLeader: nextEntries.leader
  });
}

export function buildRuntimePackControlOverview(summaryPack, workspacePack, operatorPack, leaderPack) {
  return {
    summary: summaryPack?.overview ?? null,
    workspace: workspacePack?.overview ?? null,
    operator: operatorPack?.overview ?? null,
    leader: leaderPack?.overview ?? null
  };
}

export function buildRuntimePackControlSurfaces(summaryPack, workspacePack, operatorPack, leaderPack) {
  return {
    summaryPack,
    workspacePack,
    operatorPack,
    leaderPack
  };
}
