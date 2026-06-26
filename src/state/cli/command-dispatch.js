import { COORDINATION_CLI_COMMAND_DISPATCH_ENTRIES } from "./command-dispatch-coordination.js";
import { CORE_CLI_COMMAND_DISPATCH_ENTRIES } from "./command-dispatch-core.js";
import { RUNTIME_CLI_COMMAND_DISPATCH_ENTRIES } from "./command-dispatch-runtime.js";

const CLI_COMMAND_ALIASES = new Map([
  ["help", "--help"],
  ["version", "--version"]
]);

const CLI_COMMAND_HANDLERS = new Map([
  ...CORE_CLI_COMMAND_DISPATCH_ENTRIES,
  ...RUNTIME_CLI_COMMAND_DISPATCH_ENTRIES,
  ...COORDINATION_CLI_COMMAND_DISPATCH_ENTRIES
]);

export function normalizeCliCommand(command) {
  if (typeof command === "undefined") {
    return "run";
  }
  return CLI_COMMAND_ALIASES.get(command) ?? command;
}

export function getCliDispatchCommands() {
  return [...CLI_COMMAND_HANDLERS.keys()];
}

export async function runCliCommand(command, options = {}) {
  const normalizedCommand = normalizeCliCommand(command);
  const handler = CLI_COMMAND_HANDLERS.get(normalizedCommand);
  if (!handler) {
    return false;
  }
  await handler(options);
  return true;
}
