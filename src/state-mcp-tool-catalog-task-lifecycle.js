export const TASK_LIFECYCLE_MCP_TOOL_CATALOG = [
  {
    name: "task_add",
    description: "Create a local coordination task in the persistent state store.",
    inputSchema: {
      type: "object",
      required: ["title"],
      properties: {
        title: { type: "string" },
        status: { type: "string" },
        owner: { type: "string" },
        verifier: { type: "string" },
        objective: { type: "string" },
        lane: { type: "string" },
        swarmId: { type: "string" },
        scope: { type: "array", items: { type: "string" } },
        dependsOn: { type: "array", items: { type: "string" } },
        acceptance: { type: "array", items: { type: "string" } },
        verification: { type: "array", items: { type: "string" } },
        notes: { type: "string" }
      }
    }
  },
  {
    name: "task_update",
    description: "Update a local coordination task in the persistent state store.",
    inputSchema: {
      type: "object",
      required: ["id"],
      properties: {
        id: { type: "string" },
        title: { type: "string" },
        status: { type: "string" },
        owner: { type: "string" },
        verifier: { type: "string" },
        objective: { type: "string" },
        lane: { type: "string" },
        swarmId: { type: "string" },
        scope: { type: "array", items: { type: "string" } },
        dependsOn: { type: "array", items: { type: "string" } },
        acceptance: { type: "array", items: { type: "string" } },
        verification: { type: "array", items: { type: "string" } },
        notes: { type: "string" }
      }
    }
  },
  {
    name: "task_annotate",
    description: "Add a persistent handoff note to one local coordination task.",
    inputSchema: {
      type: "object",
      required: ["id", "content"],
      properties: {
        id: { type: "string" },
        actor: { type: "string" },
        kind: { type: "string" },
        content: { type: "string" }
      }
    }
  },
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
  },
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
