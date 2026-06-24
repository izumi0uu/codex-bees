import {
  archiveSwarmMutation,
  initSwarmMutation,
  reopenSwarmMutation,
  restoreSwarmMutation,
  updateSwarmMutation
} from "./state-runtime.js";
import { writeMutationView } from "./state-cli-mutation-writers.js";
import { writeNamedView } from "./state-cli-view-writers.js";
import { readOption, requireOption } from "./state-cli-helpers.js";
import { readSwarmDefinitionOptions, requireSwarmId } from "./state-cli-swarm-lifecycle-options.js";

export function handleSwarmInit() {
  const objective = requireOption("--objective");
  const swarm = initSwarmMutation({
    objective,
    ...readSwarmDefinitionOptions()
  });
  writeNamedView("created", swarm);
}

export function handleSwarmArchive() {
  const id = requireSwarmId();
  writeMutationView("archived", archiveSwarmMutation({
    id,
    archivedBy: readOption("--by"),
    notes: readOption("--notes")
  }), { id });
}

export function handleSwarmRestore() {
  const id = requireSwarmId();
  writeMutationView("restored", restoreSwarmMutation({
    id,
    restoredBy: readOption("--by"),
    notes: readOption("--notes")
  }), { id, missingLabel: "archived swarm" });
}

export function handleSwarmReopen() {
  const id = requireSwarmId();
  writeMutationView("reopened", reopenSwarmMutation({
    id,
    reopenedBy: readOption("--by"),
    notes: readOption("--notes")
  }), { id });
}

export function handleSwarmUpdate() {
  const id = requireSwarmId();
  writeMutationView("updated", updateSwarmMutation({
    id,
    objective: readOption("--objective"),
    ...readSwarmDefinitionOptions()
  }), { id });
}
