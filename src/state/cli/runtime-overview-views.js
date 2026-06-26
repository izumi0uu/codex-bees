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
} from "../../state-runtime.js";
import { readPositiveIntegerOption } from "./helpers.js";
import { writeNamedView } from "./view-writers.js";

function printRuntimeActivity() {
  writeNamedView("activity", runtimeActivity({ limit: readPositiveIntegerOption("--limit") }));
}

function printRuntimeCloseout() {
  writeNamedView("closeout", runtimeCloseout());
}

function printRuntimeHandoffs() {
  writeNamedView("handoffs", runtimeHandoffs());
}

function printRuntimeRecovery() {
  writeNamedView("recovery", runtimeRecovery());
}

function printRuntimeDashboard() {
  writeNamedView("dashboard", runtimeDashboard());
}

function printRuntimeDispatch() {
  writeNamedView("dispatch", runtimeDispatch());
}

function printRuntimeFocus() {
  writeNamedView("focus", runtimeFocus());
}

function printRuntimeReview() {
  writeNamedView("review", runtimeReview());
}

function printRuntimeAlerts() {
  writeNamedView("alerts", runtimeAlerts());
}

function printRuntimeRoles() {
  writeNamedView("roles", runtimeRoles({ limit: readPositiveIntegerOption("--limit") }));
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
