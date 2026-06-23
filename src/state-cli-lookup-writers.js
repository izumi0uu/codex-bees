import { exit, writeErr } from "./state-cli-helpers.js";
import { writeNamedView } from "./state-cli-view-writers.js";

export function writeLookupView(label, lookup, id, missingLabel) {
  const value = lookup(id);
  if (!value) {
    writeErr(`Unknown ${missingLabel} id: ${id}\n`);
    exit(1);
  }
  writeNamedView(label, value);
}
