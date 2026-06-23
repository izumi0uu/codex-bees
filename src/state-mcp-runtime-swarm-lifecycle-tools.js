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
import { createError, createSuccess, createTextPayload } from "./state-mcp-runtime-response.js";

const SWARM_LIFECYCLE_MCP_TOOL_HANDLERS = {
  swarm_init({ id, args, metadata }) {
    const params = { arguments: args };
    if (!params.arguments?.objective) {
      return createError(id, -32602, "swarm_init requires arguments.objective");
    }

    const swarm = initSwarmMutation({
      objective: params.arguments.objective,
      topology: params.arguments.topology,
      maxWorkers: params.arguments.maxWorkers,
      owner: params.arguments.owner,
      laneSource: params.arguments.laneSource,
      notes: params.arguments.notes,
      lanes: params.arguments.lanes
    });

    return createSuccess(id, createTextPayload({ created: swarm }));
  },

  swarm_archive({ id, args, metadata }) {
    const params = { arguments: args };
    if (!params.arguments?.id) {
      return createError(id, -32602, "swarm_archive requires arguments.id");
    }

    const archived = archiveSwarmMutation({
      id: params.arguments.id,
      archivedBy: params.arguments.archivedBy,
      notes: params.arguments.notes
    });

    if (!archived) {
      return createError(id, -32602, `Unknown swarm id: ${params.arguments.id}`);
    }
    if (archived.error) {
      return createError(id, -32602, archived.error);
    }

    return createSuccess(id, createTextPayload({ archived }));
  },

  swarm_restore({ id, args, metadata }) {
    const params = { arguments: args };
    if (!params.arguments?.id) {
      return createError(id, -32602, "swarm_restore requires arguments.id");
    }

    const restored = restoreSwarmMutation({
      id: params.arguments.id,
      restoredBy: params.arguments.restoredBy,
      notes: params.arguments.notes
    });

    if (!restored) {
      return createError(id, -32602, `Unknown archived swarm id: ${params.arguments.id}`);
    }
    if (restored.error) {
      return createError(id, -32602, restored.error);
    }

    return createSuccess(id, createTextPayload({ restored }));
  },

  swarm_reopen({ id, args, metadata }) {
    const params = { arguments: args };
    if (!params.arguments?.id) {
      return createError(id, -32602, "swarm_reopen requires arguments.id");
    }

    const reopened = reopenSwarmMutation({
      id: params.arguments.id,
      reopenedBy: params.arguments.reopenedBy,
      notes: params.arguments.notes
    });

    if (!reopened) {
      return createError(id, -32602, `Unknown swarm id: ${params.arguments.id}`);
    }
    if (reopened.error) {
      return createError(id, -32602, reopened.error);
    }

    return createSuccess(id, createTextPayload({ reopened }));
  },

  swarm_update({ id, args, metadata }) {
    const params = { arguments: args };
    if (!params.arguments?.id) {
      return createError(id, -32602, "swarm_update requires arguments.id");
    }

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
      return createError(id, -32602, `Unknown swarm id: ${params.arguments.id}`);
    }
    if (swarm.error) {
      return createError(id, -32602, swarm.error);
    }

    return createSuccess(id, createTextPayload({ updated: swarm }));
  },

  swarm_dispatch({ id, args, metadata }) {
    const params = { arguments: args };
    if (!params.arguments?.id) {
      return createError(id, -32602, "swarm_dispatch requires arguments.id");
    }
    if (!params.arguments?.claimedBy) {
      return createError(id, -32602, "swarm_dispatch requires arguments.claimedBy");
    }

    const result = dispatchSwarmLane({
      id: params.arguments.id,
      claimedBy: params.arguments.claimedBy,
      owner: params.arguments.owner
    });
    if (!result) {
      return createError(id, -32602, `Unknown swarm id: ${params.arguments.id}`);
    }
    if (result.error) {
      return createError(id, -32602, result.error);
    }

    return createSuccess(id, createTextPayload({ dispatched: result }));
  },

  swarm_sync({ id, args, metadata }) {
    const params = { arguments: args };
    if (!params.arguments?.id) {
      return createError(id, -32602, "swarm_sync requires arguments.id");
    }

    const result = syncSwarmStatus(params.arguments.id);
    if (!result) {
      return createError(id, -32602, `Unknown swarm id: ${params.arguments.id}`);
    }

    return createSuccess(id, createTextPayload({ synced: result }));
  },

  swarm_activate({ id, args, metadata }) {
    const params = { arguments: args };
    if (!params.arguments?.id) {
      return createError(id, -32602, "swarm_activate requires arguments.id");
    }

    const swarm = activateSwarm({
      id: params.arguments.id,
      owner: params.arguments.owner,
      notes: params.arguments.notes
    });

    if (!swarm) {
      return createError(id, -32602, `Unknown swarm id: ${params.arguments.id}`);
    }
    if (swarm.error) {
      return createError(id, -32602, swarm.error);
    }

    return createSuccess(id, createTextPayload({ activated: swarm }));
  },

  swarm_block({ id, args, metadata }) {
    const params = { arguments: args };
    if (!params.arguments?.id) {
      return createError(id, -32602, "swarm_block requires arguments.id");
    }

    const swarm = blockSwarm({
      id: params.arguments.id,
      owner: params.arguments.owner,
      notes: params.arguments.notes
    });

    if (!swarm) {
      return createError(id, -32602, `Unknown swarm id: ${params.arguments.id}`);
    }
    if (swarm.error) {
      return createError(id, -32602, swarm.error);
    }

    return createSuccess(id, createTextPayload({ blocked: swarm }));
  },

  swarm_done({ id, args, metadata }) {
    const params = { arguments: args };
    if (!params.arguments?.id) {
      return createError(id, -32602, "swarm_done requires arguments.id");
    }

    const swarm = completeSwarm({
      id: params.arguments.id,
      owner: params.arguments.owner,
      notes: params.arguments.notes
    });

    if (!swarm) {
      return createError(id, -32602, `Unknown swarm id: ${params.arguments.id}`);
    }
    if (swarm.error) {
      return createError(id, -32602, swarm.error);
    }

    return createSuccess(id, createTextPayload({ completed: swarm }));
  },

  swarm_cancel({ id, args, metadata }) {
    const params = { arguments: args };
    if (!params.arguments?.id) {
      return createError(id, -32602, "swarm_cancel requires arguments.id");
    }

    const swarm = cancelSwarm({
      id: params.arguments.id,
      owner: params.arguments.owner,
      notes: params.arguments.notes
    });

    if (!swarm) {
      return createError(id, -32602, `Unknown swarm id: ${params.arguments.id}`);
    }
    if (swarm.error) {
      return createError(id, -32602, swarm.error);
    }

    return createSuccess(id, createTextPayload({ cancelled: swarm }));
  },

  swarm_queue_tasks({ id, args, metadata }) {
    const params = { arguments: args };
    if (!params.arguments?.id) {
      return createError(id, -32602, "swarm_queue_tasks requires arguments.id");
    }

    const result = queueSwarmTasks({ id: params.arguments.id });
    if (!result) {
      return createError(id, -32602, `Unknown swarm id: ${params.arguments.id}`);
    }
    if (result.error) {
      return createError(id, -32602, result.error);
    }

    return createSuccess(id, createTextPayload(result));
  }
};

function handleSwarmLifecycleMcpTool(id, name, args = {}, metadata) {
  const handler = SWARM_LIFECYCLE_MCP_TOOL_HANDLERS[name];
  return handler ? handler({ id, args, metadata }) : null;
}

export { SWARM_LIFECYCLE_MCP_TOOL_HANDLERS, handleSwarmLifecycleMcpTool };
