export const RUNTIME_MCP_TOOL_CATALOG = [
  {
    name: "runtime_doctor",
    description: "Return the runtime doctor diagnostics view for the local entrypoint.",
    inputSchema: {
      type: "object",
      properties: {}
    }
  },
  {
    name: "runtime_contract",
    description: "Return the Codex-only runtime contract, positioning, and exclusions.",
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
    name: "runtime_catalog_agent_document",
    description: "Return one shipped local agent document contract view.",
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
    name: "runtime_catalog_skill_document",
    description: "Return one shipped local skill document contract view.",
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
    description: "Build the compact-by-default automation/control runtime package for local runtime work.",
    inputSchema: {
      type: "object",
      properties: {
        workerId: { type: "string" },
        workerIds: { type: "object", additionalProperties: { type: "string" } },
        detail: { type: "string", enum: ["compact", "full"] }
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
    description: "Build the compact-by-default automation-first runtime summary package with launch context for local runtime work.",
    inputSchema: {
      type: "object",
      properties: {
        workerId: { type: "string" },
        workerIds: { type: "object", additionalProperties: { type: "string" } },
        detail: { type: "string", enum: ["compact", "full"] }
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
  }
];
