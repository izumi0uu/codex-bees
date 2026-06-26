import { readListOption, readOption, requireOption } from "./helpers.js";
import { readRequiredRoleWorkerOptions } from "./role-worker-options.js";

export function requireTaskId() {
  return requireOption("--id");
}

export function readTaskDefinitionOptions() {
  return {
    status: readOption("--status"),
    owner: readOption("--owner"),
    verifier: readOption("--verifier"),
    objective: readOption("--objective"),
    lane: readOption("--lane"),
    lanePurpose: readOption("--lane-purpose"),
    swarmId: readOption("--swarm-id"),
    scope: readListOption("--scope"),
    dependsOn: readListOption("--depends-on"),
    acceptance: readListOption("--acceptance", "|"),
    verification: readListOption("--verification", "|"),
    notes: readOption("--notes")
  };
}

export function readTaskWorkerOptions() {
  return readRequiredRoleWorkerOptions({ mode: true });
}

export function readTaskReviewOptions() {
  return {
    reviewedBy: requireOption("--by"),
    notes: readOption("--notes"),
    reviewEvidence: readListOption("--evidence", "|")
  };
}
