import { getCommandCatalog } from "./state-command-catalog-assembly.js";
import { normalizeCommand } from "./state-command-options.js";
import { createCollectionView, createResolvedItemView } from "./state-view-helpers.js";

export function getCommandCatalogView() {
  const commands = getCommandCatalog();
  return createCollectionView("command_catalog_view", "commands", commands, {
    loadedReason: "command_catalog_loaded",
    emptyReason: "command_catalog_empty",
    counts: {
      totalCommands: commands.length
    }
  });
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
  return createResolvedItemView("command_catalog_entry_view", {
    requestLabel: "command",
    requestValue: command,
    matchedLabel: "matchedCommand",
    matchedValue: matchedEntry?.command,
    valueLabel: "entry",
    value: matchedEntry,
    loadedReason: "command_catalog_entry_loaded",
    missingReason: "command_catalog_entry_missing"
  });
}
