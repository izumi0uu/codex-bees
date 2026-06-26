export const SWARM_QUERY_MCP_TOOL_CATALOG = [
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
  }
];
