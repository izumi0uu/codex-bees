import {
  runtimeActivity,
  runtimeAlerts,
  runtimeCloseout,
  runtimeDashboard,
  runtimeDispatch,
  runtimeFocus,
  runtimeHandoffs,
  runtimeRecovery,
  runtimeReview,
  runtimeRoles
} from "./state-runtime.js";
import { readPositiveIntegerOption, write } from "./state-cli-helpers.js";

function printRuntimeActivity() {
  write(JSON.stringify({ activity: runtimeActivity({ limit: readPositiveIntegerOption("--limit") }) }, null, 2) + "\n");
}

function printRuntimeCloseout() {
  write(JSON.stringify({ closeout: runtimeCloseout() }, null, 2) + "\n");
}

function printRuntimeHandoffs() {
  write(JSON.stringify({ handoffs: runtimeHandoffs() }, null, 2) + "\n");
}

function printRuntimeRecovery() {
  write(JSON.stringify({ recovery: runtimeRecovery() }, null, 2) + "\n");
}

function printRuntimeDashboard() {
  write(JSON.stringify({ dashboard: runtimeDashboard() }, null, 2) + "\n");
}

function printRuntimeDispatch() {
  write(JSON.stringify({ dispatch: runtimeDispatch() }, null, 2) + "\n");
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
  printRuntimeCloseout,
  printRuntimeDashboard,
  printRuntimeDispatch,
  printRuntimeFocus,
  printRuntimeHandoffs,
  printRuntimeRecovery,
  printRuntimeReview,
  printRuntimeRoles
};
