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

function handleSwarmInit() {
  const objective = requireOption("--objective");
  const swarm = initSwarmMutation({
    objective,
    topology: readOption("--topology"),
    maxWorkers: readPositiveIntegerOption("--max-workers"),
    owner: readOption("--owner"),
    laneSource: readOption("--lane-source"),
    notes: readOption("--notes"),
    lanes: readJsonOption("--lanes")
  });
  write(JSON.stringify({ created: swarm }, null, 2) + "\n");
}

function handleSwarmArchive() {
  const id = requireOption("--id");
  const archived = archiveSwarmMutation({
    id,
    archivedBy: readOption("--by"),
    notes: readOption("--notes")
  });
  if (!archived) {
    writeErr(`Unknown swarm id: ${id}\n`);
    exit(1);
  }
  if (archived.error) {
    writeErr(`${archived.error}\n`);
    exit(1);
  }
  write(JSON.stringify({ archived }, null, 2) + "\n");
}

function handleSwarmRestore() {
  const id = requireOption("--id");
  const restored = restoreSwarmMutation({
    id,
    restoredBy: readOption("--by"),
    notes: readOption("--notes")
  });
  if (!restored) {
    writeErr(`Unknown archived swarm id: ${id}\n`);
    exit(1);
  }
  if (restored.error) {
    writeErr(`${restored.error}\n`);
    exit(1);
  }
  write(JSON.stringify({ restored }, null, 2) + "\n");
}

function handleSwarmReopen() {
  const id = requireOption("--id");
  const reopened = reopenSwarmMutation({
    id,
    reopenedBy: readOption("--by"),
    notes: readOption("--notes")
  });
  if (!reopened) {
    writeErr(`Unknown swarm id: ${id}\n`);
    exit(1);
  }
  if (reopened.error) {
    writeErr(`${reopened.error}\n`);
    exit(1);
  }
  write(JSON.stringify({ reopened }, null, 2) + "\n");
}

function handleSwarmUpdate() {
  const id = requireOption("--id");
  const swarm = updateSwarmMutation({
    id,
    objective: readOption("--objective"),
    topology: readOption("--topology"),
    maxWorkers: readPositiveIntegerOption("--max-workers"),
    owner: readOption("--owner"),
    laneSource: readOption("--lane-source"),
    notes: readOption("--notes"),
    lanes: readJsonOption("--lanes")
  });

  if (!swarm) {
    writeErr(`Unknown swarm id: ${id}\n`);
    exit(1);
  }
  if (swarm.error) {
    writeErr(`${swarm.error}\n`);
    exit(1);
  }

  write(JSON.stringify({ updated: swarm }, null, 2) + "\n");
}

function handleSwarmDispatch() {
  const id = requireOption("--id");
  const claimedBy = requireOption("--by");
  const result = dispatchSwarmLane({
    id,
    claimedBy,
    owner: readOption("--owner")
  });

  if (!result) {
    writeErr(`Unknown swarm id: ${id}\n`);
    exit(1);
  }
  if (result.error) {
    writeErr(`${result.error}\n`);
    exit(1);
  }

  write(JSON.stringify({ dispatched: result }, null, 2) + "\n");
}

function handleSwarmSync() {
  const id = requireOption("--id");
  const result = syncSwarmStatus(id);
  if (!result) {
    writeErr(`Unknown swarm id: ${id}\n`);
    exit(1);
  }
  write(JSON.stringify({ synced: result }, null, 2) + "\n");
}

function handleSwarmStart() {
  const id = requireOption("--id");
  const swarm = activateSwarm({
    id,
    owner: readOption("--owner"),
    notes: readOption("--notes")
  });

  if (!swarm) {
    writeErr(`Unknown swarm id: ${id}\n`);
    exit(1);
  }
  if (swarm.error) {
    writeErr(`${swarm.error}\n`);
    exit(1);
  }

  write(JSON.stringify({ activated: swarm }, null, 2) + "\n");
}

function handleSwarmBlock() {
  const id = requireOption("--id");
  const swarm = blockSwarm({
    id,
    owner: readOption("--owner"),
    notes: readOption("--notes")
  });

  if (!swarm) {
    writeErr(`Unknown swarm id: ${id}\n`);
    exit(1);
  }
  if (swarm.error) {
    writeErr(`${swarm.error}\n`);
    exit(1);
  }

  write(JSON.stringify({ blocked: swarm }, null, 2) + "\n");
}

function handleSwarmDone() {
  const id = requireOption("--id");
  const swarm = completeSwarm({
    id,
    owner: readOption("--owner"),
    notes: readOption("--notes")
  });

  if (!swarm) {
    writeErr(`Unknown swarm id: ${id}\n`);
    exit(1);
  }
  if (swarm.error) {
    writeErr(`${swarm.error}\n`);
    exit(1);
  }

  write(JSON.stringify({ completed: swarm }, null, 2) + "\n");
}

function handleSwarmCancel() {
  const id = requireOption("--id");
  const swarm = cancelSwarm({
    id,
    owner: readOption("--owner"),
    notes: readOption("--notes")
  });

  if (!swarm) {
    writeErr(`Unknown swarm id: ${id}\n`);
    exit(1);
  }
  if (swarm.error) {
    writeErr(`${swarm.error}\n`);
    exit(1);
  }

  write(JSON.stringify({ cancelled: swarm }, null, 2) + "\n");
}

function handleSwarmQueue() {
  const id = requireOption("--id");
  const result = queueSwarmTasks({ id });
  if (!result) {
    writeErr(`Unknown swarm id: ${id}\n`);
    exit(1);
  }
  if (result.error) {
    writeErr(`${result.error}\n`);
    exit(1);
  }

  write(JSON.stringify(result, null, 2) + "\n");
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
