import { requireOption } from "./helpers.js";
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
} from "../../state-runtime.js";
import { writeLookupView } from "./lookup-writers.js";

export function handleSwarmGet() {
  const id = requireOption("--id");
  writeLookupView("swarm", getSwarmView, id, "swarm");
}

export function handleSwarmArchiveGet() {
  const id = requireOption("--id");
  writeLookupView("archivedSwarm", getArchivedSwarmView, id, "archived swarm");
}

export function handleSwarmBrief() {
  const id = requireOption("--id");
  writeLookupView("brief", swarmBrief, id, "swarm");
}

export function handleSwarmBundle() {
  const id = requireOption("--id");
  writeLookupView("bundle", swarmBundle, id, "swarm");
}

export function handleSwarmBlockers() {
  const id = requireOption("--id");
  writeLookupView("blockers", swarmBlockers, id, "swarm");
}

export function handleSwarmCloseout() {
  const id = requireOption("--id");
  writeLookupView("closeout", swarmCloseout, id, "swarm");
}

export function handleSwarmDispatchBundle() {
  const id = requireOption("--id");
  writeLookupView("dispatchBundle", swarmDispatchBundle, id, "swarm");
}

export function handleSwarmCheck() {
  const id = requireOption("--id");
  writeLookupView("validation", validateSwarm, id, "swarm");
}

export function handleSwarmOverview() {
  const id = requireOption("--id");
  writeLookupView("overview", swarmOverview, id, "swarm");
}
