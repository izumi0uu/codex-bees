import { planSwarm, planTask, queueTasksFromPlan } from "./planner.js";
import {
  activateSwarm,
  addTasks,
  archiveSwarmMutation,
  blockSwarm,
  cancelSwarm,
  completeSwarm,
  dispatchSwarmLane,
  getArchivedSwarmView,
  getMemoryView,
  getSwarmView,
  initSwarm,
  initSwarmMutation,
  listArchivedSwarmsView,
  listMemoriesView,
  listSwarmsView,
  queueSwarmTasks,
  searchMemoriesView,
  storeMemoryMutation,
  swarmBlockers,
  swarmBrief,
  swarmBundle,
  swarmCloseout,
  swarmDispatchBundle,
  swarmOverview,
  syncSwarmStatus,
  updateSwarmMutation,
  validateSwarm
} from "./state.js";
import { createError, createSuccess, createTextPayload } from "./state-mcp-runtime-response.js";

const SWARM_MCP_TOOL_HANDLERS = {
  swarm_list({ id, args, metadata }) {
    const params = { arguments: args };
    const filters = {
      status: params.arguments?.status,
      topology: params.arguments?.topology,
      owner: params.arguments?.owner
    };
    const swarms = listSwarmsView(filters, { detailed: params.arguments?.detailed === true });
    
    return createSuccess(id, createTextPayload({ swarms }));
  },

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

  swarm_get({ id, args, metadata }) {
    const params = { arguments: args };
    if (!params.arguments?.id) {
      return createError(id, -32602, "swarm_get requires arguments.id");
    }
    
    const swarm = getSwarmView(params.arguments.id);
    if (!swarm) {
      return createError(id, -32602, `Unknown swarm id: ${params.arguments.id}`);
    }
    
    return createSuccess(id, createTextPayload({ swarm }));
  },

  swarm_archive_list({ id, args, metadata }) {
    const params = { arguments: args };
    return createSuccess(id, createTextPayload({ archivedSwarms: listArchivedSwarmsView() }));
  },

  swarm_archive_get({ id, args, metadata }) {
    const params = { arguments: args };
    if (!params.arguments?.id) {
      return createError(id, -32602, "swarm_archive_get requires arguments.id");
    }

    const archivedSwarm = getArchivedSwarmView(params.arguments.id);
    if (!archivedSwarm) {
      return createError(id, -32602, `Unknown archived swarm id: ${params.arguments.id}`);
    }

    return createSuccess(id, createTextPayload({ archivedSwarm }));
  },

  swarm_bundle({ id, args, metadata }) {
    const params = { arguments: args };
    if (!params.arguments?.id) {
      return createError(id, -32602, "swarm_bundle requires arguments.id");
    }
    
    const bundle = swarmBundle(params.arguments.id);
    if (!bundle) {
      return createError(id, -32602, `Unknown swarm id: ${params.arguments.id}`);
    }
    
    return createSuccess(id, createTextPayload({ bundle }));
  },

  swarm_blockers({ id, args, metadata }) {
    const params = { arguments: args };
    if (!params.arguments?.id) {
      return createError(id, -32602, "swarm_blockers requires arguments.id");
    }
    
    const blockers = swarmBlockers(params.arguments.id);
    if (!blockers) {
      return createError(id, -32602, `Unknown swarm id: ${params.arguments.id}`);
    }
    
    return createSuccess(id, createTextPayload({ blockers }));
  },

  swarm_closeout({ id, args, metadata }) {
    const params = { arguments: args };
    if (!params.arguments?.id) {
      return createError(id, -32602, "swarm_closeout requires arguments.id");
    }
    
    const closeout = swarmCloseout(params.arguments.id);
    if (!closeout) {
      return createError(id, -32602, `Unknown swarm id: ${params.arguments.id}`);
    }
    
    return createSuccess(id, createTextPayload({ closeout }));
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

  swarm_dispatch_bundle({ id, args, metadata }) {
    const params = { arguments: args };
    if (!params.arguments?.id) {
      return createError(id, -32602, "swarm_dispatch_bundle requires arguments.id");
    }
    
    const dispatchBundle = swarmDispatchBundle(params.arguments.id);
    if (!dispatchBundle) {
      return createError(id, -32602, `Unknown swarm id: ${params.arguments.id}`);
    }
    
    return createSuccess(id, createTextPayload({ dispatchBundle }));
  },

  swarm_brief({ id, args, metadata }) {
    const params = { arguments: args };
    if (!params.arguments?.id) {
      return createError(id, -32602, "swarm_brief requires arguments.id");
    }
    
    const brief = swarmBrief(params.arguments.id);
    if (!brief) {
      return createError(id, -32602, `Unknown swarm id: ${params.arguments.id}`);
    }
    
    return createSuccess(id, createTextPayload({ brief }));
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

  swarm_check({ id, args, metadata }) {
    const params = { arguments: args };
    if (!params.arguments?.id) {
      return createError(id, -32602, "swarm_check requires arguments.id");
    }
    
    const validation = validateSwarm(params.arguments.id);
    if (!validation) {
      return createError(id, -32602, `Unknown swarm id: ${params.arguments.id}`);
    }
    
    return createSuccess(id, createTextPayload({ validation }));
  },

  swarm_overview({ id, args, metadata }) {
    const params = { arguments: args };
    if (!params.arguments?.id) {
      return createError(id, -32602, "swarm_overview requires arguments.id");
    }
    
    const overview = swarmOverview(params.arguments.id);
    if (!overview) {
      return createError(id, -32602, `Unknown swarm id: ${params.arguments.id}`);
    }
    
    return createSuccess(id, createTextPayload({ overview }));
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

function handleSwarmMcpTool(id, name, args = {}, metadata) {
  const handler = SWARM_MCP_TOOL_HANDLERS[name];
  return handler ? handler({ id, args, metadata }) : null;
}

export { SWARM_MCP_TOOL_HANDLERS, handleSwarmMcpTool };
