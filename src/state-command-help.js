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
import {
  formatCommonCommandPath,
  getCommonCommandPaths,
  groupCommandCatalog
} from "./state-command-surface.js";
import { createResolvedOptionView } from "./state-command-options.js";
import { createResolvedItemView } from "./state-view-helpers.js";

function appendCommonPaths(lines) {
  const commonPaths = getCommonCommandPaths().map((path) => formatCommonCommandPath(path, PRODUCT_NAME));
  lines.push("Common paths:");

  for (const path of commonPaths) {
    lines.push(`  ${path.label}`);
    lines.push(`    ${path.description}`);
    for (const command of path.commands) {
      lines.push(`    ${command}`);
    }
    lines.push("");
  }

  lines.pop();
}

function appendCommandGroups(lines) {
  const groups = groupCommandCatalog(getCommandCatalog());
  lines.push("Command groups:");

  for (const group of groups) {
    lines.push(`  ${group.label} (${group.count})`);
    lines.push(`    ${group.description}`);
    lines.push(`    Boundary: ${group.boundary}`);
  }
}

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
  const lines = [
    PRODUCT_NAME,
    "",
    "Codex-only local bounded orchestration for explicit multi-agent work.",
    "",
    "Usage:",
    `  ${PRODUCT_NAME} <command> [options]`,
    ""
  ];

  appendCommonPaths(lines);
  lines.push("", "");
  appendCommandGroups(lines);
  lines.push(
    "",
    "More:",
    `  ${PRODUCT_NAME} commands`,
    `  ${PRODUCT_NAME} command:help --name <command>`,
    `  ${PRODUCT_NAME} init --help`,
    `  ${PRODUCT_NAME} mcp --help`
  );

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
  pushCommandHelpSection(lines, "Surface", [
    `${matchedEntry.groupLabel}: ${matchedEntry.groupDescription}`,
    `Boundary: ${matchedEntry.groupBoundary}`
  ]);
  pushCommandHelpSection(lines, "Aliases", aliases);
  pushCommandHelpSection(
    lines,
    "Options",
    formatOptionLines(helpSpec.options)
  );
  pushCommandHelpSection(lines, "Notes", helpSpec.notes);

  return lines.join("\n") + "\n";
}
