export const TASK_LIFECYCLE_TRANSITION_MCP_TOOL_CATALOG = [
  {
    name: "task_archive",
    description: "Archive one completed standalone local coordination task.",
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
    name: "task_restore",
    description: "Restore one archived standalone local coordination task.",
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
    name: "task_reopen",
    description: "Reopen one done standalone local coordination task.",
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
    name: "task_claim",
    description: "Claim a queued local coordination task for one active owner.",
    inputSchema: {
      type: "object",
      required: ["id", "claimedBy"],
      properties: {
        id: { type: "string" },
        claimedBy: { type: "string" }
      }
    }
  },
  {
    name: "task_block",
    description: "Mark a local coordination task as blocked.",
    inputSchema: {
      type: "object",
      required: ["id"],
      properties: {
        id: { type: "string" },
        claimedBy: { type: "string" },
        notes: { type: "string" }
      }
    }
  },
  {
    name: "task_ready_for_review",
    description: "Mark a local coordination task as ready for review.",
    inputSchema: {
      type: "object",
      required: ["id"],
      properties: {
        id: { type: "string" },
        claimedBy: { type: "string" },
        notes: { type: "string" }
      }
    }
  },
  {
    name: "task_done",
    description: "Approve a ready-for-review task as its verifier.",
    inputSchema: {
      type: "object",
      required: ["id"],
      properties: {
        id: { type: "string" },
        reviewedBy: { type: "string" },
        claimedBy: { type: "string" },
        notes: { type: "string" },
        reviewEvidence: { type: "array", items: { type: "string" } }
      }
    }
  },
  {
    name: "task_approve",
    description: "Approve a ready-for-review task as its verifier.",
    inputSchema: {
      type: "object",
      required: ["id", "reviewedBy"],
      properties: {
        id: { type: "string" },
        reviewedBy: { type: "string" },
        notes: { type: "string" },
        reviewEvidence: { type: "array", items: { type: "string" } }
      }
    }
  },
  {
    name: "task_reject",
    description: "Return a ready-for-review task for more work as its verifier.",
    inputSchema: {
      type: "object",
      required: ["id", "reviewedBy"],
      properties: {
        id: { type: "string" },
        reviewedBy: { type: "string" },
        nextQueueStatus: { type: "string" },
        notes: { type: "string" },
        reviewEvidence: { type: "array", items: { type: "string" } }
      }
    }
  },
  {
    name: "task_release",
    description: "Release a claimed local coordination task back to the queue.",
    inputSchema: {
      type: "object",
      required: ["id"],
      properties: {
        id: { type: "string" },
        claimedBy: { type: "string" }
      }
    }
  }
];
