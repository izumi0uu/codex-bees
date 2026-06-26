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

export const TASK_WORKER_LEADER_MCP_TOOL_CATALOG = [
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
        workerIds: WORKER_IDS_INPUT_SCHEMA,
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
        workerIds: WORKER_IDS_INPUT_SCHEMA,
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
        workerIds: WORKER_IDS_INPUT_SCHEMA,
        taskId: { type: "string" },
        status: { type: "string" },
        topology: { type: "string" }
      }
    }
  }
];
