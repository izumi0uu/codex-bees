import {
  activateSwarm,
  blockSwarm,
  cancelSwarm,
  completeSwarm,
  dispatchSwarmLane,
  queueSwarmTasks,
  syncSwarmStatus
} from "./state-runtime.js";
import { createNamedTextPayload, createSuccess, createTextPayload } from "./state-mcp-runtime-response.js";
import {
  createMcpResultError,
  createUnknownEntityError,
  requireArgument,
  requireArguments
} from "./state-mcp-runtime-tool-helpers.js";

export const SWARM_LIFECYCLE_EXECUTION_MCP_TOOL_HANDLERS = {
  swarm_dispatch({ id, args }) {
    const params = { arguments: args };
    const dispatchRequired = requireArguments(id, "swarm_dispatch", params.arguments, ["id", "claimedBy"]);
    if (dispatchRequired) return dispatchRequired;

    const result = dispatchSwarmLane({
      id: params.arguments.id,
      claimedBy: params.arguments.claimedBy,
      owner: params.arguments.owner
    });
    if (!result) {
      return createUnknownEntityError(id, "swarm", params.arguments.id);
    }
    if (result.error) {
      return createMcpResultError(id, result);
    }

    return createSuccess(id, createNamedTextPayload("dispatched", result));
  },

  swarm_sync({ id, args }) {
    const params = { arguments: args };
    const idRequired = requireArgument(id, "swarm_sync", params.arguments, "id");
    if (idRequired) return idRequired;

    const result = syncSwarmStatus(params.arguments.id);
    if (!result) {
      return createUnknownEntityError(id, "swarm", params.arguments.id);
    }

    return createSuccess(id, createNamedTextPayload("synced", result));
  },

  swarm_activate({ id, args }) {
    const params = { arguments: args };
    const idRequired = requireArgument(id, "swarm_activate", params.arguments, "id");
    if (idRequired) return idRequired;

    const swarm = activateSwarm({
      id: params.arguments.id,
      owner: params.arguments.owner,
      notes: params.arguments.notes
    });

    if (!swarm) {
      return createUnknownEntityError(id, "swarm", params.arguments.id);
    }
    if (swarm.error) {
      return createMcpResultError(id, swarm);
    }

    return createSuccess(id, createNamedTextPayload("activated", swarm));
  },

  swarm_block({ id, args }) {
    const params = { arguments: args };
    const idRequired = requireArgument(id, "swarm_block", params.arguments, "id");
    if (idRequired) return idRequired;

    const swarm = blockSwarm({
      id: params.arguments.id,
      owner: params.arguments.owner,
      notes: params.arguments.notes
    });

    if (!swarm) {
      return createUnknownEntityError(id, "swarm", params.arguments.id);
    }
    if (swarm.error) {
      return createMcpResultError(id, swarm);
    }

    return createSuccess(id, createNamedTextPayload("blocked", swarm));
  },

  swarm_done({ id, args }) {
    const params = { arguments: args };
    const idRequired = requireArgument(id, "swarm_done", params.arguments, "id");
    if (idRequired) return idRequired;

    const swarm = completeSwarm({
      id: params.arguments.id,
      owner: params.arguments.owner,
      notes: params.arguments.notes
    });

    if (!swarm) {
      return createUnknownEntityError(id, "swarm", params.arguments.id);
    }
    if (swarm.error) {
      return createMcpResultError(id, swarm);
    }

    return createSuccess(id, createNamedTextPayload("completed", swarm));
  },

  swarm_cancel({ id, args }) {
    const params = { arguments: args };
    const idRequired = requireArgument(id, "swarm_cancel", params.arguments, "id");
    if (idRequired) return idRequired;

    const swarm = cancelSwarm({
      id: params.arguments.id,
      owner: params.arguments.owner,
      notes: params.arguments.notes
    });

    if (!swarm) {
      return createUnknownEntityError(id, "swarm", params.arguments.id);
    }
    if (swarm.error) {
      return createMcpResultError(id, swarm);
    }

    return createSuccess(id, createNamedTextPayload("cancelled", swarm));
  },

  swarm_queue_tasks({ id, args }) {
    const params = { arguments: args };
    const idRequired = requireArgument(id, "swarm_queue_tasks", params.arguments, "id");
    if (idRequired) return idRequired;

    const result = queueSwarmTasks({ id: params.arguments.id });
    if (!result) {
      return createUnknownEntityError(id, "swarm", params.arguments.id);
    }
    if (result.error) {
      return createMcpResultError(id, result);
    }

    return createSuccess(id, createTextPayload(result));
  }
};
