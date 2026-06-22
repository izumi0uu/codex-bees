export const toolCatalog = [
  {
    name: "package_metadata",
    description: "Return the shipped package identity contract for the local runtime.",
    inputSchema: {
      type: "object",
      properties: {}
    }
  },
  {
    name: "runtime_doctor",
    description: "Return the runtime doctor diagnostics view for the local entrypoint.",
    inputSchema: {
      type: "object",
      properties: {}
    }
  },
  {
    name: "command_catalog",
    description: "Return the shipped CLI command catalog view.",
    inputSchema: {
      type: "object",
      properties: {}
    }
  },
  {
    name: "command_catalog_entry",
    description: "Return one shipped CLI command catalog entry view.",
    inputSchema: {
      type: "object",
      properties: {
        command: { type: "string" }
      },
      required: ["command"]
    }
  },
  {
    name: "command_help",
    description: "Return one shipped CLI command help view.",
    inputSchema: {
      type: "object",
      properties: {
        command: { type: "string" }
      },
      required: ["command"]
    }
  },
  {
    name: "init_command_catalog",
    description: "Return the shipped init command option catalog view.",
    inputSchema: {
      type: "object",
      properties: {}
    }
  },
  {
    name: "init_command_option",
    description: "Return one shipped init command option view.",
    inputSchema: {
      type: "object",
      properties: {
        option: { type: "string" }
      },
      required: ["option"]
    }
  },
  {
    name: "init_help",
    description: "Return one shipped init command help view.",
    inputSchema: {
      type: "object",
      properties: {
        option: { type: "string" }
      },
      required: ["option"]
    }
  },
  {
    name: "mcp_command_catalog",
    description: "Return the shipped MCP command option catalog view.",
    inputSchema: {
      type: "object",
      properties: {}
    }
  },
  {
    name: "mcp_command_option",
    description: "Return one shipped MCP command option view.",
    inputSchema: {
      type: "object",
      properties: {
        option: { type: "string" }
      },
      required: ["option"]
    }
  },
  {
    name: "mcp_help",
    description: "Return one shipped MCP command help view.",
    inputSchema: {
      type: "object",
      properties: {
        option: { type: "string" }
      },
      required: ["option"]
    }
  },
  {
    name: "tool_catalog",
    description: "Return the shipped MCP tool catalog view.",
    inputSchema: {
      type: "object",
      properties: {}
    }
  },
  {
    name: "tool_catalog_entry",
    description: "Return one shipped MCP tool catalog entry view.",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string" }
      },
      required: ["name"]
    }
  },
  {
    name: "coordination_overview",
    description: "Describe the current local coordination model for Codex Bees.",
    inputSchema: {
      type: "object",
      properties: {}
    }
  },
  {
    name: "worker_guidelines",
    description: "Return the current worker ownership and handoff guidelines.",
    inputSchema: {
      type: "object",
      properties: {}
    }
  },
  {
    name: "runtime_contract",
    description: "Return the Codex-only runtime contract and exclusions.",
    inputSchema: {
      type: "object",
      properties: {}
    }
  },
  {
    name: "runtime_catalog",
    description: "Return the shipped local agent and skill catalog.",
    inputSchema: {
      type: "object",
      properties: {}
    }
  },
  {
    name: "runtime_catalog_agents",
    description: "Return the shipped local agent catalog lane view.",
    inputSchema: {
      type: "object",
      properties: {}
    }
  },
  {
    name: "runtime_catalog_skills",
    description: "Return the shipped local skill catalog lane view.",
    inputSchema: {
      type: "object",
      properties: {}
    }
  },
  {
    name: "runtime_catalog_agent",
    description: "Return one shipped local agent catalog entry view.",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string" }
      },
      required: ["id"]
    }
  },
  {
    name: "runtime_catalog_skill",
    description: "Return one shipped local skill catalog entry view.",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string" }
      },
      required: ["id"]
    }
  },
  {
    name: "runtime_ready",
    description: "Return the explicit runtime readiness view and next startup steps.",
    inputSchema: {
      type: "object",
      properties: {}
    }
  },
  {
    name: "runtime_status",
    description: "Return the current runtime state summary and shipped surface counts.",
    inputSchema: {
      type: "object",
      properties: {}
    }
  },
  {
    name: "runtime_capabilities",
    description: "Return the shipped capability inventory for the local Codex-only runtime.",
    inputSchema: {
      type: "object",
      properties: {}
    }
  },
  {
    name: "runtime_capability",
    description: "Return one shipped runtime capability view.",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string" }
      },
      required: ["id"]
    }
  },
  {
    name: "runtime_activity",
    description: "Build the recent runtime activity stream for local runtime work.",
    inputSchema: {
      type: "object",
      properties: {
        limit: { type: "integer", minimum: 1 }
      }
    }
  },
  {
    name: "runtime_assignment_pack",
    description: "Build the leader-to-worker assignment package for local runtime work.",
    inputSchema: {
      type: "object",
      required: ["role", "workerId"],
      properties: {
        role: { type: "string" },
        workerId: { type: "string" },
        mode: { type: "string" }
      }
    }
  },
  {
    name: "runtime_closeout",
    description: "Build the final closeout workspace for local runtime work.",
    inputSchema: {
      type: "object",
      properties: {}
    }
  },
  {
    name: "runtime_closeout_pack",
    description: "Build the closeout-oriented runtime package for local runtime work.",
    inputSchema: {
      type: "object",
      properties: {
        workerId: { type: "string" },
        workerIds: { type: "object", additionalProperties: { type: "string" } }
      }
    }
  },
  {
    name: "runtime_control_pack",
    description: "Build the automation/control runtime package for local runtime work.",
    inputSchema: {
      type: "object",
      properties: {
        workerId: { type: "string" },
        workerIds: { type: "object", additionalProperties: { type: "string" } }
      }
    }
  },
  {
    name: "runtime_signal_pack",
    description: "Build the signal-oriented runtime package for local runtime work.",
    inputSchema: {
      type: "object",
      properties: {
        limit: { type: "integer" }
      }
    }
  },
  {
    name: "runtime_handoff_pack",
    description: "Build the handoff-oriented runtime package for local runtime work.",
    inputSchema: {
      type: "object",
      properties: {}
    }
  },
  {
    name: "runtime_triage_pack",
    description: "Build the triage-oriented runtime package for local runtime work.",
    inputSchema: {
      type: "object",
      properties: {}
    }
  },
  {
    name: "runtime_handoffs",
    description: "Build the next-actor handoff workspace for local runtime work.",
    inputSchema: {
      type: "object",
      properties: {}
    }
  },
  {
    name: "runtime_recovery_pack",
    description: "Build the recovery-oriented runtime package for local runtime work.",
    inputSchema: {
      type: "object",
      properties: {}
    }
  },
  {
    name: "runtime_recovery",
    description: "Build the recovery-oriented task workspace for local runtime work.",
    inputSchema: {
      type: "object",
      properties: {}
    }
  },
  {
    name: "runtime_review_pack",
    description: "Build the review-oriented runtime package for local runtime work.",
    inputSchema: {
      type: "object",
      properties: {
        role: { type: "string" },
        workerId: { type: "string" }
      }
    }
  },
  {
    name: "runtime_session_pack",
    description: "Build the per-worker runtime session package for local runtime work.",
    inputSchema: {
      type: "object",
      properties: {
        role: { type: "string" },
        workerId: { type: "string" },
        mode: { type: "string" }
      }
    }
  },
  {
    name: "runtime_queue_pack",
    description: "Build the queue-oriented runtime package with launch-first recommendations for local runtime work.",
    inputSchema: {
      type: "object",
      properties: {
        workerId: { type: "string" },
        workerIds: { type: "object", additionalProperties: { type: "string" } }
      }
    }
  },
  {
    name: "runtime_workspace_pack",
    description: "Build the orchestration workspace package for local runtime work.",
    inputSchema: {
      type: "object",
      properties: {
        workerId: { type: "string" },
        workerIds: { type: "object", additionalProperties: { type: "string" } }
      }
    }
  },
  {
    name: "runtime_leader_pack",
    description: "Build the leader-oriented runtime package for local runtime work.",
    inputSchema: {
      type: "object",
      properties: {
        status: { type: "string" },
        topology: { type: "string" },
        owner: { type: "string" },
        workerId: { type: "string" },
        workerIds: { type: "object", additionalProperties: { type: "string" } }
      }
    }
  },
  {
    name: "runtime_operator_pack",
    description: "Build the operator-oriented runtime package for local runtime work.",
    inputSchema: {
      type: "object",
      properties: {}
    }
  },
  {
    name: "runtime_owner_pack",
    description: "Build the owner-oriented runtime package for local runtime work.",
    inputSchema: {
      type: "object",
      required: ["role", "workerId"],
      properties: {
        role: { type: "string" },
        workerId: { type: "string" }
      }
    }
  },
  {
    name: "runtime_pickup_pack",
    description: "Build the start-work pickup package for one worker in local runtime work.",
    inputSchema: {
      type: "object",
      required: ["role", "workerId"],
      properties: {
        role: { type: "string" },
        workerId: { type: "string" },
        mode: { type: "string" }
      }
    }
  },
  {
    name: "runtime_role_pack",
    description: "Build the role-oriented runtime package for local runtime work.",
    inputSchema: {
      type: "object",
      properties: {
        role: { type: "string" },
        workerId: { type: "string" },
        mode: { type: "string" }
      }
    }
  },
  {
    name: "runtime_summary_pack",
    description: "Build the automation-first runtime summary package with compact launch context for local runtime work.",
    inputSchema: {
      type: "object",
      properties: {
        workerId: { type: "string" },
        workerIds: { type: "object", additionalProperties: { type: "string" } }
      }
    }
  },
  {
    name: "runtime_verifier_pack",
    description: "Build the verifier-oriented runtime package for local runtime work.",
    inputSchema: {
      type: "object",
      required: ["role", "workerId"],
      properties: {
        role: { type: "string" },
        workerId: { type: "string" }
      }
    }
  },
  {
    name: "runtime_worker_pack",
    description: "Build the worker-oriented runtime package for local runtime work.",
    inputSchema: {
      type: "object",
      required: ["role", "workerId"],
      properties: {
        role: { type: "string" },
        workerId: { type: "string" },
        mode: { type: "string" }
      }
    }
  },
  {
    name: "runtime_dashboard",
    description: "Build the top-level orchestration dashboard for local runtime work.",
    inputSchema: {
      type: "object",
      properties: {}
    }
  },
  {
    name: "runtime_dispatch",
    description: "Build the owner-grouped dispatch workspace for local runtime work.",
    inputSchema: {
      type: "object",
      properties: {}
    }
  },
  {
    name: "runtime_dispatch_pack",
    description: "Build the dispatch-oriented runtime package for local runtime work.",
    inputSchema: {
      type: "object",
      properties: {
        workerId: { type: "string" },
        workerIds: { type: "object", additionalProperties: { type: "string" } }
      }
    }
  },
  {
    name: "runtime_execution_pack",
    description: "Build the execution-oriented runtime package for local runtime work.",
    inputSchema: {
      type: "object",
      properties: {
        workerId: { type: "string" },
        workerIds: { type: "object", additionalProperties: { type: "string" } }
      }
    }
  },
  {
    name: "runtime_focus",
    description: "Build the single next-action runtime focus for local runtime work.",
    inputSchema: {
      type: "object",
      properties: {}
    }
  },
  {
    name: "runtime_review",
    description: "Build the verifier-grouped review workspace for local runtime work.",
    inputSchema: {
      type: "object",
      properties: {}
    }
  },
  {
    name: "runtime_alerts",
    description: "Build the top-level orchestration alert stream for local runtime work.",
    inputSchema: {
      type: "object",
      properties: {}
    }
  },
  {
    name: "runtime_roles",
    description: "Build the role-level orchestration queue view for local runtime work.",
    inputSchema: {
      type: "object",
      properties: {
        limit: { type: "integer", minimum: 1 }
      }
    }
  },
  {
    name: "task_list",
    description: "List local coordination tasks from the persistent state store.",
    inputSchema: {
      type: "object",
      properties: {}
    }
  },
  {
    name: "task_add",
    description: "Create a local coordination task in the persistent state store.",
    inputSchema: {
      type: "object",
      required: ["title"],
      properties: {
        title: { type: "string" },
        status: { type: "string" },
        owner: { type: "string" },
        verifier: { type: "string" },
        objective: { type: "string" },
        lane: { type: "string" },
        swarmId: { type: "string" },
        scope: { type: "array", items: { type: "string" } },
        acceptance: { type: "array", items: { type: "string" } },
        verification: { type: "array", items: { type: "string" } },
        notes: { type: "string" }
      }
    }
  },
  {
    name: "task_update",
    description: "Update a local coordination task in the persistent state store.",
    inputSchema: {
      type: "object",
      required: ["id"],
      properties: {
        id: { type: "string" },
        title: { type: "string" },
        status: { type: "string" },
        owner: { type: "string" },
        verifier: { type: "string" },
        objective: { type: "string" },
        lane: { type: "string" },
        swarmId: { type: "string" },
        scope: { type: "array", items: { type: "string" } },
        acceptance: { type: "array", items: { type: "string" } },
        verification: { type: "array", items: { type: "string" } },
        notes: { type: "string" }
      }
    }
  },
  {
    name: "task_get",
    description: "Get one local coordination task by id.",
    inputSchema: {
      type: "object",
      required: ["id"],
      properties: {
        id: { type: "string" }
      }
    }
  },
  {
    name: "task_history",
    description: "Get structured handoff history for one local coordination task.",
    inputSchema: {
      type: "object",
      required: ["id"],
      properties: {
        id: { type: "string" }
      }
    }
  },
  {
    name: "task_annotate",
    description: "Add a persistent handoff note to one local coordination task.",
    inputSchema: {
      type: "object",
      required: ["id", "content"],
      properties: {
        id: { type: "string" },
        actor: { type: "string" },
        kind: { type: "string" },
        content: { type: "string" }
      }
    }
  },
  {
    name: "task_report",
    description: "Build a delivery-ready report for one local coordination task.",
    inputSchema: {
      type: "object",
      required: ["id"],
      properties: {
        id: { type: "string" }
      }
    }
  },
  {
    name: "task_brief",
    description: "Render an execution brief for one local coordination task.",
    inputSchema: {
      type: "object",
      required: ["id"],
      properties: {
        id: { type: "string" }
      }
    }
  },
  {
    name: "task_inbox",
    description: "List role-relevant tasks in priority order for owner or verifier workflows.",
    inputSchema: {
      type: "object",
      required: ["role"],
      properties: {
        role: { type: "string" },
        workerId: { type: "string" },
        limit: { type: "number" }
      }
    }
  },
  {
    name: "task_next",
    description: "Resolve the next task a role should claim or review.",
    inputSchema: {
      type: "object",
      required: ["role"],
      properties: {
        role: { type: "string" },
        workerId: { type: "string" },
        mode: { type: "string" }
      }
    }
  },
  {
    name: "task_assignment_preview",
    description: "Preview the next leader-assigned task for one worker without mutating state.",
    inputSchema: {
      type: "object",
      required: ["role", "workerId"],
      properties: {
        role: { type: "string" },
        workerId: { type: "string" },
        mode: { type: "string" },
        taskId: { type: "string" }
      }
    }
  },
  {
    name: "task_assignment_pickup",
    description: "Claim or resume the next leader-assigned task for one worker.",
    inputSchema: {
      type: "object",
      required: ["role", "workerId"],
      properties: {
        role: { type: "string" },
        workerId: { type: "string" },
        mode: { type: "string" },
        taskId: { type: "string" }
      }
    }
  },
  {
    name: "task_pickup",
    description: "Claim or resume the next task for one worker and return the follow-up brief.",
    inputSchema: {
      type: "object",
      required: ["role", "workerId"],
      properties: {
        role: { type: "string" },
        workerId: { type: "string" },
        mode: { type: "string" }
      }
    }
  },
  {
    name: "task_pickup_preview",
    description: "Preview what the next task pickup would do for one worker without mutating state.",
    inputSchema: {
      type: "object",
      required: ["role", "workerId"],
      properties: {
        role: { type: "string" },
        workerId: { type: "string" },
        mode: { type: "string" }
      }
    }
  },
  {
    name: "worker_session",
    description: "Show the current execution workspace for one worker.",
    inputSchema: {
      type: "object",
      required: ["role", "workerId"],
      properties: {
        role: { type: "string" },
        workerId: { type: "string" },
        mode: { type: "string" },
        limit: { type: "number" }
      }
    }
  },
  {
    name: "worker_handoff",
    description: "Build a return-ready handoff package for one worker.",
    inputSchema: {
      type: "object",
      required: ["role", "workerId"],
      properties: {
        role: { type: "string" },
        workerId: { type: "string" },
        mode: { type: "string" },
        limit: { type: "number" }
      }
    }
  },
  {
    name: "worker_closeout",
    description: "Build a closure-oriented bundle for one worker.",
    inputSchema: {
      type: "object",
      required: ["role", "workerId"],
      properties: {
        role: { type: "string" },
        workerId: { type: "string" },
        mode: { type: "string" },
        limit: { type: "number" }
      }
    }
  },
  {
    name: "verifier_bundle",
    description: "Build a decision-ready bundle for one verifier.",
    inputSchema: {
      type: "object",
      required: ["role", "workerId"],
      properties: {
        role: { type: "string" },
        workerId: { type: "string" },
        limit: { type: "number" }
      }
    }
  },
  {
    name: "leader_workspace",
    description: "Build a leader-ready orchestration workspace across local swarms.",
    inputSchema: {
      type: "object",
      properties: {
        status: { type: "string" },
        topology: { type: "string" },
        owner: { type: "string" }
      }
    }
  },
  {
    name: "leader_queue",
    description: "Build a prioritized leader decision queue across local swarms.",
    inputSchema: {
      type: "object",
      properties: {
        status: { type: "string" },
        topology: { type: "string" },
        owner: { type: "string" }
      }
    }
  },
  {
    name: "leader_assignments",
    description: "Build owner-grouped dispatch assignments across local swarms.",
    inputSchema: {
      type: "object",
      properties: {
        status: { type: "string" },
        topology: { type: "string" },
        owner: { type: "string" }
      }
    }
  },
  {
    name: "leader_assignment_dispatch",
    description: "Build a worker-targeted dispatch package for one leader assignment.",
    inputSchema: {
      type: "object",
      properties: {
        role: { type: "string" },
        owner: { type: "string" },
        workerId: { type: "string" },
        taskId: { type: "string" },
        status: { type: "string" },
        topology: { type: "string" }
      }
    }
  },
  {
    name: "leader_assignment_dispatch_bundle",
    description: "Build a multi-worker launch bundle across owner groups.",
    inputSchema: {
      type: "object",
      properties: {
        role: { type: "string" },
        owner: { type: "string" },
        workerId: { type: "string" },
        workerIds: { type: "object", additionalProperties: { type: "string" } },
        taskId: { type: "string" },
        status: { type: "string" },
        topology: { type: "string" }
      }
    }
  },
  {
    name: "leader_assignment_launch_plan",
    description: "Build a step-by-step startup plan across worker launches.",
    inputSchema: {
      type: "object",
      properties: {
        role: { type: "string" },
        owner: { type: "string" },
        workerId: { type: "string" },
        workerIds: { type: "object", additionalProperties: { type: "string" } },
        taskId: { type: "string" },
        status: { type: "string" },
        topology: { type: "string" }
      }
    }
  },
  {
    name: "leader_assignment_dispatch_pack",
    description: "Build worker-targeted dispatch packages across owner groups.",
    inputSchema: {
      type: "object",
      properties: {
        role: { type: "string" },
        owner: { type: "string" },
        workerId: { type: "string" },
        workerIds: { type: "object", additionalProperties: { type: "string" } },
        taskId: { type: "string" },
        status: { type: "string" },
        topology: { type: "string" }
      }
    }
  },
  {
    name: "task_check",
    description: "Validate one task for bounded execution readiness.",
    inputSchema: {
      type: "object",
      required: ["id"],
      properties: {
        id: { type: "string" }
      }
    }
  },
  {
    name: "task_claim",
    description: "Claim a queued local coordination task for one active owner.",
    inputSchema: {
      type: "object",
      required: ["id", "claimedBy"],
      properties: {
        id: { type: "string" },
        claimedBy: { type: "string" }
      }
    }
  },
  {
    name: "task_block",
    description: "Mark a local coordination task as blocked.",
    inputSchema: {
      type: "object",
      required: ["id"],
      properties: {
        id: { type: "string" },
        claimedBy: { type: "string" },
        notes: { type: "string" }
      }
    }
  },
  {
    name: "task_ready_for_review",
    description: "Mark a local coordination task as ready for review.",
    inputSchema: {
      type: "object",
      required: ["id"],
      properties: {
        id: { type: "string" },
        claimedBy: { type: "string" },
        notes: { type: "string" }
      }
    }
  },
  {
    name: "task_done",
    description: "Approve a ready-for-review task as its verifier.",
    inputSchema: {
      type: "object",
      required: ["id"],
      properties: {
        id: { type: "string" },
        reviewedBy: { type: "string" },
        claimedBy: { type: "string" },
        notes: { type: "string" },
        reviewEvidence: { type: "array", items: { type: "string" } }
      }
    }
  },
  {
    name: "task_approve",
    description: "Approve a ready-for-review task as its verifier.",
    inputSchema: {
      type: "object",
      required: ["id", "reviewedBy"],
      properties: {
        id: { type: "string" },
        reviewedBy: { type: "string" },
        notes: { type: "string" },
        reviewEvidence: { type: "array", items: { type: "string" } }
      }
    }
  },
  {
    name: "task_reject",
    description: "Return a ready-for-review task for more work as its verifier.",
    inputSchema: {
      type: "object",
      required: ["id", "reviewedBy"],
      properties: {
        id: { type: "string" },
        reviewedBy: { type: "string" },
        nextQueueStatus: { type: "string" },
        notes: { type: "string" },
        reviewEvidence: { type: "array", items: { type: "string" } }
      }
    }
  },
  {
    name: "task_release",
    description: "Release a claimed local coordination task back to the queue.",
    inputSchema: {
      type: "object",
      required: ["id"],
      properties: {
        id: { type: "string" },
        claimedBy: { type: "string" }
      }
    }
  },
  {
    name: "swarm_list",
    description: "List local swarm contracts from the persistent state store.",
    inputSchema: {
      type: "object",
      properties: {
        status: { type: "string" },
        topology: { type: "string" },
        owner: { type: "string" },
        detailed: { type: "boolean" }
      }
    }
  },
  {
    name: "swarm_init",
    description: "Create a bounded local swarm contract with optional lanes.",
    inputSchema: {
      type: "object",
      required: ["objective"],
      properties: {
        objective: { type: "string" },
        topology: { type: "string" },
        maxWorkers: { type: "number" },
        owner: { type: "string" },
        laneSource: { type: "string" },
        notes: { type: "string" },
        lanes: {
          type: "array",
          items: {
            type: "object",
            properties: {
              lane: { type: "string" },
              summary: { type: "string" },
              owner: { type: "string" },
              verifier: { type: "string" },
              scope: { type: "array", items: { type: "string" } },
              acceptance: { type: "array", items: { type: "string" } },
              verification: { type: "array", items: { type: "string" } }
            }
          }
        }
      }
    }
  },
  {
    name: "swarm_get",
    description: "Get one local swarm contract by id.",
    inputSchema: {
      type: "object",
      required: ["id"],
      properties: {
        id: { type: "string" }
      }
    }
  },
  {
    name: "swarm_brief",
    description: "Render an execution brief for one local swarm contract.",
    inputSchema: {
      type: "object",
      required: ["id"],
      properties: {
        id: { type: "string" }
      }
    }
  },
  {
    name: "swarm_bundle",
    description: "Build a leader-ready orchestration bundle for one swarm.",
    inputSchema: {
      type: "object",
      required: ["id"],
      properties: {
        id: { type: "string" }
      }
    }
  },
  {
    name: "swarm_blockers",
    description: "Build a blocker-oriented bundle for one swarm.",
    inputSchema: {
      type: "object",
      required: ["id"],
      properties: {
        id: { type: "string" }
      }
    }
  },
  {
    name: "swarm_closeout",
    description: "Build a closure-oriented bundle for one swarm.",
    inputSchema: {
      type: "object",
      required: ["id"],
      properties: {
        id: { type: "string" }
      }
    }
  },
  {
    name: "swarm_dispatch_bundle",
    description: "Build a dispatch-oriented bundle for one swarm.",
    inputSchema: {
      type: "object",
      required: ["id"],
      properties: {
        id: { type: "string" }
      }
    }
  },
  {
    name: "swarm_update",
    description: "Update mutable fields on a local swarm contract.",
    inputSchema: {
      type: "object",
      required: ["id"],
      properties: {
        id: { type: "string" },
        objective: { type: "string" },
        topology: { type: "string" },
        maxWorkers: { type: "number" },
        owner: { type: "string" },
        laneSource: { type: "string" },
        notes: { type: "string" },
        lanes: {
          type: "array",
          items: {
            type: "object",
            properties: {
              lane: { type: "string" },
              summary: { type: "string" },
              owner: { type: "string" },
              verifier: { type: "string" },
              scope: { type: "array", items: { type: "string" } },
              acceptance: { type: "array", items: { type: "string" } },
              verification: { type: "array", items: { type: "string" } }
            }
          }
        }
      }
    }
  },
  {
    name: "swarm_check",
    description: "Validate one swarm for bounded lane readiness and scope overlap.",
    inputSchema: {
      type: "object",
      required: ["id"],
      properties: {
        id: { type: "string" }
      }
    }
  },
  {
    name: "swarm_overview",
    description: "Summarize swarm progress, lane statuses, and the next runnable lane.",
    inputSchema: {
      type: "object",
      required: ["id"],
      properties: {
        id: { type: "string" }
      }
    }
  },
  {
    name: "swarm_dispatch",
    description: "Claim the next runnable lane task from a swarm for one worker.",
    inputSchema: {
      type: "object",
      required: ["id", "claimedBy"],
      properties: {
        id: { type: "string" },
        claimedBy: { type: "string" },
        owner: { type: "string" }
      }
    }
  },
  {
    name: "swarm_sync",
    description: "Align swarm status with the current lane task reality.",
    inputSchema: {
      type: "object",
      required: ["id"],
      properties: {
        id: { type: "string" }
      }
    }
  },
  {
    name: "swarm_activate",
    description: "Mark a local swarm contract active.",
    inputSchema: {
      type: "object",
      required: ["id"],
      properties: {
        id: { type: "string" },
        owner: { type: "string" },
        notes: { type: "string" }
      }
    }
  },
  {
    name: "swarm_block",
    description: "Mark a local swarm contract blocked.",
    inputSchema: {
      type: "object",
      required: ["id"],
      properties: {
        id: { type: "string" },
        owner: { type: "string" },
        notes: { type: "string" }
      }
    }
  },
  {
    name: "swarm_done",
    description: "Mark a local swarm contract completed.",
    inputSchema: {
      type: "object",
      required: ["id"],
      properties: {
        id: { type: "string" },
        owner: { type: "string" },
        notes: { type: "string" }
      }
    }
  },
  {
    name: "swarm_cancel",
    description: "Cancel a local swarm contract.",
    inputSchema: {
      type: "object",
      required: ["id"],
      properties: {
        id: { type: "string" },
        owner: { type: "string" },
        notes: { type: "string" }
      }
    }
  },
  {
    name: "swarm_queue_tasks",
    description: "Queue a swarm's lanes into bounded local tasks.",
    inputSchema: {
      type: "object",
      required: ["id"],
      properties: {
        id: { type: "string" }
      }
    }
  },
  {
    name: "plan_task",
    description: "Generate a bounded read-only execution plan for a task brief.",
    inputSchema: {
      type: "object",
      required: ["task"],
      properties: {
        task: { type: "string" }
      }
    }
  },
  {
    name: "queue_plan",
    description: "Generate a bounded execution plan and queue its lanes as local tasks.",
    inputSchema: {
      type: "object",
      required: ["task"],
      properties: {
        task: { type: "string" }
      }
    }
  },
  {
    name: "plan_swarm",
    description: "Generate a bounded local swarm contract from a task brief.",
    inputSchema: {
      type: "object",
      required: ["task"],
      properties: {
        task: { type: "string" }
      }
    }
  },
  {
    name: "queue_plan_swarm",
    description: "Generate a bounded local swarm contract and queue its lanes as local tasks.",
    inputSchema: {
      type: "object",
      required: ["task"],
      properties: {
        task: { type: "string" }
      }
    }
  },
  {
    name: "memory_store",
    description: "Store a persistent local memory for later recall.",
    inputSchema: {
      type: "object",
      required: ["content"],
      properties: {
        content: { type: "string" },
        namespace: { type: "string" },
        kind: { type: "string" },
        title: { type: "string" },
        agent: { type: "string" },
        tags: { type: "array", items: { type: "string" } },
        notes: { type: "string" }
      }
    }
  },
  {
    name: "memory_get",
    description: "Load one persistent local memory by id.",
    inputSchema: {
      type: "object",
      required: ["id"],
      properties: {
        id: { type: "string" }
      }
    }
  },
  {
    name: "memory_list",
    description: "List persistent local memories with optional filters.",
    inputSchema: {
      type: "object",
      properties: {
        namespace: { type: "string" },
        kind: { type: "string" },
        agent: { type: "string" },
        tags: { type: "array", items: { type: "string" } }
      }
    }
  },
  {
    name: "memory_search",
    description: "Search persistent local memories by query and optional filters.",
    inputSchema: {
      type: "object",
      required: ["query"],
      properties: {
        query: { type: "string" },
        namespace: { type: "string" },
        kind: { type: "string" },
        agent: { type: "string" },
        tags: { type: "array", items: { type: "string" } },
        limit: { type: "number" }
      }
    }
  }
];

