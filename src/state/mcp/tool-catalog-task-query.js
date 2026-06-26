export const TASK_QUERY_MCP_TOOL_CATALOG = [
  {
    name: "worker_guidelines",
    description: "Return the current worker ownership and handoff guidelines.",
    inputSchema: {
      type: "object",
      properties: {}
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
    name: "task_archive_list",
    description: "List archived local coordination tasks from the persistent state store.",
    inputSchema: {
      type: "object",
      properties: {}
    }
  },
  {
    name: "task_archive_get",
    description: "Get one archived local coordination task by id.",
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
  }
];
