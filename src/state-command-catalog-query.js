import { PRODUCT_NAME } from "./metadata.js";
import { getCommandCatalog } from "./state-command-catalog-assembly.js";
import {
  formatCommonCommandPath,
  formatCommandGroupEntries,
  getCommonCommandPaths,
  groupCommandCatalog
} from "./state-command-surface.js";
import { normalizeCommand } from "./state-command-options.js";
import { createCollectionView, createResolvedItemView } from "./state-view-helpers.js";

export function getCommandCatalogView() {
  const commands = getCommandCatalog();
  const groups = groupCommandCatalog(commands).map((group) => formatCommandGroupEntries(group, PRODUCT_NAME));
  const commonPaths = getCommonCommandPaths().map((path) => formatCommonCommandPath(path, PRODUCT_NAME));
  return createCollectionView("command_catalog_view", "commands", commands, {
    loadedReason: "command_catalog_loaded",
    emptyReason: "command_catalog_empty",
    counts: {
      totalCommands: commands.length,
      totalGroups: groups.length,
      totalCommonPaths: commonPaths.length
    },
    extra: {
      groups,
      commonPaths
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