function toolGroupFromName(name) {
  if (!name) {
    return "unknown";
  }
  const [group] = name.split("_");
  return group || "unknown";
}

export function getToolCatalogView() {
  const groups = toolCatalog.reduce((counts, tool) => {
    const group = toolGroupFromName(tool.name);
    counts[group] = (counts[group] ?? 0) + 1;
    return counts;
  }, {});

  return {
    kind: "tool_catalog_view",
    recommendedReason: toolCatalog.length > 0 ? "tool_catalog_loaded" : "tool_catalog_empty",
    counts: {
      totalTools: toolCatalog.length,
      groups
    },
    tools: toolCatalog
  };
}

function toolByName(name) {
  return toolCatalog.find((tool) => tool.name === name);
}

export function getMcpToolEntry(name) {
  if (!name) {
    return undefined;
  }

  const tool = toolByName(name);
  return tool ? JSON.parse(JSON.stringify(tool)) : undefined;
}

export function getMcpToolView(name) {
  const tool = getMcpToolEntry(name);

  return {
    kind: "mcp_tool_view",
    recommendedReason: tool ? "mcp_tool_loaded" : "mcp_tool_missing",
    name: name ?? null,
    matchedTool: tool?.name ?? null,
    tool: tool ?? null
  };
}

export function listMcpTools() {
  return JSON.parse(JSON.stringify(toolCatalog));
}
