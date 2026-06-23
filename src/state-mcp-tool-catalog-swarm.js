export const SWARM_MCP_TOOL_CATALOG = [
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
              dependsOn: { type: "array", items: { type: "string" } },
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
    name: "swarm_archive_list",
    description: "List archived local swarm contracts from the persistent state store.",
    inputSchema: {
      type: "object",
      properties: {}
    }
  },
  {
    name: "swarm_archive_get",
    description: "Get one archived local swarm contract by id.",
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
    name: "swarm_archive",
    description: "Archive one completed or cancelled swarm together with its linked lane tasks.",
    inputSchema: {
      type: "object",
      required: ["id"],
      properties: {
        id: { type: "string" },
        archivedBy: { type: "string" },
        notes: { type: "string" }
      }
    }
  },
  {
    name: "swarm_restore",
    description: "Restore one archived swarm together with its linked lane tasks.",
    inputSchema: {
      type: "object",
      required: ["id"],
      properties: {
        id: { type: "string" },
        restoredBy: { type: "string" },
        notes: { type: "string" }
      }
    }
  },
  {
    name: "swarm_reopen",
    description: "Reopen one completed or cancelled swarm.",
    inputSchema: {
      type: "object",
      required: ["id"],
      properties: {
        id: { type: "string" },
        reopenedBy: { type: "string" },
        notes: { type: "string" }
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
              dependsOn: { type: "array", items: { type: "string" } },
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
  }
];
