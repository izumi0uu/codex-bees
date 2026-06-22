import { stdout } from "node:process";
import { PACKAGE_VERSION, PRODUCT_NAME } from "./metadata.js";
import { getCapabilityCatalogView } from "./runtime-status.js";
import { getToolCatalogView } from "./state-mcp-tool-catalog.js";

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

export function getMcpCommandCatalog() {
  return [
    { option: "--stdio", description: "Start the local MCP stdio runtime" },
    { option: "--tools", description: "Print the current MCP tool catalog" },
    { option: "--capabilities", description: "Print the shipped runtime capability inventory" },
    { option: "--version", description: "Show MCP subcommand version" },
    { option: "--help", description: "Show MCP subcommand help" }
  ];
}

export function getMcpCommandCatalogEntry(option) {
  if (!option) {
    return undefined;
  }

  return getMcpCommandCatalog().find((entry) => entry.option === option);
}

export function getMcpCommandCatalogEntryView(option) {
  const matchedEntry = getMcpCommandCatalogEntry(option);

  return {
    kind: "mcp_command_option_view",
    recommendedReason: matchedEntry ? "mcp_command_option_loaded" : "mcp_command_option_missing",
    option: option ?? null,
    matchedOption: matchedEntry?.option ?? null,
    entry: matchedEntry ?? null
  };
}

export function getMcpCommandCatalogView() {
  const options = getMcpCommandCatalog();
  return {
    kind: "mcp_command_catalog_view",
    recommendedReason: options.length > 0 ? "mcp_command_catalog_loaded" : "mcp_command_catalog_empty",
    counts: {
      totalOptions: options.length
    },
    options
  };
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

  return {
    kind: "mcp_help_view",
    recommendedReason: matchedOption ? "mcp_help_loaded" : "mcp_help_fallback_loaded",
    option: option ?? null,
    matchedOption: matchedOption?.option ?? null,
    text,
    entry: matchedOption ?? null
  };
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
    stdout.write(JSON.stringify({ tools: getToolCatalogView() }, null, 2) + "\n");
    return;
  }

  if (args.includes("--capabilities")) {
    stdout.write(JSON.stringify({ capabilities: getCapabilityCatalogView() }, null, 2) + "\n");
    return;
  }

  if (args.length === 0 || args.includes("--stdio")) {
    const { startMcpServer } = await import("./state-mcp-runtime.js");
    return startMcpServer();
  }

  throw createMcpCliUsageError(`Unknown mcp option: ${args.join(" ")}`);
}
