import {
  approveTaskLifecycle,
  blockTaskLifecycle,
  claimTaskLifecycle,
  completeTaskLifecycle,
  markTaskReadyForReviewLifecycle,
  rejectTaskLifecycle,
  releaseTaskLifecycle,
  taskAssignmentPickup,
  taskPickup
} from "./state-runtime.js";
import { createError, createSuccess, createTextPayload } from "./state-mcp-runtime-response.js";

const TASK_TRANSITION_MCP_TOOL_HANDLERS = {
  task_pickup({ id, args, metadata }) {
    const params = { arguments: args };
    if (!params.arguments?.role) {
      return createError(id, -32602, "task_pickup requires arguments.role");
    }
    if (!params.arguments?.workerId) {
      return createError(id, -32602, "task_pickup requires arguments.workerId");
    }

    const pickup = taskPickup({
      role: params.arguments.role,
      workerId: params.arguments.workerId,
      mode: params.arguments.mode
    });

    return createSuccess(id, createTextPayload({ pickup }));
  },

  task_assignment_pickup({ id, args, metadata }) {
    const params = { arguments: args };
    if (!params.arguments?.role) {
      return createError(id, -32602, "task_assignment_pickup requires arguments.role");
    }
    if (!params.arguments?.workerId) {
      return createError(id, -32602, "task_assignment_pickup requires arguments.workerId");
    }

    const assignmentPickup = taskAssignmentPickup({
      role: params.arguments.role,
      workerId: params.arguments.workerId,
      mode: params.arguments.mode,
      taskId: params.arguments.taskId
    });

    return createSuccess(id, createTextPayload({ assignmentPickup }));
  },

  task_claim({ id, args, metadata }) {
    const params = { arguments: args };
    if (!params.arguments?.id) {
      return createError(id, -32602, "task_claim requires arguments.id");
    }
    if (!params.arguments?.claimedBy) {
      return createError(id, -32602, "task_claim requires arguments.claimedBy");
    }

    const task = claimTaskLifecycle({
      id: params.arguments.id,
      claimedBy: params.arguments.claimedBy
    });

    if (!task) {
      return createError(id, -32602, `Unknown task id: ${params.arguments.id}`);
    }
    if (task.error) {
      return createError(id, -32602, task.error);
    }

    return createSuccess(id, createTextPayload({ claimed: task }));
  },

  task_block({ id, args, metadata }) {
    const params = { arguments: args };
    if (!params.arguments?.id) {
      return createError(id, -32602, "task_block requires arguments.id");
    }

    const task = blockTaskLifecycle({
      id: params.arguments.id,
      claimedBy: params.arguments.claimedBy,
      notes: params.arguments.notes
    });

    if (!task) {
      return createError(id, -32602, `Unknown task id: ${params.arguments.id}`);
    }
    if (task.error) {
      return createError(id, -32602, task.error);
    }

    return createSuccess(id, createTextPayload({ blocked: task }));
  },

  task_ready_for_review({ id, args, metadata }) {
    const params = { arguments: args };
    if (!params.arguments?.id) {
      return createError(id, -32602, "task_ready_for_review requires arguments.id");
    }

    const task = markTaskReadyForReviewLifecycle({
      id: params.arguments.id,
      claimedBy: params.arguments.claimedBy,
      notes: params.arguments.notes
    });

    if (!task) {
      return createError(id, -32602, `Unknown task id: ${params.arguments.id}`);
    }
    if (task.error) {
      return createError(id, -32602, task.error);
    }

    return createSuccess(id, createTextPayload({ readyForReview: task }));
  },

  task_done({ id, args, metadata }) {
    const params = { arguments: args };
    if (!params.arguments?.id) {
      return createError(id, -32602, "task_done requires arguments.id");
    }

    const task = completeTaskLifecycle({
      id: params.arguments.id,
      reviewedBy: params.arguments.reviewedBy ?? params.arguments.claimedBy,
      notes: params.arguments.notes,
      reviewEvidence: params.arguments.reviewEvidence
    });

    if (!task) {
      return createError(id, -32602, `Unknown task id: ${params.arguments.id}`);
    }
    if (task.error) {
      return createError(id, -32602, task.error);
    }

    return createSuccess(id, createTextPayload({ completed: task }));
  },

  task_approve({ id, args, metadata }) {
    const params = { arguments: args };
    if (!params.arguments?.id) {
      return createError(id, -32602, "task_approve requires arguments.id");
    }
    if (!params.arguments?.reviewedBy) {
      return createError(id, -32602, "task_approve requires arguments.reviewedBy");
    }

    const task = approveTaskLifecycle({
      id: params.arguments.id,
      reviewedBy: params.arguments.reviewedBy,
      notes: params.arguments.notes,
      reviewEvidence: params.arguments.reviewEvidence
    });

    if (!task) {
      return createError(id, -32602, `Unknown task id: ${params.arguments.id}`);
    }
    if (task.error) {
      return createError(id, -32602, task.error);
    }

    return createSuccess(id, createTextPayload({ approved: task }));
  },

  task_reject({ id, args, metadata }) {
    const params = { arguments: args };
    if (!params.arguments?.id) {
      return createError(id, -32602, "task_reject requires arguments.id");
    }
    if (!params.arguments?.reviewedBy) {
      return createError(id, -32602, "task_reject requires arguments.reviewedBy");
    }

    const task = rejectTaskLifecycle({
      id: params.arguments.id,
      reviewedBy: params.arguments.reviewedBy,
      nextQueueStatus: params.arguments.nextQueueStatus,
      notes: params.arguments.notes,
      reviewEvidence: params.arguments.reviewEvidence
    });

    if (!task) {
      return createError(id, -32602, `Unknown task id: ${params.arguments.id}`);
    }
    if (task.error) {
      return createError(id, -32602, task.error);
    }

    return createSuccess(id, createTextPayload({ rejected: task }));
  },

  task_release({ id, args, metadata }) {
    const params = { arguments: args };
    if (!params.arguments?.id) {
      return createError(id, -32602, "task_release requires arguments.id");
    }

    const task = releaseTaskLifecycle({
      id: params.arguments.id,
      claimedBy: params.arguments.claimedBy
    });

    if (!task) {
      return createError(id, -32602, `Unknown task id: ${params.arguments.id}`);
    }
    if (task.error) {
      return createError(id, -32602, task.error);
    }

    return createSuccess(id, createTextPayload({ released: task }));
  }
};

function handleTaskTransitionMcpTool(id, name, args = {}, metadata) {
  const handler = TASK_TRANSITION_MCP_TOOL_HANDLERS[name];
  return handler ? handler({ id, args, metadata }) : null;
}

export { TASK_TRANSITION_MCP_TOOL_HANDLERS, handleTaskTransitionMcpTool };
