import {
  runtimeAssignmentPack,
  runtimeCloseoutPack,
  runtimeControlPack,
  runtimeDispatchPack,
  runtimeExecutionPack,
  runtimeHandoffPack,
  runtimeLeaderPack,
  runtimeOperatorPack,
  runtimeOwnerPack,
  runtimePickupPack,
  runtimeQueuePack,
  runtimeRecoveryPack,
  runtimeReviewPack,
  runtimeRolePack,
  runtimeSessionPack,
  runtimeSignalPack,
  runtimeSummaryPack,
  runtimeTriagePack,
  runtimeVerifierPack,
  runtimeWorkerPack,
  runtimeWorkspacePack
} from "./state-runtime.js";
import { readJsonOption, readOption, readPositiveIntegerOption } from "./state-cli-helpers.js";
import {
  requireNamedRoleOption,
  requireNamedRoleWorkerOptions
} from "./state-cli-role-worker-options.js";
import { writeNamedView } from "./state-cli-view-writers.js";

function readWorkerSelectionOptions() {
  return {
    workerId: readOption("--worker"),
    workerIds: readJsonOption("--workers")
  };
}

function readWorkerSelectionDetailOptions() {
  return {
    ...readWorkerSelectionOptions(),
    detail: readOption("--detail")
  };
}

function printRuntimeAssignmentPack() {
  writeNamedView("assignmentPack", runtimeAssignmentPack({
    ...requireNamedRoleWorkerOptions("runtime:assignment-pack"),
    mode: readOption("--mode")
  }));
}

function printRuntimeCloseoutPack() {
  writeNamedView("closeoutPack", runtimeCloseoutPack(readWorkerSelectionOptions()));
}

function printRuntimeControlPack() {
  writeNamedView("controlPack", runtimeControlPack(readWorkerSelectionDetailOptions()));
}

function printRuntimeSignalPack() {
  writeNamedView("signalPack", runtimeSignalPack({ limit: readPositiveIntegerOption("--limit") }));
}

function printRuntimeExecutionPack() {
  writeNamedView("executionPack", runtimeExecutionPack(readWorkerSelectionDetailOptions()));
}

function printRuntimePickupPack() {
  writeNamedView("pickupPack", runtimePickupPack({
    ...requireNamedRoleWorkerOptions("runtime:pickup-pack"),
    mode: readOption("--mode")
  }));
}

function printRuntimeHandoffPack() {
  writeNamedView("handoffPack", runtimeHandoffPack());
}

function printRuntimeTriagePack() {
  writeNamedView("triagePack", runtimeTriagePack());
}

function printRuntimeSummaryPack() {
  writeNamedView("summaryPack", runtimeSummaryPack(readWorkerSelectionDetailOptions()));
}

function printRuntimeLeaderPack() {
  writeNamedView("leaderPack", runtimeLeaderPack({
    status: readOption("--status"),
    topology: readOption("--topology"),
    owner: readOption("--owner"),
    ...readWorkerSelectionDetailOptions()
  }));
}

function printRuntimeOperatorPack() {
  writeNamedView("operatorPack", runtimeOperatorPack());
}

function printRuntimeRecoveryPack() {
  writeNamedView("recoveryPack", runtimeRecoveryPack());
}

function printRuntimeReviewPack() {
  writeNamedView("reviewPack", runtimeReviewPack({
    role: readOption("--role"),
    workerId: readOption("--worker")
  }));
}

function printRuntimeSessionPack() {
  writeNamedView("sessionPack", runtimeSessionPack({
    ...requireNamedRoleWorkerOptions("runtime:session-pack"),
    mode: readOption("--mode")
  }));
}

function printRuntimeQueuePack() {
  writeNamedView("queuePack", runtimeQueuePack(readWorkerSelectionDetailOptions()));
}

function printRuntimeWorkspacePack() {
  writeNamedView("workspacePack", runtimeWorkspacePack(readWorkerSelectionDetailOptions()));
}

function printRuntimeOwnerPack() {
  writeNamedView("ownerPack", runtimeOwnerPack(requireNamedRoleWorkerOptions("runtime:owner-pack")));
}

function printRuntimeRolePack() {
  writeNamedView("rolePack", runtimeRolePack({
    role: requireNamedRoleOption("runtime:role-pack"),
    workerId: readOption("--worker"),
    mode: readOption("--mode")
  }));
}

function printRuntimeVerifierPack() {
  writeNamedView("verifierPack", runtimeVerifierPack(requireNamedRoleWorkerOptions("runtime:verifier-pack")));
}

function printRuntimeWorkerPack() {
  writeNamedView("workerPack", runtimeWorkerPack({
    ...requireNamedRoleWorkerOptions("runtime:worker-pack"),
    mode: readOption("--mode")
  }));
}

function printRuntimeDispatchPack() {
  writeNamedView("dispatchPack", runtimeDispatchPack(readWorkerSelectionDetailOptions()));
}

export {
  printRuntimeAssignmentPack,
  printRuntimeCloseoutPack,
  printRuntimeControlPack,
  printRuntimeDispatchPack,
  printRuntimeExecutionPack,
  printRuntimeHandoffPack,
  printRuntimeLeaderPack,
  printRuntimeOperatorPack,
  printRuntimeOwnerPack,
  printRuntimePickupPack,
  printRuntimeQueuePack,
  printRuntimeRecoveryPack,
  printRuntimeReviewPack,
  printRuntimeRolePack,
  printRuntimeSessionPack,
  printRuntimeSignalPack,
  printRuntimeSummaryPack,
  printRuntimeTriagePack,
  printRuntimeVerifierPack,
  printRuntimeWorkerPack,
  printRuntimeWorkspacePack
};
