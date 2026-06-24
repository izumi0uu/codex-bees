import {
  runtimeCloseoutPack,
  runtimeControlPack,
  runtimeDispatchPack,
  runtimeExecutionPack,
  runtimeLeaderPack,
  runtimeQueuePack,
  runtimeRecoveryPack,
  runtimeSummaryPack,
  runtimeWorkspacePack
} from "./state-runtime.js";
import { readOption } from "./state-cli-helpers.js";
import { writeNamedView } from "./state-cli-view-writers.js";
import { readWorkerSelectionDetailOptions, readWorkerSelectionOptions } from "./state-cli-runtime-pack-selection-helpers.js";

export function printRuntimeCloseoutPack() {
  writeNamedView("closeoutPack", runtimeCloseoutPack(readWorkerSelectionOptions()));
}

export function printRuntimeControlPack() {
  writeNamedView("controlPack", runtimeControlPack(readWorkerSelectionDetailOptions()));
}

export function printRuntimeExecutionPack() {
  writeNamedView("executionPack", runtimeExecutionPack(readWorkerSelectionDetailOptions()));
}

export function printRuntimeDispatchPack() {
  writeNamedView("dispatchPack", runtimeDispatchPack(readWorkerSelectionDetailOptions()));
}

export function printRuntimeQueuePack() {
  writeNamedView("queuePack", runtimeQueuePack(readWorkerSelectionDetailOptions()));
}

export function printRuntimeWorkspacePack() {
  writeNamedView("workspacePack", runtimeWorkspacePack(readWorkerSelectionDetailOptions()));
}

export function printRuntimeLeaderPack() {
  writeNamedView("leaderPack", runtimeLeaderPack({
    status: readOption("--status"),
    topology: readOption("--topology"),
    owner: readOption("--owner"),
    ...readWorkerSelectionDetailOptions()
  }));
}

export function printRuntimeSummaryPack() {
  writeNamedView("summaryPack", runtimeSummaryPack(readWorkerSelectionDetailOptions()));
}

export function printRuntimeRecoveryPack() {
  writeNamedView("recoveryPack", runtimeRecoveryPack());
}
