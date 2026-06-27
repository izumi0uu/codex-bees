const CAPABILITY_CATALOG = [
  {
    id: "cli_runtime",
    category: "runtime",
    description: "Local CLI surface for planning, coordination, diagnostics, and memory.",
    cliCommands: ["run", "init", "tools", "catalog", "doctor", "status", "capabilities"],
    mcpTools: []
  },
  {
    id: "mcp_runtime",
    category: "runtime",
    description: "Local MCP stdio server exposing coordination and runtime inspection tools.",
    cliCommands: ["mcp"],
    mcpTools: ["package_metadata", "runtime_doctor", "command_catalog", "command_catalog_entry", "command_help", "init_command_catalog", "init_command_option", "init_help", "mcp_command_catalog", "mcp_command_option", "mcp_help", "tool_catalog", "tool_catalog_entry", "runtime_ready", "runtime_contract", "runtime_catalog", "runtime_status", "runtime_capabilities", "runtime_capability"]
  },
  {
    id: "planning",
    category: "planning",
    description: "Bounded plan and dependency-wave planner-to-swarm generation for Codex-only work.",
    cliCommands: ["plan:profiles", "plan:profile", "plan:profile-ranking", "plan", "plan:queue", "plan:swarm", "plan:swarm:queue"],
    mcpTools: ["planner_profiles", "planner_profile", "planner_profile_ranking", "plan_task", "queue_plan", "plan_swarm", "queue_plan_swarm"]
  },
  {
    id: "task_coordination",
    category: "coordination",
    description: "Persistent task queue with claim, block, release, readiness validation, archive history, and standalone restore/reopen recovery.",
    cliCommands: ["task:list", "task:add", "task:update", "task:check", "task:claim", "task:block", "task:release", "task:archive", "task:restore", "task:reopen", "task:archive:list", "task:archive:get", "task:assignment-preview", "task:assignment-pickup"],
    mcpTools: ["task_list", "task_add", "task_update", "task_check", "task_claim", "task_block", "task_release", "task_archive", "task_restore", "task_reopen", "task_archive_list", "task_archive_get", "task_assignment_preview", "task_assignment_pickup"]
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
    highlights: [
      "assignment-launch-plan provides ordered worker startup steps",
      "assignment-dispatch-bundle provides multi-worker launch handoff"
    ],
    preferredEntryPoints: {
      cli: ["leader:assignment-launch-plan", "leader:assignment-dispatch-bundle", "leader:workspace"],
      mcp: ["leader_assignment_launch_plan", "leader_assignment_dispatch_bundle", "leader_workspace"]
    },
    useCases: [
      "bring multiple workers online in leader-defined order",
      "handoff parallel launch commands to concrete worker ids",
      "open a leader-ready orchestration workspace after startup"
    ],
    cliCommands: ["leader:assignment-dispatch", "leader:assignment-dispatch-bundle", "leader:assignment-launch-plan", "leader:assignment-dispatch-pack", "leader:assignments", "leader:assignment-ranking", "leader:queue", "leader:workspace", "swarm:brief", "swarm:bundle", "swarm:blockers", "swarm:closeout", "swarm:dispatch-bundle", "swarm:overview"],
    mcpTools: ["leader_assignment_dispatch", "leader_assignment_dispatch_bundle", "leader_assignment_launch_plan", "leader_assignment_dispatch_pack", "leader_assignments", "leader_assignment_ranking", "leader_queue", "leader_workspace", "swarm_brief", "swarm_bundle", "swarm_blockers", "swarm_closeout", "swarm_dispatch_bundle", "swarm_overview"]
  },
  {
    id: "swarm_coordination",
    category: "coordination",
    description: "Bounded swarm contracts, queueing, dispatch, sync, archive closeout, restore/reopen recovery, and detailed overviews.",
    cliCommands: [
      "swarm:init",
      "swarm:list",
      "swarm:get",
      "swarm:archive:list",
      "swarm:archive:get",
      "swarm:update",
      "swarm:check",
      "swarm:start",
      "swarm:block",
      "swarm:done",
      "swarm:cancel",
      "swarm:archive",
      "swarm:restore",
      "swarm:reopen",
      "swarm:queue",
      "swarm:dispatch",
      "swarm:overview",
      "swarm:sync"
    ],
    mcpTools: [
      "swarm_init",
      "swarm_list",
      "swarm_get",
      "swarm_archive_list",
      "swarm_archive_get",
      "swarm_update",
      "swarm_check",
      "swarm_start",
      "swarm_block",
      "swarm_done",
      "swarm_cancel",
      "swarm_archive",
      "swarm_restore",
      "swarm_reopen",
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
    cliCommands: ["memory:store", "memory:get", "memory:list", "memory:search"],
    mcpTools: ["memory_store", "memory_get", "memory_list", "memory_search"]
  },
  {
    id: "runtime_catalog",
    category: "introspection",
    description: "Repo-native discovery of shipped agents and skills with role-aware validation.",
    highlights: [
      "runtime:queue-pack recommends launch context before raw leader queue review",
      "runtime:summary-pack and runtime:control-pack stay compact by default and expand with --detail full"
    ],
    preferredEntryPoints: {
      cli: ["status", "capabilities", "runtime:summary-pack", "runtime:queue-pack"],
      mcp: ["runtime_status", "runtime_capabilities", "runtime_summary_pack", "runtime_queue_pack"]
    },
    useCases: [
      "probe the runtime surface before choosing deeper orchestration tools",
      "read shipped skill and agent contracts without opening repository files directly",
      "inspect launch-first queue guidance for automation routing",
      "read compact launch context without opening larger leader packs until full nested surfaces are needed"
    ],
    cliCommands: ["catalog", "catalog:agent-doc", "catalog:skill-doc", "status", "capabilities", "doctor", "runtime:activity", "runtime:assignment-pack", "runtime:closeout", "runtime:closeout-pack", "runtime:control-pack", "runtime:dashboard", "runtime:dispatch", "runtime:dispatch-ranking", "runtime:dispatch-pack", "runtime:execution-pack", "runtime:focus", "runtime:focus-candidates", "runtime:handoff-pack", "runtime:handoffs", "runtime:leader-pack", "runtime:operator-pack", "runtime:owner-pack", "runtime:pickup-pack", "runtime:queue-pack", "runtime:recovery", "runtime:recovery-pack", "runtime:review", "runtime:review-pack", "runtime:role-pack", "runtime:session-pack", "runtime:signal-pack", "runtime:summary-pack", "runtime:triage-pack", "runtime:verifier-pack", "runtime:workspace-pack", "runtime:worker-pack", "runtime:alerts", "runtime:roles", "task:assignment-preview", "task:assignment-pickup", "task:pickup-preview"],
    mcpTools: ["runtime_catalog", "runtime_catalog_agent_document", "runtime_catalog_skill_document", "runtime_status", "runtime_capabilities", "runtime_capability", "runtime_activity", "runtime_assignment_pack", "runtime_closeout", "runtime_closeout_pack", "runtime_control_pack", "runtime_dashboard", "runtime_dispatch", "runtime_dispatch_ranking", "runtime_dispatch_pack", "runtime_execution_pack", "runtime_focus", "runtime_focus_candidates", "runtime_handoff_pack", "runtime_handoffs", "runtime_leader_pack", "runtime_operator_pack", "runtime_owner_pack", "runtime_pickup_pack", "runtime_queue_pack", "runtime_recovery", "runtime_recovery_pack", "runtime_review", "runtime_review_pack", "runtime_role_pack", "runtime_session_pack", "runtime_signal_pack", "runtime_summary_pack", "runtime_triage_pack", "runtime_verifier_pack", "runtime_workspace_pack", "runtime_worker_pack", "runtime_alerts", "runtime_roles", "task_assignment_preview", "task_assignment_pickup", "task_pickup_preview"]
  }
];

export function getCapabilityCatalog() {
  return CAPABILITY_CATALOG.map((item) => ({
    ...item,
    highlights: item.highlights ? [...item.highlights] : [],
    preferredEntryPoints: item.preferredEntryPoints ? {
      cli: [...(item.preferredEntryPoints.cli ?? [])],
      mcp: [...(item.preferredEntryPoints.mcp ?? [])]
    } : { cli: [], mcp: [] },
    useCases: item.useCases ? [...item.useCases] : [],
    cliCommands: [...item.cliCommands],
    mcpTools: [...item.mcpTools]
  }));
}

export function getCapabilityCatalogEntry(id) {
  if (!id) {
    return undefined;
  }

  return getCapabilityCatalog().find((entry) => entry.id === id);
}
