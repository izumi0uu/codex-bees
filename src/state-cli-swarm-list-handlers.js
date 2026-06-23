import { argv, readOption, write } from "./state-cli-helpers.js";
import { listArchivedSwarmsView, listSwarmsView } from "./state-runtime.js";

function readSwarmFilters() {
  return {
    status: readOption("--status"),
    topology: readOption("--topology"),
    owner: readOption("--owner")
  };
}

export function printSwarms() {
  const detailed = argv.includes("--detailed");
  write(JSON.stringify({ swarms: listSwarmsView(readSwarmFilters(), { detailed }) }, null, 2) + "\n");
}

export function handleSwarmArchiveList() {
  write(JSON.stringify({ archivedSwarms: listArchivedSwarmsView() }, null, 2) + "\n");
}
