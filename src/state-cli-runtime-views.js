import {
  runtimeActivity,
  runtimeAlerts,
  runtimeAssignmentPack,
  runtimeCloseout,
  runtimeCloseoutPack,
  runtimeControlPack,
  runtimeDashboard,
  runtimeDispatch,
  runtimeDispatchPack,
  runtimeExecutionPack,
  runtimeFocus,
  runtimeHandoffPack,
  runtimeHandoffs,
  runtimeLeaderPack,
  runtimeOperatorPack,
  runtimeOwnerPack,
  runtimePickupPack,
  runtimeQueuePack,
  runtimeRecovery,
  runtimeRecoveryPack,
  runtimeReview,
  runtimeReviewPack,
  runtimeRolePack,
  runtimeRoles,
  runtimeSessionPack,
  runtimeSignalPack,
  runtimeSummaryPack,
  runtimeTriagePack,
  runtimeVerifierPack,
  runtimeWorkerPack,
  runtimeWorkspacePack
} from "./state.js";
import { exit, readJsonOption, readOption, readPositiveIntegerOption, write, writeErr } from "./state-cli-helpers.js";

function printRuntimeActivity() {
  write(JSON.stringify({ activity: runtimeActivity({ limit: readPositiveIntegerOption("--limit") }) }, null, 2) + "\n");
}

function printRuntimeAssignmentPack() {
  const role = readOption("--role");
  const workerId = readOption("--worker");
  if (!role || !workerId) {
    writeErr("runtime:assignment-pack requires --role and --worker\n");
    exit(1);
  }
  write(JSON.stringify({
    assignmentPack: runtimeAssignmentPack({
      role,
      workerId,
      mode: readOption("--mode")
    })
  }, null, 2) + "\n");
}

function printRuntimeCloseout() {
  write(JSON.stringify({ closeout: runtimeCloseout() }, null, 2) + "\n");
}

function printRuntimeCloseoutPack() {
  write(JSON.stringify({
    closeoutPack: runtimeCloseoutPack({
      workerId: readOption("--worker"),
      workerIds: readJsonOption("--workers")
    })
  }, null, 2) + "\n");
}

function printRuntimeControlPack() {
  write(JSON.stringify({
    controlPack: runtimeControlPack({
      workerId: readOption("--worker"),
      workerIds: readJsonOption("--workers")
    })
  }, null, 2) + "\n");
}

function printRuntimeSignalPack() {
  write(JSON.stringify({ signalPack: runtimeSignalPack({ limit: readPositiveIntegerOption("--limit") }) }, null, 2) + "\n");
}

function printRuntimeExecutionPack() {
  write(JSON.stringify({
    executionPack: runtimeExecutionPack({
      workerId: readOption("--worker"),
      workerIds: readJsonOption("--workers")
    })
  }, null, 2) + "\n");
}

function printRuntimePickupPack() {
  const role = readOption("--role");
  const workerId = readOption("--worker");
  if (!role || !workerId) {
    writeErr("runtime:pickup-pack requires --role and --worker\n");
    exit(1);
  }
  write(JSON.stringify({
    pickupPack: runtimePickupPack({
      role,
      workerId,
      mode: readOption("--mode")
    })
  }, null, 2) + "\n");
}

function printRuntimeHandoffPack() {
  write(JSON.stringify({ handoffPack: runtimeHandoffPack() }, null, 2) + "\n");
}

function printRuntimeTriagePack() {
  write(JSON.stringify({ triagePack: runtimeTriagePack() }, null, 2) + "\n");
}

function printRuntimeHandoffs() {
  write(JSON.stringify({ handoffs: runtimeHandoffs() }, null, 2) + "\n");
}

function printRuntimeRecovery() {
  write(JSON.stringify({ recovery: runtimeRecovery() }, null, 2) + "\n");
}

function printRuntimeSummaryPack() {
  write(JSON.stringify({
    summaryPack: runtimeSummaryPack({
      workerId: readOption("--worker"),
      workerIds: readJsonOption("--workers")
    })
  }, null, 2) + "\n");
}

function printRuntimeLeaderPack() {
  write(JSON.stringify({
    leaderPack: runtimeLeaderPack({
      status: readOption("--status"),
      topology: readOption("--topology"),
      owner: readOption("--owner"),
      workerId: readOption("--worker"),
      workerIds: readJsonOption("--workers")
    })
  }, null, 2) + "\n");
}

function printRuntimeOperatorPack() {
  write(JSON.stringify({ operatorPack: runtimeOperatorPack() }, null, 2) + "\n");
}

function printRuntimeRecoveryPack() {
  write(JSON.stringify({ recoveryPack: runtimeRecoveryPack() }, null, 2) + "\n");
}

