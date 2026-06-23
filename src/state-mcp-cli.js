import { stdout } from "node:process";
import { PACKAGE_VERSION, PRODUCT_NAME } from "./metadata.js";
import { getCapabilityCatalogView } from "./runtime-status.js";
import {
  cloneEntries,
  createOptionCatalogView,
  createResolvedOptionView,
  findOptionEntry
} from "./state-command-option-helpers.js";
import { getToolCatalogView } from "./state-mcp-tool-catalog.js";
import { writeNamedView } from "./state-cli-view-writers.js";

const MCP_CLI_USAGE_ERROR_CODE = "CODEX_BEES_MCP_USAGE";

function createMcpCliUsageError(message) {
  const error = new Error(message);
  error.code = MCP_CLI_USAGE_ERROR_CODE;
  return error;
}

export function isMcpCliUsageError(error) {
  return error?.code === MCP_CLI_USAGE_ERROR_CODE;
}

function writeMcpHelp() {
  stdout.write(renderMcpHelpText());
}

const MCP_COMMAND_OPTIONS = [
  { option: "--stdio", description: "Start the local MCP stdio runtime" },
  { option: "--tools", description: "Print the current MCP tool catalog" },
  { option: "--capabilities", description: "Print the shipped runtime capability inventory" },
  { option: "--version", description: "Show MCP subcommand version" },
  { option: "--help", description: "Show MCP subcommand help" }
];

export function getMcpCommandCatalog() {
  return cloneEntries(MCP_COMMAND_OPTIONS);
}

export function getMcpCommandCatalogEntry(option) {
  return findOptionEntry(getMcpCommandCatalog(), option);
}

export function getMcpCommandCatalogEntryView(option) {
  const matchedEntry = getMcpCommandCatalogEntry(option);
  return createResolvedOptionView("mcp_command_option_view", option, matchedEntry, {
    loadedReason: "mcp_command_option_loaded",
    missingReason: "mcp_command_option_missing"
  });
}

export function getMcpCommandCatalogView() {
  const options = getMcpCommandCatalog();
  return createOptionCatalogView("mcp_command_catalog_view", options, {
    loadedReason: "mcp_command_catalog_loaded",
    emptyReason: "mcp_command_catalog_empty"
  });
}

export function renderMcpHelpText() {
  const lines = [`${PRODUCT_NAME} mcp`, "", "Usage:"];
  for (const entry of getMcpCommandCatalog()) {
    lines.push(`  ${PRODUCT_NAME} mcp ${entry.option.padEnd(15)} ${entry.description}`);
  }
  return lines.join("\n") + "\n";
}

export function getMcpHelpView(option) {
  const matchedOption = getMcpCommandCatalogEntry(option);
  const text = renderMcpHelpText();
  return createResolvedOptionView("mcp_help_view", option, matchedOption, {
    loadedReason: "mcp_help_loaded",
    missingReason: "mcp_help_fallback_loaded",
    text
  });
}

export async function runMcpCli(args = []) {
  if (args.includes("--help") || args.includes("help")) {
    writeMcpHelp();
    return;
  }

  if (args.includes("--version") || args.includes("version")) {
    stdout.write(`${PACKAGE_VERSION}\n`);
    return;
  }

  if (args.includes("--tools")) {
    writeNamedView("tools", getToolCatalogView());
    return;
  }

  if (args.includes("--capabilities")) {
    writeNamedView("capabilities", getCapabilityCatalogView());
    return;
  }

  if (args.length === 0 || args.includes("--stdio")) {
    const { startMcpServer } = await import("./state-mcp-runtime.js");
    return startMcpServer();
  }

  throw createMcpCliUsageError(`Unknown mcp option: ${args.join(" ")}`);
}
