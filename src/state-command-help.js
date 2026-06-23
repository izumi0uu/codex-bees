import { PRODUCT_NAME } from "./metadata.js";
import { renderMcpHelpText } from "./state-mcp-cli.js";
import {
  DIR_OPTION,
  FORCE_OPTION,
  HELP_OPTION,
  PREVIEW_OPTION,
  TARGET_OPTION,
  formatOptionLines,
  getCommandAliases,
  getCommandCatalog,
  getCommandCatalogEntry,
  getCommandHelpSpec,
  getInitCommandCatalogEntry,
  normalizeCommand,
  pushCommandHelpSection
} from "./state-command-core.js";
import { createResolvedOptionView } from "./state-command-options.js";
import { createResolvedItemView } from "./state-view-helpers.js";

export function getCommandHelpView(command) {
  const matchedEntry = getCommandCatalogEntry(command);
  const text = renderCommandHelpText(command);
  return createResolvedItemView("command_help_view", {
    requestLabel: "command",
    requestValue: command,
    matchedLabel: "matchedCommand",
    matchedValue: matchedEntry?.command,
    valueLabel: "entry",
    value: matchedEntry,
    loadedReason: "command_help_loaded",
    missingReason: "command_help_fallback_loaded",
    extra: { text }
  });
}

export function renderHelpText() {
  const lines = [`${PRODUCT_NAME}`, "", "Usage:"];
  for (const entry of getCommandCatalog()) {
    lines.push(`  ${PRODUCT_NAME} ${entry.command.padEnd(15)} ${entry.description}`);
  }
  return lines.join("\n") + "\n";
}

export function renderInitHelpText() {
  return [
    `${PRODUCT_NAME} init`,
    "",
    "Usage:",
    `  ${PRODUCT_NAME} init [--preview] [--force] [--dir <path>]`,
    "",
    "Options:",
    ...formatOptionLines([
      PREVIEW_OPTION,
      FORCE_OPTION,
      DIR_OPTION,
      TARGET_OPTION,
      HELP_OPTION
    ]).map((line) => `  ${line}`)
  ].join("\n") + "\n";
}

export function getInitHelpView(option) {
  const matchedOption = getInitCommandCatalogEntry(option);
  const text = renderInitHelpText();
  return createResolvedOptionView("init_help_view", option, matchedOption, {
    loadedReason: "init_help_loaded",
    missingReason: "init_help_fallback_loaded",
    text
  });
}

export function renderCommandHelpText(command) {
  const normalizedCommand = normalizeCommand(command);

  if (normalizedCommand === "init") {
    return renderInitHelpText();
  }

  if (normalizedCommand === "mcp") {
    return renderMcpHelpText();
  }

  const matchedEntry = getCommandCatalogEntry(normalizedCommand);
  if (!matchedEntry) {
    return renderHelpText();
  }

  const helpSpec = getCommandHelpSpec(normalizedCommand, matchedEntry);
  const usageLines = helpSpec.usage.length > 0 ? helpSpec.usage : [`${PRODUCT_NAME} ${matchedEntry.command}`];
  const aliases = getCommandAliases(matchedEntry.command);
  const lines = [
    `${PRODUCT_NAME} ${matchedEntry.command}`,
    "",
    "Usage:",
    ...usageLines.map((line) => `  ${line}`)
  ];

  pushCommandHelpSection(lines, "Description", [matchedEntry.description]);
  pushCommandHelpSection(lines, "Aliases", aliases);
  pushCommandHelpSection(
    lines,
    "Options",
    formatOptionLines(helpSpec.options)
  );
  pushCommandHelpSection(lines, "Notes", helpSpec.notes);

  return lines.join("\n") + "\n";
}
