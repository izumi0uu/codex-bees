import { argv, stderr, exit } from "node:process";
import { fileURLToPath } from "node:url";
import { isMcpCliUsageError, runMcpCli } from "./state-mcp-cli.js";

export {
  getMcpCommandCatalog,
  getMcpCommandCatalogEntry,
  getMcpCommandCatalogEntryView,
  getMcpCommandCatalogView,
  getMcpHelpView,
  isMcpCliUsageError,
  renderMcpHelpText,
  runMcpCli
} from "./state-mcp-cli.js";

export {
  callMcpTool,
  handleMcpRequest,
  serializeMcpMessage,
  startMcpServer
} from "./state-mcp-runtime.js";

export {
  getMcpToolEntry,
  getMcpToolView,
  getToolCatalogView,
  listMcpTools,
  toolCatalog
} from "./state-mcp-tool-catalog.js";

if (argv[1] && fileURLToPath(import.meta.url) === argv[1]) {
  try {
    await runMcpCli(argv.slice(2));
  } catch (error) {
    stderr.write(`${isMcpCliUsageError(error) ? error.message : error.stack || error.message}\n`);
    exit(1);
  }
}
