import {
  dispatchSwarmLane,
  queueSwarmTasks,
  syncSwarmStatus
} from "../../state-runtime.js";
import { writeMutationView } from "./mutation-writers.js";
import { readOption, requireOption } from "./helpers.js";
import { requireSwarmId } from "./swarm-lifecycle-options.js";

export function handleSwarmDispatch() {
  const id = requireSwarmId();
  const claimedBy = requireOption("--by");
  writeMutationView("dispatched", dispatchSwarmLane({
    id,
    claimedBy,
    owner: readOption("--owner")
  }), { id });
}

export function handleSwarmSync() {
  const id = requireSwarmId();
  writeMutationView("synced", syncSwarmStatus(id), { id });
}

export function handleSwarmQueue() {
  const id = requireSwarmId();
  writeMutationView(null, queueSwarmTasks({ id }), { id, wrap: false });
}
