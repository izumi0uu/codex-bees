import { exit, readJsonOption, readOption, readPositiveIntegerOption, requireOption, write, writeErr } from "./state-cli-helpers.js";
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

function writeSwarmMutation(label, result, { id, missingLabel = "swarm", wrap = true } = {}) {
  if (!result) {
    writeErr(`Unknown ${missingLabel} id: ${id}\n`);
    exit(1);
  }
  if (result.error) {
    writeErr(`${result.error}\n`);
    exit(1);
  }
  write(JSON.stringify(wrap ? { [label]: result } : result, null, 2) + "\n");
}

function handleSwarmInit() {
  const objective = requireOption("--objective");
  const swarm = initSwarmMutation({
    objective,
    ...readSwarmDefinitionOptions()
  });
  write(JSON.stringify({ created: swarm }, null, 2) + "\n");
}

function handleSwarmArchive() {
  const id = requireSwarmId();
  writeSwarmMutation("archived", archiveSwarmMutation({
    id,
    archivedBy: readOption("--by"),
    notes: readOption("--notes")
  }), { id });
}

function handleSwarmRestore() {
  const id = requireSwarmId();
  writeSwarmMutation("restored", restoreSwarmMutation({
    id,
    restoredBy: readOption("--by"),
    notes: readOption("--notes")
  }), { id, missingLabel: "archived swarm" });
}

function handleSwarmReopen() {
  const id = requireSwarmId();
  writeSwarmMutation("reopened", reopenSwarmMutation({
    id,
    reopenedBy: readOption("--by"),
    notes: readOption("--notes")
  }), { id });
}

function handleSwarmUpdate() {
  const id = requireSwarmId();
  writeSwarmMutation("updated", updateSwarmMutation({
    id,
    objective: readOption("--objective"),
    ...readSwarmDefinitionOptions()
  }), { id });
}

function handleSwarmDispatch() {
  const id = requireSwarmId();
  const claimedBy = requireOption("--by");
  writeSwarmMutation("dispatched", dispatchSwarmLane({
    id,
    claimedBy,
    owner: readOption("--owner")
  }), { id });
}

function handleSwarmSync() {
  const id = requireSwarmId();
  writeSwarmMutation("synced", syncSwarmStatus(id), { id });
}

function handleSwarmStart() {
  const id = requireSwarmId();
  writeSwarmMutation("activated", activateSwarm({
    id,
    ...readSwarmOwnerNotesOptions()
  }), { id });
}

function handleSwarmBlock() {
  const id = requireSwarmId();
  writeSwarmMutation("blocked", blockSwarm({
    id,
    ...readSwarmOwnerNotesOptions()
  }), { id });
}

function handleSwarmDone() {
  const id = requireSwarmId();
  writeSwarmMutation("completed", completeSwarm({
    id,
    ...readSwarmOwnerNotesOptions()
  }), { id });
}

function handleSwarmCancel() {
  const id = requireSwarmId();
  writeSwarmMutation("cancelled", cancelSwarm({
    id,
    ...readSwarmOwnerNotesOptions()
  }), { id });
}

function handleSwarmQueue() {
  const id = requireSwarmId();
  writeSwarmMutation(null, queueSwarmTasks({ id }), { id, wrap: false });
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
