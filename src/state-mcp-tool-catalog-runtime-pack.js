const WORKER_IDS_INPUT_SCHEMA = {
  type: "object",
  additionalProperties: {
    oneOf: [
      { type: "string" },
      {
        type: "array",
        items: { type: "string" }
      }
    ]
  }
};

export const RUNTIME_PACK_MCP_TOOL_CATALOG = [
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
    name: "runtime_closeout_pack",
    description: "Build the closeout-oriented runtime package for local runtime work.",
    inputSchema: {
      type: "object",
      properties: {
        workerId: { type: "string" },
        workerIds: WORKER_IDS_INPUT_SCHEMA
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
        workerIds: WORKER_IDS_INPUT_SCHEMA,
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
    name: "runtime_recovery_pack",
    description: "Build the recovery-oriented runtime package for local runtime work.",
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
    description: "Build the compact-by-default queue-oriented runtime package with launch-first recommendations for local runtime work.",
    inputSchema: {
      type: "object",
      properties: {
        workerId: { type: "string" },
        workerIds: WORKER_IDS_INPUT_SCHEMA,
        detail: { type: "string", enum: ["compact", "full"] }
      }
    }
  },
  {
    name: "runtime_workspace_pack",
    description: "Build the compact-by-default orchestration workspace package for local runtime work.",
    inputSchema: {
      type: "object",
      properties: {
        workerId: { type: "string" },
        workerIds: WORKER_IDS_INPUT_SCHEMA,
        detail: { type: "string", enum: ["compact", "full"] }
      }
    }
  },
  {
    name: "runtime_leader_pack",
    description: "Build the compact-by-default leader-oriented runtime package for local runtime work.",
    inputSchema: {
      type: "object",
      properties: {
        status: { type: "string" },
        topology: { type: "string" },
        owner: { type: "string" },
        workerId: { type: "string" },
        workerIds: WORKER_IDS_INPUT_SCHEMA,
        detail: { type: "string", enum: ["compact", "full"] }
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
        workerIds: WORKER_IDS_INPUT_SCHEMA,
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
    name: "runtime_dispatch_pack",
    description: "Build the compact-by-default dispatch-oriented runtime package for local runtime work.",
    inputSchema: {
      type: "object",
      properties: {
        workerId: { type: "string" },
        workerIds: WORKER_IDS_INPUT_SCHEMA,
        detail: { type: "string", enum: ["compact", "full"] }
      }
    }
  },
  {
    name: "runtime_execution_pack",
    description: "Build the compact-by-default execution-oriented runtime package for local runtime work.",
    inputSchema: {
      type: "object",
      properties: {
        workerId: { type: "string" },
        workerIds: WORKER_IDS_INPUT_SCHEMA,
        detail: { type: "string", enum: ["compact", "full"] }
      }
    }
  }
];
