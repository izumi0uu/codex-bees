import {
  RUNTIME_PACK_DETAILS,
  buildRuntimePackCliExpansionEntry,
  buildRuntimePackCommandExpansionEntry,
  buildRuntimePackExpansion,
  buildRuntimePackPresenceMetadata,
  attachRuntimePackSurfaces,
  buildRuntimePackCounts,
  normalizeRuntimePackDetail
} from './state-runtime-pack-detail.js';
import { stripRoleContractsDeep } from './state-runtime-leader-pack-control-sanitizer.js';

export function buildRuntimeControlPackView(
  input,
  {
    runtimeSummaryPack,
    runtimeWorkspacePack,
    runtimeOperatorPack,
    runtimeLeaderPack
  },
  {
    deriveRuntimeControlPackSurface,
    deriveRuntimeControlPackReason,
    buildRuntimeControlPackSummary
  }
) {
  const detailLevel = normalizeRuntimePackDetail(input.detail);
  const summaryPack = runtimeSummaryPack(input);
  const workspacePack = runtimeWorkspacePack(input);
  const operatorPack = runtimeOperatorPack();
  const leaderPack = runtimeLeaderPack(input);
  const recommendedSurface = deriveRuntimeControlPackSurface({ summaryPack, workspacePack, operatorPack, leaderPack });
  const recommendedReason = deriveRuntimeControlPackReason({ summaryPack, workspacePack, operatorPack, leaderPack });
  const nextEntries = {
    summary: summaryPack?.focus?.focus ?? null,
    workspace: workspacePack?.next ?? null,
    operator: operatorPack?.next ?? null,
    leader: leaderPack?.next ?? null
  };
  const expansion = {
    full: buildRuntimePackCommandExpansionEntry('runtime:control-pack', input, { detail: 'full' }),
    summaryPack: buildRuntimePackCommandExpansionEntry('runtime:summary-pack', input),
    workspacePack: buildRuntimePackCommandExpansionEntry('runtime:workspace-pack', input),
    operatorPack: buildRuntimePackCliExpansionEntry('runtime:operator-pack'),
    leaderPack: buildRuntimePackCommandExpansionEntry('runtime:leader-pack', input)
  };

  const pack = {
    kind: 'runtime_control_pack',
    detailLevel,
    availableDetails: RUNTIME_PACK_DETAILS,
    recommendedSurface,
    recommendedReason,
    metadata: buildRuntimePackPresenceMetadata({
      hasSummary: nextEntries.summary,
      hasWorkspace: nextEntries.workspace,
      hasOperator: nextEntries.operator,
      hasLeader: nextEntries.leader
    }),
    counts: buildRuntimePackCounts(nextEntries),
    overview: {
      summary: summaryPack?.overview ?? null,
      workspace: workspacePack?.overview ?? null,
      operator: operatorPack?.overview ?? null,
      leader: leaderPack?.overview ?? null
    },
    next: nextEntries,
    expansion: buildRuntimePackExpansion(detailLevel, expansion),
    summary: buildRuntimeControlPackSummary(recommendedSurface, summaryPack, workspacePack, operatorPack, leaderPack)
  };

  return stripRoleContractsDeep(
    attachRuntimePackSurfaces(pack, detailLevel, {
      summaryPack,
      workspacePack,
      operatorPack,
      leaderPack
    })
  );
}

export function buildRuntimeControlPackViewFromSources(
  input,
  {
    runtimeSummaryPack,
    runtimeWorkspacePack,
    runtimeOperatorPack,
    runtimeLeaderPack
  },
  {
    deriveRuntimeControlPackSurface,
    deriveRuntimeControlPackReason,
    buildRuntimeControlPackSummary,
    buildRuntimeControlPackView
  }
) {
  return buildRuntimeControlPackView(
    input,
    {
      runtimeSummaryPack,
      runtimeWorkspacePack,
      runtimeOperatorPack,
      runtimeLeaderPack
    },
    {
      deriveRuntimeControlPackSurface,
      deriveRuntimeControlPackReason,
      buildRuntimeControlPackSummary
    }
  );
}
