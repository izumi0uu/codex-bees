import { exit, requireOption, write, writeErr } from "./state-cli-helpers.js";
import {
  getArchivedSwarmView,
  getSwarmView,
  swarmBlockers,
  swarmBrief,
  swarmBundle,
  swarmCloseout,
  swarmDispatchBundle,
  swarmOverview,
  validateSwarm
} from "./state-runtime.js";

function writeSwarmLookup(label, lookup, id, missingLabel = "swarm") {
  const value = lookup(id);
  if (!value) {
    writeErr(`Unknown ${missingLabel} id: ${id}\n`);
    exit(1);
  }
  write(JSON.stringify({ [label]: value }, null, 2) + "\n");
}

export function handleSwarmGet() {
  const id = requireOption("--id");
  writeSwarmLookup("swarm", getSwarmView, id);
}

export function handleSwarmArchiveGet() {
  const id = requireOption("--id");
  writeSwarmLookup("archivedSwarm", getArchivedSwarmView, id, "archived swarm");
}

export function handleSwarmBrief() {
  const id = requireOption("--id");
  writeSwarmLookup("brief", swarmBrief, id);
}

export function handleSwarmBundle() {
  const id = requireOption("--id");
  writeSwarmLookup("bundle", swarmBundle, id);
}

export function handleSwarmBlockers() {
  const id = requireOption("--id");
  writeSwarmLookup("blockers", swarmBlockers, id);
}

export function handleSwarmCloseout() {
  const id = requireOption("--id");
  writeSwarmLookup("closeout", swarmCloseout, id);
}

export function handleSwarmDispatchBundle() {
  const id = requireOption("--id");
  writeSwarmLookup("dispatchBundle", swarmDispatchBundle, id);
}

export function handleSwarmCheck() {
  const id = requireOption("--id");
  writeSwarmLookup("validation", validateSwarm, id);
}

export function handleSwarmOverview() {
  const id = requireOption("--id");
  writeSwarmLookup("overview", swarmOverview, id);
}
