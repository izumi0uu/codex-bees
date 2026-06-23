export const TASK_MCP_TOOL_CATALOG = [
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
  },
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
        workerIds: { type: "object", additionalProperties: { type: "string" } },
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
        workerIds: { type: "object", additionalProperties: { type: "string" } },
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
        workerIds: { type: "object", additionalProperties: { type: "string" } },
        taskId: { type: "string" },
        status: { type: "string" },
        topology: { type: "string" }
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
