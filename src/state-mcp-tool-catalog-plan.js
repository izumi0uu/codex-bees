export const PLAN_MCP_TOOL_CATALOG = [
  {
    name: "planner_profiles",
    description: "Return the available planner profile catalog view.",
    inputSchema: {
      type: "object",
      properties: {
        profileFile: { type: "string" }
      }
    }
  },
  {
    name: "planner_profile",
    description: "Return one available planner profile view.",
    inputSchema: {
      type: "object",
      required: ["profile"],
      properties: {
        profile: { type: "string" },
        profileFile: { type: "string" }
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
        task: { type: "string" },
        profile: { type: "string" },
        profileFile: { type: "string" }
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
        task: { type: "string" },
        profile: { type: "string" },
        profileFile: { type: "string" }
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
        task: { type: "string" },
        profile: { type: "string" },
        profileFile: { type: "string" }
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
        task: { type: "string" },
        profile: { type: "string" },
        profileFile: { type: "string" }
      }
    }
  }
];
