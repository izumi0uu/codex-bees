import { argv, readOption } from "./state-cli-helpers.js";
import { listArchivedSwarmsView, listSwarmsView } from "./state-runtime.js";
import { writeNamedView } from "./state-cli-view-writers.js";

function readSwarmFilters() {
  return {
    status: readOption("--status"),
    topology: readOption("--topology"),
    owner: readOption("--owner")
  };
}

export function printSwarms() {
  const detailed = argv.includes("--detailed");
  writeNamedView("swarms", listSwarmsView(readSwarmFilters(), { detailed }));
}

export function handleSwarmArchiveList() {
  writeNamedView("archivedSwarms", listArchivedSwarmsView());
}
