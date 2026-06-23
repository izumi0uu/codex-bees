import { getPlannerProfileView, getPlannerProfilesView, planSwarm, planTask, queueSwarmFromPlan, queueTasksFromPlan } from "./planner.js";
import {
  activateSwarm,
  addTasks,
  blockSwarm,
  cancelSwarm,
  completeSwarm,
  dispatchSwarmLane,
  getMemoryView,
  getSwarmView,
  initSwarm,
  initSwarmMutation,
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
} from "./state-runtime.js";
import { createError, createNamedTextPayload, createSuccess, createTextPayload } from "./state-mcp-runtime-response.js";

const PLAN_MCP_TOOL_HANDLERS = {
  planner_profiles({ id, args, metadata }) {
    const params = { arguments: args };
    return createSuccess(
      id,
      createNamedTextPayload("profiles", getPlannerProfilesView({ profileFile: params.arguments?.profileFile }))
    );
  },

  planner_profile({ id, args, metadata }) {
    const params = { arguments: args };
    if (!params.arguments?.profile) {
      return createError(id, -32602, "planner_profile requires arguments.profile");
    }

    return createSuccess(
      id,
      createNamedTextPayload("profile", getPlannerProfileView(params.arguments.profile, { profileFile: params.arguments?.profileFile }))
    );
  },

  plan_task({ id, args, metadata }) {
    const params = { arguments: args };
    if (!params.arguments?.task) {
      return createError(id, -32602, "plan_task requires arguments.task");
    }
    
    return createSuccess(
      id,
      createTextPayload(
        planTask(params.arguments.task, {
          profileId: params.arguments.profile,
          profileFile: params.arguments.profileFile
        })
      )
    );
  },

  queue_plan({ id, args, metadata }) {
    const params = { arguments: args };
    if (!params.arguments?.task) {
      return createError(id, -32602, "queue_plan requires arguments.task");
    }
    
    return createSuccess(
      id,
      createTextPayload(
        queueTasksFromPlan(params.arguments.task, addTasks, {
          profileId: params.arguments.profile,
          profileFile: params.arguments.profileFile
        })
      )
    );
  },

  plan_swarm({ id, args, metadata }) {
    const params = { arguments: args };
    if (!params.arguments?.task) {
      return createError(id, -32602, "plan_swarm requires arguments.task");
    }
    
    return createSuccess(
      id,
      createTextPayload(
        planSwarm(params.arguments.task, {
          profileId: params.arguments.profile,
          profileFile: params.arguments.profileFile
        })
      )
    );
  },

  queue_plan_swarm({ id, args, metadata }) {
    const params = { arguments: args };
    if (!params.arguments?.task) {
      return createError(id, -32602, "queue_plan_swarm requires arguments.task");
    }
    
    const queued = queueSwarmFromPlan(params.arguments.task, {
      initSwarm,
      queueSwarmTasks
    }, {
      profileId: params.arguments.profile,
      profileFile: params.arguments.profileFile
    });
    if (!queued) {
      return createError(id, -32602, `Unable to queue planned swarm for task: ${params.arguments.task}`);
    }
    if (queued.error) {
      return createError(id, -32602, queued.error);
    }
    
    return createSuccess(id, createTextPayload(queued));
  }
};

function handlePlanMcpTool(id, name, args = {}, metadata) {
  const handler = PLAN_MCP_TOOL_HANDLERS[name];
  return handler ? handler({ id, args, metadata }) : null;
}

export { PLAN_MCP_TOOL_HANDLERS, handlePlanMcpTool };
