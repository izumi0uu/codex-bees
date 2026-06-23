import {
  activateSwarm,
  archiveSwarmMutation,
  blockSwarm,
  cancelSwarm,
  completeSwarm,
  dispatchSwarmLane,
  initSwarmMutation,
  queueSwarmTasks,
  reopenSwarmMutation,
  restoreSwarmMutation,
  syncSwarmStatus,
  updateSwarmMutation
} from "./state-runtime.js";
import { createNamedTextPayload, createSuccess, createTextPayload } from "./state-mcp-runtime-response.js";
import {
  createMcpResultError,
  createUnknownEntityError,
  requireArgument,
  requireArguments
} from "./state-mcp-runtime-tool-helpers.js";

const SWARM_LIFECYCLE_MCP_TOOL_HANDLERS = {
  swarm_init({ id, args, metadata }) {
    const params = { arguments: args };
    const objectiveRequired = requireArgument(id, "swarm_init", params.arguments, "objective");
    if (objectiveRequired) return objectiveRequired;

    const swarm = initSwarmMutation({
      objective: params.arguments.objective,
      topology: params.arguments.topology,
      maxWorkers: params.arguments.maxWorkers,
      owner: params.arguments.owner,
      laneSource: params.arguments.laneSource,
      notes: params.arguments.notes,
      lanes: params.arguments.lanes
    });

    return createSuccess(id, createNamedTextPayload("created", swarm));
  },

  swarm_archive({ id, args, metadata }) {
    const params = { arguments: args };
    const idRequired = requireArgument(id, "swarm_archive", params.arguments, "id");
    if (idRequired) return idRequired;

    const archived = archiveSwarmMutation({
      id: params.arguments.id,
      archivedBy: params.arguments.archivedBy,
      notes: params.arguments.notes
    });

    if (!archived) {
      return createUnknownEntityError(id, "swarm", params.arguments.id);
    }
    if (archived.error) {
      return createMcpResultError(id, archived);
    }

    return createSuccess(id, createNamedTextPayload("archived", archived));
  },

  swarm_restore({ id, args, metadata }) {
    const params = { arguments: args };
    const idRequired = requireArgument(id, "swarm_restore", params.arguments, "id");
    if (idRequired) return idRequired;

    const restored = restoreSwarmMutation({
      id: params.arguments.id,
      restoredBy: params.arguments.restoredBy,
      notes: params.arguments.notes
    });

    if (!restored) {
      return createUnknownEntityError(id, "swarm", params.arguments.id, { archived: true });
    }
    if (restored.error) {
      return createMcpResultError(id, restored);
    }

    return createSuccess(id, createNamedTextPayload("restored", restored));
  },

  swarm_reopen({ id, args, metadata }) {
    const params = { arguments: args };
    const idRequired = requireArgument(id, "swarm_reopen", params.arguments, "id");
    if (idRequired) return idRequired;

    const reopened = reopenSwarmMutation({
      id: params.arguments.id,
      reopenedBy: params.arguments.reopenedBy,
      notes: params.arguments.notes
    });

    if (!reopened) {
      return createUnknownEntityError(id, "swarm", params.arguments.id);
    }
    if (reopened.error) {
      return createMcpResultError(id, reopened);
    }

    return createSuccess(id, createNamedTextPayload("reopened", reopened));
  },

  swarm_update({ id, args, metadata }) {
    const params = { arguments: args };
    const idRequired = requireArgument(id, "swarm_update", params.arguments, "id");
    if (idRequired) return idRequired;

    const swarm = updateSwarmMutation({
      id: params.arguments.id,
      objective: params.arguments.objective,
      topology: params.arguments.topology,
      maxWorkers: params.arguments.maxWorkers,
      owner: params.arguments.owner,
      laneSource: params.arguments.laneSource,
      notes: params.arguments.notes,
      lanes: params.arguments.lanes
    });

    if (!swarm) {
      return createUnknownEntityError(id, "swarm", params.arguments.id);
    }
    if (swarm.error) {
      return createMcpResultError(id, swarm);
    }

    return createSuccess(id, createNamedTextPayload("updated", swarm));
  },

  swarm_dispatch({ id, args, metadata }) {
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

  swarm_sync({ id, args, metadata }) {
    const params = { arguments: args };
    const idRequired = requireArgument(id, "swarm_sync", params.arguments, "id");
    if (idRequired) return idRequired;

    const result = syncSwarmStatus(params.arguments.id);
    if (!result) {
      return createUnknownEntityError(id, "swarm", params.arguments.id);
    }

    return createSuccess(id, createNamedTextPayload("synced", result));
  },

  swarm_activate({ id, args, metadata }) {
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

  swarm_block({ id, args, metadata }) {
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

  swarm_done({ id, args, metadata }) {
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

  swarm_cancel({ id, args, metadata }) {
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

  swarm_queue_tasks({ id, args, metadata }) {
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

function handleSwarmLifecycleMcpTool(id, name, args = {}, metadata) {
  const handler = SWARM_LIFECYCLE_MCP_TOOL_HANDLERS[name];
  return handler ? handler({ id, args, metadata }) : null;
}

export { SWARM_LIFECYCLE_MCP_TOOL_HANDLERS, handleSwarmLifecycleMcpTool };
