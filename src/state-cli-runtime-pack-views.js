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
import { exit, readJsonOption, readOption, readPositiveIntegerOption, write, writeErr } from "./state-cli-helpers.js";

function writePack(label, pack) {
  write(JSON.stringify({ [label]: pack }, null, 2) + "\n");
}

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

function requireRoleWorkerOptions(commandName) {
  const role = readOption("--role");
  const workerId = readOption("--worker");
  if (!role || !workerId) {
    writeErr(`${commandName} requires --role and --worker\n`);
    exit(1);
  }
  return { role, workerId };
}

function requireRoleOption(commandName) {
  const role = readOption("--role");
  if (!role) {
    writeErr(`${commandName} requires --role\n`);
    exit(1);
  }
  return role;
}

function printRuntimeAssignmentPack() {
  writePack("assignmentPack", runtimeAssignmentPack({
    ...requireRoleWorkerOptions("runtime:assignment-pack"),
    mode: readOption("--mode")
  }));
}

function printRuntimeCloseoutPack() {
  writePack("closeoutPack", runtimeCloseoutPack(readWorkerSelectionOptions()));
}

function printRuntimeControlPack() {
  writePack("controlPack", runtimeControlPack(readWorkerSelectionDetailOptions()));
}

function printRuntimeSignalPack() {
  writePack("signalPack", runtimeSignalPack({ limit: readPositiveIntegerOption("--limit") }));
}

function printRuntimeExecutionPack() {
  writePack("executionPack", runtimeExecutionPack(readWorkerSelectionDetailOptions()));
}

function printRuntimePickupPack() {
  writePack("pickupPack", runtimePickupPack({
    ...requireRoleWorkerOptions("runtime:pickup-pack"),
    mode: readOption("--mode")
  }));
}

function printRuntimeHandoffPack() {
  writePack("handoffPack", runtimeHandoffPack());
}

function printRuntimeTriagePack() {
  writePack("triagePack", runtimeTriagePack());
}

function printRuntimeSummaryPack() {
  writePack("summaryPack", runtimeSummaryPack(readWorkerSelectionDetailOptions()));
}

function printRuntimeLeaderPack() {
  writePack("leaderPack", runtimeLeaderPack({
    status: readOption("--status"),
    topology: readOption("--topology"),
    owner: readOption("--owner"),
    ...readWorkerSelectionDetailOptions()
  }));
}

function printRuntimeOperatorPack() {
  writePack("operatorPack", runtimeOperatorPack());
}

function printRuntimeRecoveryPack() {
  writePack("recoveryPack", runtimeRecoveryPack());
}

function printRuntimeReviewPack() {
  writePack("reviewPack", runtimeReviewPack({
    role: readOption("--role"),
    workerId: readOption("--worker")
  }));
}

function printRuntimeSessionPack() {
  writePack("sessionPack", runtimeSessionPack({
    ...requireRoleWorkerOptions("runtime:session-pack"),
    mode: readOption("--mode")
  }));
}

function printRuntimeQueuePack() {
  writePack("queuePack", runtimeQueuePack(readWorkerSelectionDetailOptions()));
}

function printRuntimeWorkspacePack() {
  writePack("workspacePack", runtimeWorkspacePack(readWorkerSelectionDetailOptions()));
}

function printRuntimeOwnerPack() {
  writePack("ownerPack", runtimeOwnerPack(requireRoleWorkerOptions("runtime:owner-pack")));
}

function printRuntimeRolePack() {
  writePack("rolePack", runtimeRolePack({
    role: requireRoleOption("runtime:role-pack"),
    workerId: readOption("--worker"),
    mode: readOption("--mode")
  }));
}

function printRuntimeVerifierPack() {
  writePack("verifierPack", runtimeVerifierPack(requireRoleWorkerOptions("runtime:verifier-pack")));
}

function printRuntimeWorkerPack() {
  writePack("workerPack", runtimeWorkerPack({
    ...requireRoleWorkerOptions("runtime:worker-pack"),
    mode: readOption("--mode")
  }));
}

function printRuntimeDispatchPack() {
  writePack("dispatchPack", runtimeDispatchPack(readWorkerSelectionDetailOptions()));
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
