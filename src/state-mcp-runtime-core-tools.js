import {
  getAgentCatalogDocumentView,
  getAgentCatalogEntryView,
  getAgentCatalogListView,
  getRuntimeCatalogView,
  getSkillCatalogDocumentView,
  getSkillCatalogEntryView,
  getSkillCatalogListView
} from "./catalog.js";
import { getRuntimeDoctorView } from "./doctor.js";
import { getPackageMetadataView } from "./metadata.js";
import { getRuntimeContractView } from "./runtime-contract.js";
import { getCoordinationOverviewView, getWorkerGuidelinesView } from "./runtime-guidance.js";
import { getRuntimeReadyView } from "./runtime-ready.js";
import { getCapabilityCatalogEntryView, getCapabilityCatalogView, getRuntimeStatusView } from "./runtime-status.js";
import { getCommandCatalogEntryView, getCommandCatalogView, getInitCommandCatalogEntryView, getInitCommandCatalogView } from "./state-command-core.js";
import { getCommandHelpView, getInitHelpView } from "./state-command-help.js";
import { getMcpCommandCatalogEntryView, getMcpCommandCatalogView, getMcpHelpView } from "./state-mcp-cli.js";
import { getMcpToolView, getToolCatalogView, toolCatalog } from "./state-mcp-tool-catalog.js";
import { createNamedTextPayload, createSuccess } from "./state-mcp-runtime-response.js";
import { requireArgument } from "./state-mcp-runtime-tool-helpers.js";

const MCP_ENTRY_URL = new URL("./mcp.js", import.meta.url).href;

const CORE_MCP_TOOL_HANDLERS = {
  coordination_overview({ id, args, metadata }) {
    const params = { arguments: args };
    return createSuccess(id, createNamedTextPayload("overview", getCoordinationOverviewView()));
  },

  package_metadata({ id, args, metadata }) {
    const params = { arguments: args };
    return createSuccess(id, createNamedTextPayload("metadata", getPackageMetadataView()));
  },

  runtime_doctor({ id, args, metadata }) {
    const params = { arguments: args };
    return createSuccess(id, createNamedTextPayload("doctor", getRuntimeDoctorView(MCP_ENTRY_URL)));
  },

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
  },

  worker_guidelines({ id, args, metadata }) {
    const params = { arguments: args };
    return createSuccess(id, createNamedTextPayload("guidelines", getWorkerGuidelinesView()));
  },

  runtime_contract({ id, args, metadata }) {
    const params = { arguments: args };
    return createSuccess(id, createNamedTextPayload("contract", getRuntimeContractView()));
  },

  runtime_catalog({ id, args, metadata }) {
    const params = { arguments: args };
    return createSuccess(id, createNamedTextPayload("catalog", getRuntimeCatalogView()));
  },

  runtime_ready({ id, args, metadata }) {
    const params = { arguments: args };
    return createSuccess(id, createNamedTextPayload("ready", getRuntimeReadyView()));
  },

  runtime_catalog_agents({ id, args, metadata }) {
    const params = { arguments: args };
    return createSuccess(id, createNamedTextPayload("agents", getAgentCatalogListView()));
  },

  runtime_catalog_skills({ id, args, metadata }) {
    const params = { arguments: args };
    return createSuccess(id, createNamedTextPayload("skills", getSkillCatalogListView()));
  },

  runtime_catalog_agent({ id, args, metadata }) {
    const params = { arguments: args };
    const agentIdRequired = requireArgument(id, "runtime_catalog_agent", params.arguments, "id");
    if (agentIdRequired) return agentIdRequired;
    return createSuccess(id, createNamedTextPayload("agent", getAgentCatalogEntryView(params.arguments.id)));
  },

  runtime_catalog_agent_document({ id, args, metadata }) {
    const params = { arguments: args };
    const agentIdRequired = requireArgument(id, "runtime_catalog_agent_document", params.arguments, "id");
    if (agentIdRequired) return agentIdRequired;
    return createSuccess(id, createNamedTextPayload("agent", getAgentCatalogDocumentView(params.arguments.id)));
  },

  runtime_catalog_skill({ id, args, metadata }) {
    const params = { arguments: args };
    const skillIdRequired = requireArgument(id, "runtime_catalog_skill", params.arguments, "id");
    if (skillIdRequired) return skillIdRequired;
    return createSuccess(id, createNamedTextPayload("skill", getSkillCatalogEntryView(params.arguments.id)));
  },

  runtime_catalog_skill_document({ id, args, metadata }) {
    const params = { arguments: args };
    const skillIdRequired = requireArgument(id, "runtime_catalog_skill_document", params.arguments, "id");
    if (skillIdRequired) return skillIdRequired;
    return createSuccess(id, createNamedTextPayload("skill", getSkillCatalogDocumentView(params.arguments.id)));
  },

  runtime_status({ id, args, metadata }) {
    const params = { arguments: args };
    return createSuccess(
      id,
      createNamedTextPayload("status", getRuntimeStatusView({ version: metadata.version, toolCount: toolCatalog.length }))
    );
  },

  runtime_capabilities({ id, args, metadata }) {
    const params = { arguments: args };
    return createSuccess(id, createNamedTextPayload("capabilities", getCapabilityCatalogView()));
  },

  runtime_capability({ id, args, metadata }) {
    const params = { arguments: args };
    const capabilityIdRequired = requireArgument(id, "runtime_capability", params.arguments, "id");
    if (capabilityIdRequired) return capabilityIdRequired;
    return createSuccess(id, createNamedTextPayload("capability", getCapabilityCatalogEntryView(params.arguments.id)));
  }
};

function handleCoreMcpTool(id, name, args = {}, metadata) {
  const handler = CORE_MCP_TOOL_HANDLERS[name];
  return handler ? handler({ id, args, metadata }) : null;
}

export { CORE_MCP_TOOL_HANDLERS, handleCoreMcpTool };
