import { getRuntimeCatalog } from "./catalog.js";
import { listMemories, listSwarms, listTasks } from "./state.js";

const CAPABILITY_CATALOG = [
  {
    id: "cli_runtime",
    category: "runtime",
    description: "Local CLI surface for planning, coordination, diagnostics, and memory.",
    cliCommands: ["run", "tools", "catalog", "doctor", "status", "capabilities"],
    mcpTools: []
  },
  {
    id: "mcp_runtime",
    category: "runtime",
    description: "Local MCP stdio server exposing coordination and runtime inspection tools.",
    cliCommands: ["mcp"],
    mcpTools: ["runtime_contract", "runtime_catalog", "runtime_status", "runtime_capabilities"]
  },
  {
    id: "planning",
    category: "planning",
    description: "Bounded plan and planner-to-swarm generation for Codex-only work.",
    cliCommands: ["plan", "plan:queue", "plan:swarm", "plan:swarm:queue"],
    mcpTools: ["plan", "queue_plan", "plan_swarm", "queue_plan_swarm"]
  },
  {
    id: "task_coordination",
    category: "coordination",
    description: "Persistent task queue with claim, block, release, and readiness validation.",
    cliCommands: ["task:list", "task:add", "task:update", "task:check", "task:claim", "task:block", "task:release"],
    mcpTools: ["task_list", "task_add", "task_update", "task_check", "task_claim", "task_block", "task_release"]
  },
  {
    id: "verifier_review",
    category: "coordination",
    description: "Verifier-owned review loop with approve/reject transitions and review evidence.",
    cliCommands: ["task:review", "task:approve", "task:reject", "task:done"],
    mcpTools: ["task_ready_for_review", "task_approve", "task_reject", "task_done"]
  },
  {
    id: "leader_orchestration",
    category: "coordination",
    description: "Leader-facing orchestration views across swarms, lane bundles, and next actions.",
    cliCommands: ["leader:assignments", "leader:queue", "leader:workspace", "swarm:brief", "swarm:bundle", "swarm:blockers", "swarm:closeout", "swarm:dispatch-bundle", "swarm:overview"],
    mcpTools: ["leader_assignments", "leader_queue", "leader_workspace", "swarm_brief", "swarm_bundle", "swarm_blockers", "swarm_closeout", "swarm_dispatch_bundle", "swarm_overview"]
  },
  {
    id: "swarm_coordination",
    category: "coordination",
    description: "Bounded swarm contracts, queueing, dispatch, sync, and detailed overviews.",
    cliCommands: [
      "swarm:init",
      "swarm:list",
      "swarm:get",
      "swarm:update",
      "swarm:check",
      "swarm:start",
      "swarm:block",
      "swarm:done",
      "swarm:cancel",
      "swarm:queue",
      "swarm:dispatch",
      "swarm:overview",
      "swarm:sync"
    ],
    mcpTools: [
      "swarm_init",
      "swarm_list",
      "swarm_get",
      "swarm_update",
      "swarm_check",
      "swarm_start",
      "swarm_block",
      "swarm_done",
      "swarm_cancel",
      "swarm_queue_tasks",
      "swarm_dispatch",
      "swarm_overview",
      "swarm_sync"
    ]
  },
  {
    id: "memory",
    category: "memory",
    description: "Persistent local memory storage, search, and namespace-aware recall.",
    cliCommands: ["memory:store", "memory:list", "memory:search"],
    mcpTools: ["memory_store", "memory_list", "memory_search"]
  },
  {
    id: "runtime_catalog",
    category: "introspection",
    description: "Repo-native discovery of shipped agents and skills with role-aware validation.",
    cliCommands: ["catalog", "status", "capabilities", "doctor", "runtime:activity", "runtime:closeout", "runtime:closeout-pack", "runtime:control-pack", "runtime:dashboard", "runtime:dispatch", "runtime:dispatch-pack", "runtime:focus", "runtime:handoff-pack", "runtime:handoffs", "runtime:leader-pack", "runtime:operator-pack", "runtime:owner-pack", "runtime:queue-pack", "runtime:recovery", "runtime:recovery-pack", "runtime:review", "runtime:review-pack", "runtime:role-pack", "runtime:session-pack", "runtime:signal-pack", "runtime:summary-pack", "runtime:triage-pack", "runtime:verifier-pack", "runtime:workspace-pack", "runtime:worker-pack", "runtime:alerts", "runtime:roles"],
    mcpTools: ["runtime_catalog", "runtime_status", "runtime_capabilities", "runtime_activity", "runtime_closeout", "runtime_closeout_pack", "runtime_control_pack", "runtime_dashboard", "runtime_dispatch", "runtime_dispatch_pack", "runtime_focus", "runtime_handoff_pack", "runtime_handoffs", "runtime_leader_pack", "runtime_operator_pack", "runtime_owner_pack", "runtime_queue_pack", "runtime_recovery", "runtime_recovery_pack", "runtime_review", "runtime_review_pack", "runtime_role_pack", "runtime_session_pack", "runtime_signal_pack", "runtime_summary_pack", "runtime_triage_pack", "runtime_verifier_pack", "runtime_workspace_pack", "runtime_worker_pack", "runtime_alerts", "runtime_roles"]
  }
];

function countBy(items, selector) {
  return items.reduce((counts, item) => {
    const key = selector(item) ?? "unknown";
    counts[key] = (counts[key] ?? 0) + 1;
    return counts;
  }, {});
}

export function getCapabilityCatalog() {
  return CAPABILITY_CATALOG.map((item) => ({
    ...item,
    cliCommands: [...item.cliCommands],
    mcpTools: [...item.mcpTools]
  }));
}

export function getRuntimeStatus({ version, toolCount }) {
  const catalog = getRuntimeCatalog();
  const tasks = listTasks();
  const swarms = listSwarms();
  const memories = listMemories();
  const capabilities = getCapabilityCatalog();

  return {
    product: "codex-bees",
    version,
    mode: "codex-only",
    counts: {
      tools: toolCount,
      agents: catalog.agents.length,
      skills: catalog.skills.length,
      capabilities: capabilities.length,
      tasks: tasks.length,
      swarms: swarms.length,
      memories: memories.length
    },
    state: {
      taskQueueStatuses: countBy(tasks, (task) => task.queueStatus),
      swarmStatuses: countBy(swarms, (swarm) => swarm.status),
      memoryNamespaces: countBy(memories, (memory) => memory.namespace)
    },
    catalog,
    capabilities: capabilities.map((capability) => ({
      id: capability.id,
      category: capability.category,
      cliCommandCount: capability.cliCommands.length,
      mcpToolCount: capability.mcpTools.length
    }))
  };
}
