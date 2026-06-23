import { readJsonOption, readOption, readPositiveIntegerOption, requireOption } from "./state-cli-helpers.js";
import {
  activateSwarm,
  archiveSwarmMutation,
  blockSwarm,
  cancelSwarm,
  completeSwarm,
  dispatchSwarmLane,
  initSwarmMutation,
  queueSwarmTasks,
  reopenSwarmMutation,
  restoreSwarmMutation,
  syncSwarmStatus,
  updateSwarmMutation
} from "./state-runtime.js";
import { writeMutationView } from "./state-cli-mutation-writers.js";
import { writeNamedView } from "./state-cli-view-writers.js";

function requireSwarmId() {
  return requireOption("--id");
}

function readSwarmDefinitionOptions() {
  return {
    topology: readOption("--topology"),
    maxWorkers: readPositiveIntegerOption("--max-workers"),
    owner: readOption("--owner"),
    laneSource: readOption("--lane-source"),
    notes: readOption("--notes"),
    lanes: readJsonOption("--lanes")
  };
}

function readSwarmOwnerNotesOptions() {
  return {
    owner: readOption("--owner"),
    notes: readOption("--notes")
  };
}

function handleSwarmInit() {
  const objective = requireOption("--objective");
  const swarm = initSwarmMutation({
    objective,
    ...readSwarmDefinitionOptions()
  });
  writeNamedView("created", swarm);
}

function handleSwarmArchive() {
  const id = requireSwarmId();
  writeMutationView("archived", archiveSwarmMutation({
    id,
    archivedBy: readOption("--by"),
    notes: readOption("--notes")
  }), { id });
}

function handleSwarmRestore() {
  const id = requireSwarmId();
  writeMutationView("restored", restoreSwarmMutation({
    id,
    restoredBy: readOption("--by"),
    notes: readOption("--notes")
  }), { id, missingLabel: "archived swarm" });
}

function handleSwarmReopen() {
  const id = requireSwarmId();
  writeMutationView("reopened", reopenSwarmMutation({
    id,
    reopenedBy: readOption("--by"),
    notes: readOption("--notes")
  }), { id });
}

function handleSwarmUpdate() {
  const id = requireSwarmId();
  writeMutationView("updated", updateSwarmMutation({
    id,
    objective: readOption("--objective"),
    ...readSwarmDefinitionOptions()
  }), { id });
}

function handleSwarmDispatch() {
  const id = requireSwarmId();
  const claimedBy = requireOption("--by");
  writeMutationView("dispatched", dispatchSwarmLane({
    id,
    claimedBy,
    owner: readOption("--owner")
  }), { id });
}

function handleSwarmSync() {
  const id = requireSwarmId();
  writeMutationView("synced", syncSwarmStatus(id), { id });
}

function handleSwarmStart() {
  const id = requireSwarmId();
  writeMutationView("activated", activateSwarm({
    id,
    ...readSwarmOwnerNotesOptions()
  }), { id });
}

function handleSwarmBlock() {
  const id = requireSwarmId();
  writeMutationView("blocked", blockSwarm({
    id,
    ...readSwarmOwnerNotesOptions()
  }), { id });
}

function handleSwarmDone() {
  const id = requireSwarmId();
  writeMutationView("completed", completeSwarm({
    id,
    ...readSwarmOwnerNotesOptions()
  }), { id });
}

function handleSwarmCancel() {
  const id = requireSwarmId();
  writeMutationView("cancelled", cancelSwarm({
    id,
    ...readSwarmOwnerNotesOptions()
  }), { id });
}

function handleSwarmQueue() {
  const id = requireSwarmId();
  writeMutationView(null, queueSwarmTasks({ id }), { id, wrap: false });
}

export {
  handleSwarmInit,
  handleSwarmArchive,
  handleSwarmRestore,
  handleSwarmReopen,
  handleSwarmUpdate,
  handleSwarmDispatch,
  handleSwarmSync,
  handleSwarmStart,
  handleSwarmBlock,
  handleSwarmDone,
  handleSwarmCancel,
  handleSwarmQueue
};
