export const TASK_LIFECYCLE_PICKUP_MCP_TOOL_CATALOG = [
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
    name: "task_check",
    description: "Validate one task for bounded execution readiness.",
    inputSchema: {
      type: "object",
      required: ["id"],
      properties: {
        id: { type: "string" }
      }
    }
  }
];
