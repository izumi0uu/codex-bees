import {
  getCommandCatalogEntryView,
  getCommandCatalogView,
  getInitCommandCatalogEntryView,
  getInitCommandCatalogView
} from "../command/core.js";
import { getCommandHelpView, getInitHelpView } from "../command/help.js";
import { getMcpCommandCatalogEntryView, getMcpCommandCatalogView, getMcpHelpView } from "./cli.js";
import { getMcpToolView, getToolCatalogView } from "./tool-catalog.js";
import { createNamedTextPayload, createSuccess } from "./runtime-response.js";
import { requireArgument } from "./runtime-tool-helpers.js";

export const COMMAND_CATALOG_CORE_MCP_TOOL_HANDLERS = {
  command_catalog({ id, args, metadata }) {
    const params = { arguments: args };
    return createSuccess(id, createNamedTextPayload("commands", getCommandCatalogView()));
  },

  command_catalog_entry({ id, args, metadata }) {
    const params = { arguments: args };
    const commandRequired = requireArgument(id, "command_catalog_entry", params.arguments, "command");
    if (commandRequired) return commandRequired;
    return createSuccess(id, createNamedTextPayload("command", getCommandCatalogEntryView(params.arguments.command)));
  },

  command_help({ id, args, metadata }) {
    const params = { arguments: args };
    const commandRequired = requireArgument(id, "command_help", params.arguments, "command");
    if (commandRequired) return commandRequired;
    return createSuccess(id, createNamedTextPayload("help", getCommandHelpView(params.arguments.command)));
  },

  init_command_catalog({ id, args, metadata }) {
    const params = { arguments: args };
    return createSuccess(id, createNamedTextPayload("options", getInitCommandCatalogView()));
  },

  init_command_option({ id, args, metadata }) {
    const params = { arguments: args };
    const optionRequired = requireArgument(id, "init_command_option", params.arguments, "option");
    if (optionRequired) return optionRequired;
    return createSuccess(id, createNamedTextPayload("option", getInitCommandCatalogEntryView(params.arguments.option)));
  },

  init_help({ id, args, metadata }) {
    const params = { arguments: args };
    const optionRequired = requireArgument(id, "init_help", params.arguments, "option");
    if (optionRequired) return optionRequired;
    return createSuccess(id, createNamedTextPayload("help", getInitHelpView(params.arguments.option)));
  },

  mcp_command_catalog({ id, args, metadata }) {
    const params = { arguments: args };
    return createSuccess(id, createNamedTextPayload("options", getMcpCommandCatalogView()));
  },

  mcp_command_option({ id, args, metadata }) {
    const params = { arguments: args };
    const optionRequired = requireArgument(id, "mcp_command_option", params.arguments, "option");
    if (optionRequired) return optionRequired;
    return createSuccess(id, createNamedTextPayload("option", getMcpCommandCatalogEntryView(params.arguments.option)));
  },

  mcp_help({ id, args, metadata }) {
    const params = { arguments: args };
    const optionRequired = requireArgument(id, "mcp_help", params.arguments, "option");
    if (optionRequired) return optionRequired;
    return createSuccess(id, createNamedTextPayload("help", getMcpHelpView(params.arguments.option)));
  },

  tool_catalog({ id, args, metadata }) {
    const params = { arguments: args };
    return createSuccess(id, createNamedTextPayload("tools", getToolCatalogView()));
  },

  tool_catalog_entry({ id, args, metadata }) {
    const params = { arguments: args };
    const nameRequired = requireArgument(id, "tool_catalog_entry", params.arguments, "name");
    if (nameRequired) return nameRequired;
    return createSuccess(id, createNamedTextPayload("tool", getMcpToolView(params.arguments.name)));
  }
};
