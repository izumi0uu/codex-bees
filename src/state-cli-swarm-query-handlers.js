import { argv, exit, readOption, requireOption, write, writeErr } from "./state-cli-helpers.js";
import {
  getArchivedSwarmView,
  getSwarmView,
  listArchivedSwarmsView,
  listSwarmsView,
  swarmBlockers,
  swarmBrief,
  swarmBundle,
  swarmCloseout,
  swarmDispatchBundle,
  swarmOverview,
  validateSwarm
} from "./state-runtime.js";

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

function handleSwarmDispatchBundle() {
  const id = requireOption("--id");
  const dispatchBundle = swarmDispatchBundle(id);
  if (!dispatchBundle) {
    writeErr(`Unknown swarm id: ${id}\n`);
    exit(1);
  }
  write(JSON.stringify({ dispatchBundle }, null, 2) + "\n");
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

export {
  printSwarms,
  handleSwarmGet,
  handleSwarmArchiveList,
  handleSwarmArchiveGet,
  handleSwarmBrief,
  handleSwarmBundle,
  handleSwarmBlockers,
  handleSwarmCloseout,
  handleSwarmDispatchBundle,
  handleSwarmCheck,
  handleSwarmOverview
};
