import { createStateRuntimeLeaderEntryPoints } from "./state-public-runtime-leader-entrypoints.js";
import { createStateRuntimeOverviewEntryPoints } from "./state-public-runtime-overview-entrypoints.js";
import { createStateRuntimePackEntryPoints } from "./state-public-runtime-pack-entrypoints.js";

export function createStateRuntimeEntryPoints(shared, api) {
  const runtimeLeader = createStateRuntimeLeaderEntryPoints(api);
  const runtimeOverview = createStateRuntimeOverviewEntryPoints(shared, api, runtimeLeader);
  const runtimePacks = createStateRuntimePackEntryPoints(api, runtimeLeader, runtimeOverview);

  return {
    leaderQueue: runtimeLeader.leaderQueue,
    leaderAssignments: runtimeLeader.leaderAssignments,
    leaderAssignmentDispatch: runtimeLeader.leaderAssignmentDispatch,
    leaderAssignmentDispatchPack: runtimeLeader.leaderAssignmentDispatchPack,
    leaderAssignmentDispatchBundle: runtimeLeader.leaderAssignmentDispatchBundle,
    leaderAssignmentLaunchPlan: runtimeLeader.leaderAssignmentLaunchPlan,
    runtimeDashboard: runtimeOverview.runtimeDashboard,
    runtimeAlerts: runtimeOverview.runtimeAlerts,
    runtimeRoles: runtimeOverview.runtimeRoles,
    runtimeDispatch: runtimeOverview.runtimeDispatch,
    runtimeReview: runtimeOverview.runtimeReview,
    runtimeFocus: runtimeOverview.runtimeFocus,
    runtimeActivity: runtimeOverview.runtimeActivity,
    runtimeHandoffs: runtimeOverview.runtimeHandoffs,
    runtimeCloseout: runtimeOverview.runtimeCloseout,
    runtimeRecovery: runtimeOverview.runtimeRecovery,
    runtimeSummaryPack: runtimePacks.runtimeSummaryPack,
    runtimeOperatorPack: runtimePacks.runtimeOperatorPack,
    runtimeDispatchPack: runtimePacks.runtimeDispatchPack,
    runtimeRecoveryPack: runtimePacks.runtimeRecoveryPack,
    runtimeCloseoutPack: runtimePacks.runtimeCloseoutPack,
    runtimeReviewPack: runtimePacks.runtimeReviewPack,
    runtimeQueuePack: runtimePacks.runtimeQueuePack,
    runtimeWorkspacePack: runtimePacks.runtimeWorkspacePack,
    runtimeControlPack: runtimePacks.runtimeControlPack,
    runtimeSignalPack: runtimePacks.runtimeSignalPack,
    runtimeHandoffPack: runtimePacks.runtimeHandoffPack,
    runtimeTriagePack: runtimePacks.runtimeTriagePack,
    runtimeSessionPack: runtimePacks.runtimeSessionPack,
    runtimeRolePack: runtimePacks.runtimeRolePack,
    runtimeExecutionPack: runtimePacks.runtimeExecutionPack,
    runtimePickupPack: runtimePacks.runtimePickupPack,
    runtimeAssignmentPack: runtimePacks.runtimeAssignmentPack,
    runtimeLeaderPack: runtimePacks.runtimeLeaderPack,
    runtimeOwnerPack: runtimePacks.runtimeOwnerPack,
    runtimeWorkerPack: runtimePacks.runtimeWorkerPack,
    runtimeVerifierPack: runtimePacks.runtimeVerifierPack,
    leaderWorkspace: runtimeLeader.leaderWorkspace
  };
}
