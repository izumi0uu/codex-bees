import { getBaseCommandCatalogDefinitions } from "./state-command-catalog-definitions.js";
import { formatCommandUsage, getCommandHelpSpec } from "./state-command-help-spec.js";
import {
  cloneEntries,
  getCommandAliases
} from "./state-command-options.js";
import {
  getInitCommandCatalog
} from "./state-command-init-options.js";
import {
  getMcpCommandCatalog
} from "./state-mcp-cli.js";
import { getCommandGroup } from "./state-command-surface.js";

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
    const group = getCommandGroup(entry.command);
    const options = getStructuredCommandOptions(entry.command, entry);
    const usage = getStructuredCommandUsage(entry.command, entry);
    const notes = getStructuredCommandNotes(entry.command, entry);
    const aliases = getStructuredCommandAliases(entry.command);
    return {
      ...entry,
      groupId: group.id,
      groupLabel: group.label,
      groupDescription: group.description,
      groupBoundary: group.boundary,
      ...(usage.length > 0 ? { usage } : {}),
      ...(aliases ? { aliases } : {}),
      ...(options ? { options } : {}),
      ...(notes ? { notes } : {})
    };
  });
}
