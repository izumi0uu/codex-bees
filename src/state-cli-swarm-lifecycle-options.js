import { readJsonOption, readOption, readPositiveIntegerOption, requireOption } from "./state-cli-helpers.js";

export function requireSwarmId() {
  return requireOption("--id");
}

export function readSwarmDefinitionOptions() {
  return {
    topology: readOption("--topology"),
    maxWorkers: readPositiveIntegerOption("--max-workers"),
    owner: readOption("--owner"),
    laneSource: readOption("--lane-source"),
    notes: readOption("--notes"),
    lanes: readJsonOption("--lanes")
  };
}

export function readSwarmOwnerNotesOptions() {
  return {
    owner: readOption("--owner"),
    notes: readOption("--notes")
  };
}
