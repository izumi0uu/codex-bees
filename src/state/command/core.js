import {
  getMcpCommandCatalog,
  getMcpCommandCatalogEntry,
  getMcpCommandCatalogEntryView,
  getMcpCommandCatalogView,
  getMcpHelpView,
  renderMcpHelpText
} from "../mcp/cli.js";
import { formatCommandUsage, getCommandHelpSpec } from "./help-spec.js";
import {
  DIR_OPTION,
  FORCE_OPTION,
  formatOptionLines,
  getCommandAliases,
  HELP_OPTION,
  normalizeCommand,
  PREVIEW_OPTION,
  pushCommandHelpSection,
  TARGET_OPTION
} from "./options.js";
import {
  getInitCommandCatalog,
  getInitCommandCatalogEntry,
  getInitCommandCatalogEntryView,
  getInitCommandCatalogView
} from "./init-options.js";

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

export { getCommandCatalog } from "./catalog-assembly.js";
export {
  getCommandCatalogEntry,
  getCommandCatalogEntryView,
  getCommandCatalogView
} from "./catalog-query.js";
export { formatCommandUsage };
