import { argv, exit, readJsonOption, readListOption, readOption, readPositiveIntegerOption, requireOption, write, writeErr } from "./state-cli-helpers.js";
import { planSwarm, planTask, queueTasksFromPlan } from "./planner.js";
import {
  activateSwarm,
  addTasks,
  archiveSwarmMutation,
  blockSwarm,
  cancelSwarm,
  completeSwarm,
  dispatchSwarmLane,
  getArchivedSwarmView,
  getMemoryView,
  getSwarmView,
  initSwarm,
  initSwarmMutation,
  listArchivedSwarmsView,
  listMemoriesView,
  listSwarmsView,
  queueSwarmTasks,
  searchMemoriesView,
  storeMemoryMutation,
  swarmBlockers,
  swarmBrief,
  swarmBundle,
  swarmCloseout,
  swarmDispatchBundle,
  swarmOverview,
  syncSwarmStatus,
  updateSwarmMutation,
  validateSwarm
} from "./state.js";

function printSwarms() {
  const filters = {
    status: readOption("--status"),
    topology: readOption("--topology"),
    owner: readOption("--owner")
  };
  const detailed = argv.includes("--detailed");
  write(
    JSON.stringify(
      {
        swarms: listSwarmsView(filters, { detailed })
      },
      null,
      2
    ) + "\n"
  );
}

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

function handleSwarmGet() {
  const id = requireOption("--id");
  const swarm = getSwarmView(id);
  if (!swarm) {
    writeErr(`Unknown swarm id: ${id}\n`);
    exit(1);
  }
  write(JSON.stringify({ swarm }, null, 2) + "\n");
}

function handleSwarmArchiveList() {
  write(JSON.stringify({ archivedSwarms: listArchivedSwarmsView() }, null, 2) + "\n");
}

function handleSwarmArchiveGet() {
  const id = requireOption("--id");
  const archivedSwarm = getArchivedSwarmView(id);
  if (!archivedSwarm) {
    writeErr(`Unknown archived swarm id: ${id}\n`);
    exit(1);
  }
  write(JSON.stringify({ archivedSwarm }, null, 2) + "\n");
}

function handleSwarmBrief() {
  const id = requireOption("--id");
  const brief = swarmBrief(id);
  if (!brief) {
    writeErr(`Unknown swarm id: ${id}\n`);
    exit(1);
  }
  write(JSON.stringify({ brief }, null, 2) + "\n");
}

function handleSwarmBundle() {
  const id = requireOption("--id");
  const bundle = swarmBundle(id);
  if (!bundle) {
    writeErr(`Unknown swarm id: ${id}\n`);
    exit(1);
  }
  write(JSON.stringify({ bundle }, null, 2) + "\n");
}

function handleSwarmBlockers() {
  const id = requireOption("--id");
  const blockers = swarmBlockers(id);
  if (!blockers) {
    writeErr(`Unknown swarm id: ${id}\n`);
    exit(1);
  }
  write(JSON.stringify({ blockers }, null, 2) + "\n");
}

function handleSwarmCloseout() {
  const id = requireOption("--id");
  const closeout = swarmCloseout(id);
  if (!closeout) {
    writeErr(`Unknown swarm id: ${id}\n`);
    exit(1);
  }
  write(JSON.stringify({ closeout }, null, 2) + "\n");
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

function handleSwarmDispatchBundle() {
  const id = requireOption("--id");
  const dispatchBundle = swarmDispatchBundle(id);
  if (!dispatchBundle) {
    writeErr(`Unknown swarm id: ${id}\n`);
    exit(1);
  }
  write(JSON.stringify({ dispatchBundle }, null, 2) + "\n");
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

function handleSwarmCheck() {
  const id = requireOption("--id");
  const validation = validateSwarm(id);
  if (!validation) {
    writeErr(`Unknown swarm id: ${id}\n`);
    exit(1);
  }
  write(JSON.stringify({ validation }, null, 2) + "\n");
}

function handleSwarmOverview() {
  const id = requireOption("--id");
  const overview = swarmOverview(id);
  if (!overview) {
    writeErr(`Unknown swarm id: ${id}\n`);
    exit(1);
  }
  write(JSON.stringify({ overview }, null, 2) + "\n");
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
  printSwarms,
  handleSwarmInit,
  handleSwarmGet,
  handleSwarmArchiveList,
  handleSwarmArchiveGet,
  handleSwarmBrief,
  handleSwarmBundle,
  handleSwarmBlockers,
  handleSwarmCloseout,
  handleSwarmArchive,
  handleSwarmDispatchBundle,
  handleSwarmUpdate,
  handleSwarmCheck,
  handleSwarmOverview,
  handleSwarmDispatch,
  handleSwarmSync,
  handleSwarmStart,
  handleSwarmBlock,
  handleSwarmDone,
  handleSwarmCancel,
  handleSwarmQueue
};
