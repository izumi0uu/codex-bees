import { write } from "./helpers.js";

export function writeView(view) {
  write(JSON.stringify(view, null, 2) + "\n");
}

export function writeNamedView(label, view) {
  writeView({ [label]: view });
}
