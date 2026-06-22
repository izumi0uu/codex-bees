import {
  getMcpCommandCatalog,
  getMcpCommandCatalogEntry,
  getMcpCommandCatalogEntryView,
  getMcpCommandCatalogView,
  getMcpHelpView,
  renderMcpHelpText
} from "./state-mcp-cli.js";
import { getBaseCommandCatalogDefinitions } from "./state-command-catalog-definitions.js";
import { formatCommandUsage, getCommandHelpSpec } from "./state-command-help-spec.js";
import {
  cloneEntries,
  DIR_OPTION,
  FORCE_OPTION,
  formatOptionLines,
  getCommandAliases,
  HELP_OPTION,
  normalizeCommand,
  PREVIEW_OPTION,
  pushCommandHelpSection,
  TARGET_OPTION
} from "./state-command-options.js";
import {
  getInitCommandCatalog,
  getInitCommandCatalogEntry,
  getInitCommandCatalogEntryView,
  getInitCommandCatalogView
} from "./state-command-init-options.js";

export {
  getMcpCommandCatalog,
  getMcpCommandCatalogEntry,
  getMcpCommandCatalogEntryView,
  getMcpCommandCatalogView,
  getMcpHelpView,
  renderMcpHelpText
};

export {
  DIR_OPTION,
  FORCE_OPTION,
  HELP_OPTION,
  PREVIEW_OPTION,
  TARGET_OPTION,
  formatOptionLines,
  getCommandAliases,
  getCommandHelpSpec,
  getInitCommandCatalog,
  getInitCommandCatalogEntry,
  getInitCommandCatalogEntryView,
  getInitCommandCatalogView,
  normalizeCommand,
  pushCommandHelpSection
};

function getStructuredCommandOptions(command, entry) {
  if (command === "init") {
    return getInitCommandCatalog();
  }

  if (command === "mcp") {
    return getMcpCommandCatalog();
  }

  const helpSpec = getCommandHelpSpec(command, entry);
  return helpSpec.options.length > 0 ? cloneEntries(helpSpec.options) : undefined;
}

function getStructuredCommandUsage(command, entry) {
  if (command === "init") {
    return [formatCommandUsage("init", "[--preview] [--force] [--dir <path>]")];
  }

  if (command === "mcp") {
    return [formatCommandUsage("mcp", "--stdio | --tools | --capabilities | --version | --help")];
  }

  const helpSpec = getCommandHelpSpec(command, entry);
  return helpSpec.usage.length > 0 ? [...helpSpec.usage] : [formatCommandUsage(entry.command)];
}

function getStructuredCommandNotes(command, entry) {
  const helpSpec = getCommandHelpSpec(command, entry);
  return helpSpec.notes.length > 0 ? [...helpSpec.notes] : undefined;
}

function getStructuredCommandAliases(command) {
  const aliases = getCommandAliases(command);
  return aliases.length > 0 ? [...aliases] : undefined;
}

export function getCommandCatalog() {
  const commands = getBaseCommandCatalogDefinitions({ getInitCommandCatalog, getMcpCommandCatalog });

  return commands.map((entry) => {
    const options = getStructuredCommandOptions(entry.command, entry);
    const usage = getStructuredCommandUsage(entry.command, entry);
    const notes = getStructuredCommandNotes(entry.command, entry);
    const aliases = getStructuredCommandAliases(entry.command);
    return {
      ...entry,
      ...(usage.length > 0 ? { usage } : {}),
      ...(aliases ? { aliases } : {}),
      ...(options ? { options } : {}),
      ...(notes ? { notes } : {})
    };
  });
}

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
