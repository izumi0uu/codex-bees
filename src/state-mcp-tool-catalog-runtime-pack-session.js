import { WORKER_IDS_INPUT_SCHEMA } from "./state-mcp-tool-catalog-runtime-pack-shared.js";

export const RUNTIME_PACK_SESSION_MCP_TOOL_CATALOG = [
  {
    name: "runtime_assignment_pack",
    description: "Build the leader-to-worker assignment package for local runtime work.",
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
    name: "runtime_review_pack",
    description: "Build the review-oriented runtime package for local runtime work.",
    inputSchema: {
      type: "object",
      properties: {
        role: { type: "string" },
        workerId: { type: "string" }
      }
    }
  },
  {
    name: "runtime_session_pack",
    description: "Build the per-worker runtime session package for local runtime work.",
    inputSchema: {
      type: "object",
      properties: {
        role: { type: "string" },
        workerId: { type: "string" },
        mode: { type: "string" }
      }
    }
  },
  {
    name: "runtime_owner_pack",
    description: "Build the owner-oriented runtime package for local runtime work.",
    inputSchema: {
      type: "object",
      required: ["role", "workerId"],
      properties: {
        role: { type: "string" },
        workerId: { type: "string" }
      }
    }
  },
  {
    name: "runtime_pickup_pack",
    description: "Build the start-work pickup package for one worker in local runtime work.",
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
    name: "runtime_role_pack",
    description: "Build the role-oriented runtime package for local runtime work.",
    inputSchema: {
      type: "object",
      properties: {
        role: { type: "string" },
        workerId: { type: "string" },
        mode: { type: "string" }
      }
    }
  },
  {
    name: "runtime_verifier_pack",
    description: "Build the verifier-oriented runtime package for local runtime work.",
    inputSchema: {
      type: "object",
      required: ["role", "workerId"],
      properties: {
        role: { type: "string" },
        workerId: { type: "string" }
      }
    }
  },
  {
    name: "runtime_worker_pack",
    description: "Build the worker-oriented runtime package for local runtime work.",
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
    name: "runtime_execution_pack",
    description: "Build the compact-by-default execution-oriented runtime package for local runtime work.",
    inputSchema: {
      type: "object",
      properties: {
        workerId: { type: "string" },
        workerIds: WORKER_IDS_INPUT_SCHEMA,
        detail: { type: "string", enum: ["compact", "full"] }
      }
    }
  }
];
