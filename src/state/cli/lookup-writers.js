import { exit, writeErr } from "./helpers.js";
import { writeNamedView } from "./view-writers.js";

export function writeLookupView(label, lookup, id, missingLabel) {
  const value = lookup(id);
  if (!value) {
    writeErr(`Unknown ${missingLabel} id: ${id}\n`);
    exit(1);
  }
  writeNamedView(label, value);
}
