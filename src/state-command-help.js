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

export function getCommandHelpView(command) {
  const matchedEntry = getCommandCatalogEntry(command);
  const text = renderCommandHelpText(command);

  return {
    kind: "command_help_view",
    recommendedReason: matchedEntry ? "command_help_loaded" : "command_help_fallback_loaded",
    command: command ?? null,
    matchedCommand: matchedEntry?.command ?? null,
    text,
    entry: matchedEntry ?? null
  };
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

  return {
    kind: "init_help_view",
    recommendedReason: matchedOption ? "init_help_loaded" : "init_help_fallback_loaded",
    option: option ?? null,
    matchedOption: matchedOption?.option ?? null,
    text,
    entry: matchedOption ?? null
  };
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