function printRuntimeReviewPack() {
  write(JSON.stringify({
    reviewPack: runtimeReviewPack({
      role: readOption("--role"),
      workerId: readOption("--worker")
    })
  }, null, 2) + "\n");
}

function printRuntimeSessionPack() {
  const role = readOption("--role");
  const workerId = readOption("--worker");
  if (!role || !workerId) {
    writeErr("runtime:session-pack requires --role and --worker\n");
    exit(1);
  }
  write(JSON.stringify({
    sessionPack: runtimeSessionPack({
      role,
      workerId,
      mode: readOption("--mode")
    })
  }, null, 2) + "\n");
}

function printRuntimeQueuePack() {
  write(JSON.stringify({
    queuePack: runtimeQueuePack({
      workerId: readOption("--worker"),
      workerIds: readJsonOption("--workers")
    })
  }, null, 2) + "\n");
}

function printRuntimeWorkspacePack() {
  write(JSON.stringify({
    workspacePack: runtimeWorkspacePack({
      workerId: readOption("--worker"),
      workerIds: readJsonOption("--workers")
    })
  }, null, 2) + "\n");
}

function printRuntimeOwnerPack() {
  const role = readOption("--role");
  const workerId = readOption("--worker");
  if (!role || !workerId) {
    writeErr("runtime:owner-pack requires --role and --worker\n");
    exit(1);
  }
  write(JSON.stringify({
    ownerPack: runtimeOwnerPack({
      role,
      workerId
    })
  }, null, 2) + "\n");
}

function printRuntimeRolePack() {
  const role = readOption("--role");
  if (!role) {
    writeErr("runtime:role-pack requires --role\n");
    exit(1);
  }
  write(JSON.stringify({
    rolePack: runtimeRolePack({
      role,
      workerId: readOption("--worker"),
      mode: readOption("--mode")
    })
  }, null, 2) + "\n");
}

function printRuntimeVerifierPack() {
  const role = readOption("--role");
  const workerId = readOption("--worker");
  if (!role || !workerId) {
    writeErr("runtime:verifier-pack requires --role and --worker\n");
    exit(1);
  }
  write(JSON.stringify({
    verifierPack: runtimeVerifierPack({
      role,
      workerId
    })
  }, null, 2) + "\n");
}

function printRuntimeWorkerPack() {
  const role = readOption("--role");
  const workerId = readOption("--worker");
  if (!role || !workerId) {
    writeErr("runtime:worker-pack requires --role and --worker\n");
    exit(1);
  }
  write(JSON.stringify({
    workerPack: runtimeWorkerPack({
      role,
      workerId,
      mode: readOption("--mode")
    })
  }, null, 2) + "\n");
}

function printRuntimeDashboard() {
  write(JSON.stringify({ dashboard: runtimeDashboard() }, null, 2) + "\n");
}

function printRuntimeDispatch() {
  write(JSON.stringify({ dispatch: runtimeDispatch() }, null, 2) + "\n");
}

function printRuntimeDispatchPack() {
  write(JSON.stringify({
    dispatchPack: runtimeDispatchPack({
      workerId: readOption("--worker"),
      workerIds: readJsonOption("--workers")
    })
  }, null, 2) + "\n");
}

function printRuntimeFocus() {
  write(JSON.stringify({ focus: runtimeFocus() }, null, 2) + "\n");
}

function printRuntimeReview() {
  write(JSON.stringify({ review: runtimeReview() }, null, 2) + "\n");
}

function printRuntimeAlerts() {
  write(JSON.stringify({ alerts: runtimeAlerts() }, null, 2) + "\n");
}

function printRuntimeRoles() {
  write(JSON.stringify({ roles: runtimeRoles({ limit: readPositiveIntegerOption("--limit") }) }, null, 2) + "\n");
}

export {
  printRuntimeActivity,
  printRuntimeAlerts,
  printRuntimeAssignmentPack,
  printRuntimeCloseout,
  printRuntimeCloseoutPack,
  printRuntimeControlPack,
  printRuntimeDashboard,
  printRuntimeDispatch,
  printRuntimeDispatchPack,
  printRuntimeExecutionPack,
  printRuntimeFocus,
  printRuntimeHandoffPack,
  printRuntimeHandoffs,
  printRuntimeLeaderPack,
  printRuntimeOperatorPack,
  printRuntimeOwnerPack,
  printRuntimePickupPack,
  printRuntimeQueuePack,
  printRuntimeRecovery,
  printRuntimeRecoveryPack,
  printRuntimeReview,
  printRuntimeReviewPack,
  printRuntimeRolePack,
  printRuntimeRoles,
  printRuntimeSessionPack,
  printRuntimeSignalPack,
  printRuntimeSummaryPack,
  printRuntimeTriagePack,
  printRuntimeVerifierPack,
  printRuntimeWorkerPack,
  printRuntimeWorkspacePack
};
