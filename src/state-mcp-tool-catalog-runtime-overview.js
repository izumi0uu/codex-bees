export const RUNTIME_OVERVIEW_MCP_TOOL_CATALOG = [
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
    name: "runtime_closeout",
    description: "Build the final closeout workspace for local runtime work.",
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
    name: "runtime_recovery",
    description: "Build the recovery-oriented task workspace for local runtime work.",
    inputSchema: {
      type: "object",
      properties: {}
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
