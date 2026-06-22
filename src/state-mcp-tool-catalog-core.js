export const CORE_MCP_TOOL_CATALOG = [
  {
    name: "package_metadata",
    description: "Return the shipped package identity contract for the local runtime.",
    inputSchema: {
      type: "object",
      properties: {}
    }
  },
  {
    name: "command_catalog",
    description: "Return the shipped CLI command catalog view.",
    inputSchema: {
      type: "object",
      properties: {}
    }
  },
  {
    name: "command_catalog_entry",
    description: "Return one shipped CLI command catalog entry view.",
    inputSchema: {
      type: "object",
      properties: {
        command: { type: "string" }
      },
      required: ["command"]
    }
  },
  {
    name: "command_help",
    description: "Return one shipped CLI command help view.",
    inputSchema: {
      type: "object",
      properties: {
        command: { type: "string" }
      },
      required: ["command"]
    }
  },
  {
    name: "init_command_catalog",
    description: "Return the shipped init command option catalog view.",
    inputSchema: {
      type: "object",
      properties: {}
    }
  },
  {
    name: "init_command_option",
    description: "Return one shipped init command option view.",
    inputSchema: {
      type: "object",
      properties: {
        option: { type: "string" }
      },
      required: ["option"]
    }
  },
  {
    name: "init_help",
    description: "Return one shipped init command help view.",
    inputSchema: {
      type: "object",
      properties: {
        option: { type: "string" }
      },
      required: ["option"]
    }
  },
  {
    name: "mcp_command_catalog",
    description: "Return the shipped MCP command option catalog view.",
    inputSchema: {
      type: "object",
      properties: {}
    }
  },
  {
    name: "mcp_command_option",
    description: "Return one shipped MCP command option view.",
    inputSchema: {
      type: "object",
      properties: {
        option: { type: "string" }
      },
      required: ["option"]
    }
  },
  {
    name: "mcp_help",
    description: "Return one shipped MCP command help view.",
    inputSchema: {
      type: "object",
      properties: {
        option: { type: "string" }
      },
      required: ["option"]
    }
  },
  {
    name: "tool_catalog",
    description: "Return the shipped MCP tool catalog view.",
    inputSchema: {
      type: "object",
      properties: {}
    }
  },
  {
    name: "tool_catalog_entry",
    description: "Return one shipped MCP tool catalog entry view.",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string" }
      },
      required: ["name"]
    }
  },
  {
    name: "coordination_overview",
    description: "Describe the current local coordination model for Codex Bees.",
    inputSchema: {
      type: "object",
      properties: {}
    }
  }
];
