import {
  TASK_LIFECYCLE_MCP_TOOL_CATALOG
} from "./tool-catalog-task-lifecycle.js";
import {
  TASK_QUERY_MCP_TOOL_CATALOG
} from "./tool-catalog-task-query.js";
import {
  TASK_WORKER_LEADER_MCP_TOOL_CATALOG
} from "./tool-catalog-task-worker-leader.js";

const TASK_MCP_TOOL_CATALOG_ORDER = [
  "worker_guidelines",
  "task_list",
  "task_add",
  "task_update",
  "task_get",
  "task_archive_list",
  "task_archive_get",
  "task_history",
  "task_annotate",
  "task_report",
  "task_brief",
  "task_inbox",
  "task_next",
  "task_assignment_preview",
  "task_assignment_pickup",
  "task_pickup",
  "task_pickup_preview",
  "worker_session",
  "worker_handoff",
  "worker_closeout",
  "verifier_bundle",
  "leader_workspace",
  "leader_queue",
  "leader_assignments",
  "leader_assignment_dispatch",
  "leader_assignment_dispatch_bundle",
  "leader_assignment_launch_plan",
  "leader_assignment_dispatch_pack",
  "task_check",
  "task_archive",
  "task_restore",
  "task_reopen",
  "task_claim",
  "task_block",
  "task_ready_for_review",
  "task_done",
  "task_approve",
  "task_reject",
  "task_release"
];

const taskCatalogEntryByName = new Map(
  [
    ...TASK_QUERY_MCP_TOOL_CATALOG,
    ...TASK_LIFECYCLE_MCP_TOOL_CATALOG,
    ...TASK_WORKER_LEADER_MCP_TOOL_CATALOG
  ].map((entry) => [entry.name, entry])
);

export const TASK_MCP_TOOL_CATALOG = TASK_MCP_TOOL_CATALOG_ORDER.map((name) => {
  const entry = taskCatalogEntryByName.get(name);
  if (!entry) {
    throw new Error(`Missing task MCP tool catalog entry for ${name}`);
  }
  return entry;
});
