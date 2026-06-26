import {
  activateSwarm,
  blockSwarm,
  cancelSwarm,
  completeSwarm
} from "../../state-runtime.js";
import { writeMutationView } from "./mutation-writers.js";
import { requireSwarmId, readSwarmOwnerNotesOptions } from "./swarm-lifecycle-options.js";

export function handleSwarmStart() {
  const id = requireSwarmId();
  writeMutationView("activated", activateSwarm({
    id,
    ...readSwarmOwnerNotesOptions()
  }), { id });
}

export function handleSwarmBlock() {
  const id = requireSwarmId();
  writeMutationView("blocked", blockSwarm({
    id,
    ...readSwarmOwnerNotesOptions()
  }), { id });
}

export function handleSwarmDone() {
  const id = requireSwarmId();
  writeMutationView("completed", completeSwarm({
    id,
    ...readSwarmOwnerNotesOptions()
  }), { id });
}

export function handleSwarmCancel() {
  const id = requireSwarmId();
  writeMutationView("cancelled", cancelSwarm({
    id,
    ...readSwarmOwnerNotesOptions()
  }), { id });
}
