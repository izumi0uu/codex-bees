import { getPlannerProfileView, getPlannerProfilesView, planSwarm, planTask, queueSwarmFromPlan, queueTasksFromPlan } from "../../planner.js";
import { getPlannerProfileRankingView } from "../../planner/profile/ranking.js";
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
} from "../../state-runtime.js";
import { createNamedTextPayload, createSuccess, createTextPayload } from "./runtime-response.js";
import { createMcpResultError, createMessageError, requireArgument } from "./runtime-tool-helpers.js";

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
    const profileRequired = requireArgument(id, "planner_profile", params.arguments, "profile");
    if (profileRequired) return profileRequired;

    return createSuccess(
      id,
      createNamedTextPayload("profile", getPlannerProfileView(params.arguments.profile, { profileFile: params.arguments?.profileFile }))
    );
  },

  planner_profile_ranking({ id, args, metadata }) {
    const params = { arguments: args };
    const taskRequired = requireArgument(id, "planner_profile_ranking", params.arguments, "task");
    if (taskRequired) return taskRequired;

    return createSuccess(
      id,
      createNamedTextPayload(
        "profileRanking",
        getPlannerProfileRankingView(params.arguments.task, {
          profileId: params.arguments.profile,
          profileFile: params.arguments.profileFile
        })
      )
    );
  },

  plan_task({ id, args, metadata }) {
    const params = { arguments: args };
    const taskRequired = requireArgument(id, "plan_task", params.arguments, "task");
    if (taskRequired) return taskRequired;
    
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
    const taskRequired = requireArgument(id, "queue_plan", params.arguments, "task");
    if (taskRequired) return taskRequired;
    
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
    const taskRequired = requireArgument(id, "plan_swarm", params.arguments, "task");
    if (taskRequired) return taskRequired;
    
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
    const taskRequired = requireArgument(id, "queue_plan_swarm", params.arguments, "task");
    if (taskRequired) return taskRequired;
    
    const queued = queueSwarmFromPlan(params.arguments.task, {
      initSwarm,
      queueSwarmTasks
    }, {
      profileId: params.arguments.profile,
      profileFile: params.arguments.profileFile
    });
    if (!queued) {
      return createMessageError(id, `Unable to queue planned swarm for task: ${params.arguments.task}`);
    }
    if (queued.error) {
      return createMcpResultError(id, queued);
    }
    
    return createSuccess(id, createTextPayload(queued));
  }
};

function handlePlanMcpTool(id, name, args = {}, metadata) {
  const handler = PLAN_MCP_TOOL_HANDLERS[name];
  return handler ? handler({ id, args, metadata }) : null;
}

export { PLAN_MCP_TOOL_HANDLERS, handlePlanMcpTool };
