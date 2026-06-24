import {
  approveTaskLifecycle,
  blockTaskLifecycle,
  claimTaskLifecycle,
  completeTaskLifecycle,
  markTaskReadyForReviewLifecycle,
  rejectTaskLifecycle,
  releaseTaskLifecycle
} from "./state-runtime.js";
import { createNamedTextPayload, createSuccess } from "./state-mcp-runtime-response.js";
import {
  createMcpResultError,
  createUnknownEntityError,
  requireArgument,
  requireArguments
} from "./state-mcp-runtime-tool-helpers.js";

export const TASK_TRANSITION_LIFECYCLE_MCP_TOOL_HANDLERS = {
  task_claim({ id, args, metadata }) {
    const params = { arguments: args };
    const claimRequired = requireArguments(id, "task_claim", params.arguments, ["id", "claimedBy"]);
    if (claimRequired) return claimRequired;

    const task = claimTaskLifecycle({
      id: params.arguments.id,
      claimedBy: params.arguments.claimedBy
    });

    if (!task) {
      return createUnknownEntityError(id, "task", params.arguments.id);
    }
    if (task.error) {
      return createMcpResultError(id, task);
    }

    return createSuccess(id, createNamedTextPayload("claimed", task));
  },

  task_block({ id, args, metadata }) {
    const params = { arguments: args };
    const idRequired = requireArgument(id, "task_block", params.arguments, "id");
    if (idRequired) return idRequired;

    const task = blockTaskLifecycle({
      id: params.arguments.id,
      claimedBy: params.arguments.claimedBy,
      notes: params.arguments.notes
    });

    if (!task) {
      return createUnknownEntityError(id, "task", params.arguments.id);
    }
    if (task.error) {
      return createMcpResultError(id, task);
    }

    return createSuccess(id, createNamedTextPayload("blocked", task));
  },

  task_ready_for_review({ id, args, metadata }) {
    const params = { arguments: args };
    const idRequired = requireArgument(id, "task_ready_for_review", params.arguments, "id");
    if (idRequired) return idRequired;

    const task = markTaskReadyForReviewLifecycle({
      id: params.arguments.id,
      claimedBy: params.arguments.claimedBy,
      notes: params.arguments.notes
    });

    if (!task) {
      return createUnknownEntityError(id, "task", params.arguments.id);
    }
    if (task.error) {
      return createMcpResultError(id, task);
    }

    return createSuccess(id, createNamedTextPayload("readyForReview", task));
  },

  task_done({ id, args, metadata }) {
    const params = { arguments: args };
    const idRequired = requireArgument(id, "task_done", params.arguments, "id");
    if (idRequired) return idRequired;

    const task = completeTaskLifecycle({
      id: params.arguments.id,
      reviewedBy: params.arguments.reviewedBy ?? params.arguments.claimedBy,
      notes: params.arguments.notes,
      reviewEvidence: params.arguments.reviewEvidence
    });

    if (!task) {
      return createUnknownEntityError(id, "task", params.arguments.id);
    }
    if (task.error) {
      return createMcpResultError(id, task);
    }

    return createSuccess(id, createNamedTextPayload("completed", task));
  },

  task_approve({ id, args, metadata }) {
    const params = { arguments: args };
    const approveRequired = requireArguments(id, "task_approve", params.arguments, ["id", "reviewedBy"]);
    if (approveRequired) return approveRequired;

    const task = approveTaskLifecycle({
      id: params.arguments.id,
      reviewedBy: params.arguments.reviewedBy,
      notes: params.arguments.notes,
      reviewEvidence: params.arguments.reviewEvidence
    });

    if (!task) {
      return createUnknownEntityError(id, "task", params.arguments.id);
    }
    if (task.error) {
      return createMcpResultError(id, task);
    }

    return createSuccess(id, createNamedTextPayload("approved", task));
  },

  task_reject({ id, args, metadata }) {
    const params = { arguments: args };
    const rejectRequired = requireArguments(id, "task_reject", params.arguments, ["id", "reviewedBy"]);
    if (rejectRequired) return rejectRequired;

    const task = rejectTaskLifecycle({
      id: params.arguments.id,
      reviewedBy: params.arguments.reviewedBy,
      nextQueueStatus: params.arguments.nextQueueStatus,
      notes: params.arguments.notes,
      reviewEvidence: params.arguments.reviewEvidence
    });

    if (!task) {
      return createUnknownEntityError(id, "task", params.arguments.id);
    }
    if (task.error) {
      return createMcpResultError(id, task);
    }

    return createSuccess(id, createNamedTextPayload("rejected", task));
  },

  task_release({ id, args, metadata }) {
    const params = { arguments: args };
    const idRequired = requireArgument(id, "task_release", params.arguments, "id");
    if (idRequired) return idRequired;

    const task = releaseTaskLifecycle({
      id: params.arguments.id,
      claimedBy: params.arguments.claimedBy
    });

    if (!task) {
      return createUnknownEntityError(id, "task", params.arguments.id);
    }
    if (task.error) {
      return createMcpResultError(id, task);
    }

    return createSuccess(id, createNamedTextPayload("released", task));
  }
};
