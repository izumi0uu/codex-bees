import { getAgentCatalogEntryView, getAgentCatalogListView, getRuntimeCatalogView, getSkillCatalogEntryView, getSkillCatalogListView } from "./catalog.js";
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
import { createError, createSuccess, createTextPayload } from "./state-mcp-runtime-response.js";

const MCP_ENTRY_URL = new URL("./mcp.js", import.meta.url).href;

const CORE_MCP_TOOL_HANDLERS = {
  coordination_overview({ id, args, metadata }) {
    const params = { arguments: args };
    return createSuccess(id, createTextPayload({ overview: getCoordinationOverviewView() }));
  },

  package_metadata({ id, args, metadata }) {
    const params = { arguments: args };
    return createSuccess(id, createTextPayload({ metadata: getPackageMetadataView() }));
  },

  runtime_doctor({ id, args, metadata }) {
    const params = { arguments: args };
    return createSuccess(id, createTextPayload({ doctor: getRuntimeDoctorView(MCP_ENTRY_URL) }));
  },

  command_catalog({ id, args, metadata }) {
    const params = { arguments: args };
    return createSuccess(id, createTextPayload({ commands: getCommandCatalogView() }));
  },

  command_catalog_entry({ id, args, metadata }) {
    const params = { arguments: args };
    if (!params.arguments?.command) {
      return createError(id, -32602, "command_catalog_entry requires arguments.command");
    }
    return createSuccess(id, createTextPayload({ command: getCommandCatalogEntryView(params.arguments.command) }));
  },

  command_help({ id, args, metadata }) {
    const params = { arguments: args };
    if (!params.arguments?.command) {
      return createError(id, -32602, "command_help requires arguments.command");
    }
    return createSuccess(id, createTextPayload({ help: getCommandHelpView(params.arguments.command) }));
  },

  init_command_catalog({ id, args, metadata }) {
    const params = { arguments: args };
    return createSuccess(id, createTextPayload({ options: getInitCommandCatalogView() }));
  },

  init_command_option({ id, args, metadata }) {
    const params = { arguments: args };
    if (!params.arguments?.option) {
      return createError(id, -32602, "init_command_option requires arguments.option");
    }
    return createSuccess(id, createTextPayload({ option: getInitCommandCatalogEntryView(params.arguments.option) }));
  },

  init_help({ id, args, metadata }) {
    const params = { arguments: args };
    if (!params.arguments?.option) {
      return createError(id, -32602, "init_help requires arguments.option");
    }
    return createSuccess(id, createTextPayload({ help: getInitHelpView(params.arguments.option) }));
  },

  mcp_command_catalog({ id, args, metadata }) {
    const params = { arguments: args };
    return createSuccess(id, createTextPayload({ options: getMcpCommandCatalogView() }));
  },

  mcp_command_option({ id, args, metadata }) {
    const params = { arguments: args };
    if (!params.arguments?.option) {
      return createError(id, -32602, "mcp_command_option requires arguments.option");
    }
    return createSuccess(id, createTextPayload({ option: getMcpCommandCatalogEntryView(params.arguments.option) }));
  },

  mcp_help({ id, args, metadata }) {
    const params = { arguments: args };
    if (!params.arguments?.option) {
      return createError(id, -32602, "mcp_help requires arguments.option");
    }
    return createSuccess(id, createTextPayload({ help: getMcpHelpView(params.arguments.option) }));
  },

  tool_catalog({ id, args, metadata }) {
    const params = { arguments: args };
    return createSuccess(id, createTextPayload({ tools: getToolCatalogView() }));
  },

  tool_catalog_entry({ id, args, metadata }) {
    const params = { arguments: args };
    if (!params.arguments?.name) {
      return createError(id, -32602, "tool_catalog_entry requires arguments.name");
    }
    return createSuccess(id, createTextPayload({ tool: getMcpToolView(params.arguments.name) }));
  },

  worker_guidelines({ id, args, metadata }) {
    const params = { arguments: args };
    return createSuccess(id, createTextPayload({ guidelines: getWorkerGuidelinesView() }));
  },

  runtime_contract({ id, args, metadata }) {
    const params = { arguments: args };
    return createSuccess(id, createTextPayload({ contract: getRuntimeContractView() }));
  },

  runtime_catalog({ id, args, metadata }) {
    const params = { arguments: args };
    return createSuccess(id, createTextPayload({ catalog: getRuntimeCatalogView() }));
  },

  runtime_ready({ id, args, metadata }) {
    const params = { arguments: args };
    return createSuccess(id, createTextPayload({ ready: getRuntimeReadyView() }));
  },

  runtime_catalog_agents({ id, args, metadata }) {
    const params = { arguments: args };
    return createSuccess(id, createTextPayload({ agents: getAgentCatalogListView() }));
  },

  runtime_catalog_skills({ id, args, metadata }) {
    const params = { arguments: args };
    return createSuccess(id, createTextPayload({ skills: getSkillCatalogListView() }));
  },

  runtime_catalog_agent({ id, args, metadata }) {
    const params = { arguments: args };
    if (!params.arguments?.id) {
      return createError(id, -32602, "runtime_catalog_agent requires arguments.id");
    }
    return createSuccess(id, createTextPayload({ agent: getAgentCatalogEntryView(params.arguments.id) }));
  },

  runtime_catalog_skill({ id, args, metadata }) {
    const params = { arguments: args };
    if (!params.arguments?.id) {
      return createError(id, -32602, "runtime_catalog_skill requires arguments.id");
    }
    return createSuccess(id, createTextPayload({ skill: getSkillCatalogEntryView(params.arguments.id) }));
  },

  runtime_status({ id, args, metadata }) {
    const params = { arguments: args };
    return createSuccess(
      id,
      createTextPayload({ status: getRuntimeStatusView({ version: metadata.version, toolCount: toolCatalog.length }) })
    );
  },

  runtime_capabilities({ id, args, metadata }) {
    const params = { arguments: args };
    return createSuccess(id, createTextPayload({ capabilities: getCapabilityCatalogView() }));
  },

  runtime_capability({ id, args, metadata }) {
    const params = { arguments: args };
    if (!params.arguments?.id) {
      return createError(id, -32602, "runtime_capability requires arguments.id");
    }
    return createSuccess(id, createTextPayload({ capability: getCapabilityCatalogEntryView(params.arguments.id) }));
  }
};

function handleCoreMcpTool(id, name, args = {}, metadata) {
  const handler = CORE_MCP_TOOL_HANDLERS[name];
  return handler ? handler({ id, args, metadata }) : null;
}

export { CORE_MCP_TOOL_HANDLERS, handleCoreMcpTool };
