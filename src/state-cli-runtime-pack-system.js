import { runtimeHandoffPack, runtimeOperatorPack, runtimeSignalPack, runtimeTriagePack } from "./state-runtime.js";
import { readPositiveIntegerOption } from "./state-cli-helpers.js";
import { writeNamedView } from "./state-cli-view-writers.js";

export function printRuntimeHandoffPack() {
  writeNamedView("handoffPack", runtimeHandoffPack());
}

export function printRuntimeTriagePack() {
  writeNamedView("triagePack", runtimeTriagePack());
}

export function printRuntimeSignalPack() {
  writeNamedView("signalPack", runtimeSignalPack({ limit: readPositiveIntegerOption("--limit") }));
}

export function printRuntimeOperatorPack() {
  writeNamedView("operatorPack", runtimeOperatorPack());
}
