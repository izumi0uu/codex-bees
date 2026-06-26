import {
  runtimeAssignmentPack,
  runtimeOwnerPack,
  runtimePickupPack,
  runtimeReviewPack,
  runtimeRolePack,
  runtimeSessionPack,
  runtimeVerifierPack,
  runtimeWorkerPack
} from "../../state-runtime.js";
import { readOption } from "./helpers.js";
import { requireNamedRoleOption, requireNamedRoleWorkerOptions } from "./role-worker-options.js";
import { writeNamedView } from "./view-writers.js";

export function printRuntimeAssignmentPack() {
  writeNamedView("assignmentPack", runtimeAssignmentPack({
    ...requireNamedRoleWorkerOptions("runtime:assignment-pack"),
    mode: readOption("--mode")
  }));
}

export function printRuntimePickupPack() {
  writeNamedView("pickupPack", runtimePickupPack({
    ...requireNamedRoleWorkerOptions("runtime:pickup-pack"),
    mode: readOption("--mode")
  }));
}

export function printRuntimeSessionPack() {
  writeNamedView("sessionPack", runtimeSessionPack({
    ...requireNamedRoleWorkerOptions("runtime:session-pack"),
    mode: readOption("--mode")
  }));
}

export function printRuntimeOwnerPack() {
  writeNamedView("ownerPack", runtimeOwnerPack(requireNamedRoleWorkerOptions("runtime:owner-pack")));
}

export function printRuntimeRolePack() {
  writeNamedView("rolePack", runtimeRolePack({
    role: requireNamedRoleOption("runtime:role-pack"),
    workerId: readOption("--worker"),
    mode: readOption("--mode")
  }));
}

export function printRuntimeVerifierPack() {
  writeNamedView("verifierPack", runtimeVerifierPack(requireNamedRoleWorkerOptions("runtime:verifier-pack")));
}

export function printRuntimeWorkerPack() {
  writeNamedView("workerPack", runtimeWorkerPack({
    ...requireNamedRoleWorkerOptions("runtime:worker-pack"),
    mode: readOption("--mode")
  }));
}

export function printRuntimeReviewPack() {
  writeNamedView("reviewPack", runtimeReviewPack({
    role: readOption("--role"),
    workerId: readOption("--worker")
  }));
}
