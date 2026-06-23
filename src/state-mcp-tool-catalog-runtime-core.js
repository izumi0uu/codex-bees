export const RUNTIME_CORE_MCP_TOOL_CATALOG = [
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
  }
];
