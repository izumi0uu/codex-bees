import {
  RUNTIME_PACK_DETAILS,
  buildRuntimePackControlEntries,
  buildRuntimePackControlMetadata,
  buildRuntimePackControlOverview,
  buildRuntimePackControlSurfaces,
  buildRuntimePackCliExpansionEntry,
  buildRuntimePackCommandExpansionEntry,
  buildRuntimePackExpansion,
  attachRuntimePackSurfaces,
  buildRuntimePackCounts,
  normalizeRuntimePackDetail
} from '../pack-detail/index.js';
import { stripRoleContractsDeep } from './control-sanitizer.js';

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
  const nextEntries = buildRuntimePackControlEntries(summaryPack, workspacePack, operatorPack, leaderPack);
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
    metadata: buildRuntimePackControlMetadata(nextEntries),
    counts: buildRuntimePackCounts(nextEntries),
    overview: buildRuntimePackControlOverview(summaryPack, workspacePack, operatorPack, leaderPack),
    next: nextEntries,
    expansion: buildRuntimePackExpansion(detailLevel, expansion),
    summary: buildRuntimeControlPackSummary(recommendedSurface, summaryPack, workspacePack, operatorPack, leaderPack)
  };

  return stripRoleContractsDeep(
    attachRuntimePackSurfaces(
      pack,
      detailLevel,
      buildRuntimePackControlSurfaces(summaryPack, workspacePack, operatorPack, leaderPack)
    )
  );
}

