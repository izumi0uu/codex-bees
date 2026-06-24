import {
  buildRuntimePackCommand,
  buildRuntimePackExpansion,
  buildRuntimePackExpansionEntry,
  buildRuntimePackPresenceMetadata,
  attachRuntimePackSurfaces,
  countRuntimePackEntries,
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
    full: buildRuntimePackExpansionEntry('runtime:control-pack', buildRuntimePackCommand('runtime:control-pack', input, { detail: 'full' })),
    summaryPack: buildRuntimePackExpansionEntry('runtime:summary-pack', buildRuntimePackCommand('runtime:summary-pack', input)),
    workspacePack: buildRuntimePackExpansionEntry('runtime:workspace-pack', buildRuntimePackCommand('runtime:workspace-pack', input)),
    operatorPack: buildRuntimePackExpansionEntry('runtime:operator-pack', 'node ./src/index.js runtime:operator-pack'),
    leaderPack: buildRuntimePackExpansionEntry('runtime:leader-pack', buildRuntimePackCommand('runtime:leader-pack', input))
  };

  const pack = {
    kind: 'runtime_control_pack',
    detailLevel,
    availableDetails: ['compact', 'full'],
    recommendedSurface,
    recommendedReason,
    metadata: buildRuntimePackPresenceMetadata({
      hasSummary: nextEntries.summary,
      hasWorkspace: nextEntries.workspace,
      hasOperator: nextEntries.operator,
      hasLeader: nextEntries.leader
    }),
    counts: {
      surfacedNextEntries: countRuntimePackEntries(nextEntries)
    },
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
