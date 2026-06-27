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
import {
  buildRuntimeDispatchRankingView,
  buildRuntimeFocusCandidatesView
} from "../runtime/ranking/views.js";
import { readPositiveIntegerOption } from "./helpers.js";
import { writeNamedView, writeView } from "./view-writers.js";

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

function printRuntimeDispatchRanking() {
  writeView(buildRuntimeDispatchRankingView(runtimeDispatch()));
}

function printRuntimeFocus() {
  writeNamedView("focus", runtimeFocus());
}

function printRuntimeFocusCandidates() {
  writeView(buildRuntimeFocusCandidatesView(runtimeFocus()));
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
  printRuntimeDispatchRanking,
  printRuntimeFocus,
  printRuntimeFocusCandidates,
  printRuntimeHandoffs,
  printRuntimeRecovery,
  printRuntimeReview,
  printRuntimeRoles
};
