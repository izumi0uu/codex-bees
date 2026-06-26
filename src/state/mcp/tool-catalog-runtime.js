import {
  RUNTIME_CORE_MCP_TOOL_CATALOG
} from "./tool-catalog-runtime-core.js";
import {
  RUNTIME_OVERVIEW_MCP_TOOL_CATALOG
} from "./tool-catalog-runtime-overview.js";
import {
  RUNTIME_PACK_MCP_TOOL_CATALOG
} from "./tool-catalog-runtime-pack.js";

const RUNTIME_MCP_TOOL_CATALOG_ORDER = [
  "runtime_doctor",
  "runtime_contract",
  "runtime_catalog",
  "runtime_catalog_agents",
  "runtime_catalog_skills",
  "runtime_catalog_agent",
  "runtime_catalog_agent_document",
  "runtime_catalog_skill",
  "runtime_catalog_skill_document",
  "runtime_ready",
  "runtime_status",
  "runtime_capabilities",
  "runtime_capability",
  "runtime_activity",
  "runtime_assignment_pack",
  "runtime_closeout",
  "runtime_closeout_pack",
  "runtime_control_pack",
  "runtime_signal_pack",
  "runtime_handoff_pack",
  "runtime_triage_pack",
  "runtime_handoffs",
  "runtime_recovery_pack",
  "runtime_recovery",
  "runtime_review_pack",
  "runtime_session_pack",
  "runtime_queue_pack",
  "runtime_workspace_pack",
  "runtime_leader_pack",
  "runtime_operator_pack",
  "runtime_owner_pack",
  "runtime_pickup_pack",
  "runtime_role_pack",
  "runtime_summary_pack",
  "runtime_verifier_pack",
  "runtime_worker_pack",
  "runtime_dashboard",
  "runtime_dispatch",
  "runtime_dispatch_pack",
  "runtime_execution_pack",
  "runtime_focus",
  "runtime_review",
  "runtime_alerts",
  "runtime_roles"
];

const runtimeCatalogEntryByName = new Map(
  [
    ...RUNTIME_CORE_MCP_TOOL_CATALOG,
    ...RUNTIME_OVERVIEW_MCP_TOOL_CATALOG,
    ...RUNTIME_PACK_MCP_TOOL_CATALOG
  ].map((entry) => [entry.name, entry])
);

export const RUNTIME_MCP_TOOL_CATALOG = RUNTIME_MCP_TOOL_CATALOG_ORDER.map((name) => {
  const entry = runtimeCatalogEntryByName.get(name);
  if (!entry) {
    throw new Error(`Missing runtime MCP tool catalog entry for ${name}`);
  }
  return entry;
});
