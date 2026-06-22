import { createStateRuntimeLeaderEntryPoints } from "./state-public-runtime-leader-entrypoints.js";
import { createStateRuntimeOverviewEntryPoints } from "./state-public-runtime-overview-entrypoints.js";
import { createStateRuntimePackEntryPoints } from "./state-public-runtime-pack-entrypoints.js";

export function createStateRuntimeEntryPoints(shared, api) {
  const runtimeLeader = createStateRuntimeLeaderEntryPoints(api);
  const runtimeOverview = createStateRuntimeOverviewEntryPoints(shared, api, runtimeLeader);
  const runtimePacks = createStateRuntimePackEntryPoints(api, runtimeLeader, runtimeOverview);
  const {
    leaderQueue,
    leaderAssignments,
    leaderAssignmentDispatch,
    leaderAssignmentDispatchPack,
    leaderAssignmentDispatchBundle,
    leaderAssignmentLaunchPlan,
    leaderWorkspace
  } = runtimeLeader;
  const {
    runtimeDashboard,
    runtimeAlerts,
    runtimeRoles,
    runtimeDispatch,
    runtimeReview,
    runtimeFocus,
    runtimeActivity,
    runtimeHandoffs,
    runtimeCloseout,
    runtimeRecovery
  } = runtimeOverview;
  const {
    runtimeSummaryPack,
    runtimeOperatorPack,
    runtimeDispatchPack,
    runtimeRecoveryPack,
    runtimeCloseoutPack,
    runtimeReviewPack,
    runtimeQueuePack,
    runtimeWorkspacePack,
    runtimeControlPack,
    runtimeSignalPack,
    runtimeHandoffPack,
    runtimeTriagePack,
    runtimeSessionPack,
    runtimeRolePack,
    runtimeExecutionPack,
    runtimePickupPack,
    runtimeAssignmentPack,
    runtimeLeaderPack,
    runtimeOwnerPack,
    runtimeWorkerPack,
    runtimeVerifierPack
  } = runtimePacks;

  return {
    leaderQueue,
    leaderAssignments,
    leaderAssignmentDispatch,
    leaderAssignmentDispatchPack,
    leaderAssignmentDispatchBundle,
    leaderAssignmentLaunchPlan,
    runtimeDashboard,
    runtimeAlerts,
    runtimeRoles,
    runtimeDispatch,
    runtimeReview,
    runtimeFocus,
    runtimeActivity,
    runtimeHandoffs,
    runtimeCloseout,
    runtimeRecovery,
    runtimeSummaryPack,
    runtimeOperatorPack,
    runtimeDispatchPack,
    runtimeRecoveryPack,
    runtimeCloseoutPack,
    runtimeReviewPack,
    runtimeQueuePack,
    runtimeWorkspacePack,
    runtimeControlPack,
    runtimeSignalPack,
    runtimeHandoffPack,
    runtimeTriagePack,
    runtimeSessionPack,
    runtimeRolePack,
    runtimeExecutionPack,
    runtimePickupPack,
    runtimeAssignmentPack,
    runtimeLeaderPack,
    runtimeOwnerPack,
    runtimeWorkerPack,
    runtimeVerifierPack,
    leaderWorkspace
  };
}
