import { getCommandCatalog } from "./state-command-catalog-assembly.js";
import { normalizeCommand } from "./state-command-options.js";

export function getCommandCatalogView() {
  const commands = getCommandCatalog();
  return {
    kind: "command_catalog_view",
    recommendedReason: commands.length > 0 ? "command_catalog_loaded" : "command_catalog_empty",
    counts: {
      totalCommands: commands.length
    },
    commands
  };
}

export function getCommandCatalogEntry(command) {
  const normalizedCommand = normalizeCommand(command);
  if (!normalizedCommand) {
    return undefined;
  }

  return getCommandCatalog().find((entry) => entry.command === normalizedCommand);
}

export function getCommandCatalogEntryView(command) {
  const matchedEntry = getCommandCatalogEntry(command);

  return {
    kind: "command_catalog_entry_view",
    recommendedReason: matchedEntry ? "command_catalog_entry_loaded" : "command_catalog_entry_missing",
    command: command ?? null,
    matchedCommand: matchedEntry?.command ?? null,
    entry: matchedEntry ?? null
  };
}
