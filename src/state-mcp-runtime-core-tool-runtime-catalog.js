import {
  getAgentCatalogDocumentView,
  getAgentCatalogEntryView,
  getAgentCatalogListView,
  getRuntimeCatalogView,
  getSkillCatalogDocumentView,
  getSkillCatalogEntryView,
  getSkillCatalogListView
} from "./catalog.js";
import { getCapabilityCatalogEntryView, getCapabilityCatalogView, getRuntimeStatusView } from "./runtime-status.js";
import { toolCatalog } from "./state-mcp-tool-catalog.js";
import { createNamedTextPayload, createSuccess } from "./state-mcp-runtime-response.js";
import { requireArgument } from "./state-mcp-runtime-tool-helpers.js";

export const RUNTIME_CATALOG_CORE_MCP_TOOL_HANDLERS = {
  runtime_catalog({ id, args, metadata }) {
    const params = { arguments: args };
    return createSuccess(id, createNamedTextPayload("catalog", getRuntimeCatalogView()));
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
