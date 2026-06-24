const SWARM_LANE_ARRAY_SCHEMA = {
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
};

export const SWARM_LIFECYCLE_MCP_TOOL_CATALOG = [
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
        lanes: SWARM_LANE_ARRAY_SCHEMA
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
        lanes: SWARM_LANE_ARRAY_SCHEMA
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
