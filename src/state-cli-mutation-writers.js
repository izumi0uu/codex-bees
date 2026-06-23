import { exit, writeErr } from "./state-cli-helpers.js";
import { writeNamedView, writeView } from "./state-cli-view-writers.js";

export function writeMutationView(label, result, { id, missingLabel = "item", wrap = true } = {}) {
  if (!result) {
    writeErr(`Unknown ${missingLabel} id: ${id}\n`);
    exit(1);
  }
  if (result.error) {
    writeErr(`${result.error}\n`);
    exit(1);
  }
  if (!wrap) {
    writeView(result);
    return;
  }
  writeNamedView(label, result);
}
