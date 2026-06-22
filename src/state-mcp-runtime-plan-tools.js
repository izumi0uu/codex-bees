import { planSwarm, planTask, queueTasksFromPlan } from "./planner.js";
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
} from "./state.js";
import { createError, createSuccess, createTextPayload } from "./state-mcp-runtime-response.js";

const PLAN_MCP_TOOL_HANDLERS = {
  plan_task({ id, args, metadata }) {
    const params = { arguments: args };
    if (!params.arguments?.task) {
      return createError(id, -32602, "plan_task requires arguments.task");
    }
    
    return createSuccess(id, createTextPayload(planTask(params.arguments.task)));
  },

  queue_plan({ id, args, metadata }) {
    const params = { arguments: args };
    if (!params.arguments?.task) {
      return createError(id, -32602, "queue_plan requires arguments.task");
    }
    
    return createSuccess(
      id,
      createTextPayload(queueTasksFromPlan(params.arguments.task, addTasks))
    );
  },

  plan_swarm({ id, args, metadata }) {
    const params = { arguments: args };
    if (!params.arguments?.task) {
      return createError(id, -32602, "plan_swarm requires arguments.task");
    }
    
    return createSuccess(id, createTextPayload(planSwarm(params.arguments.task)));
  },

  queue_plan_swarm({ id, args, metadata }) {
    const params = { arguments: args };
    if (!params.arguments?.task) {
      return createError(id, -32602, "queue_plan_swarm requires arguments.task");
    }
    
    const planned = planSwarm(params.arguments.task);
    const swarm = initSwarm(planned.swarm);
    const queued = queueSwarmTasks({ id: swarm.id });
    if (!queued) {
      return createError(id, -32602, `Unknown swarm id: ${swarm.id}`);
    }
    if (queued.error) {
      return createError(id, -32602, queued.error);
    }
    
    return createSuccess(
      id,
      createTextPayload({
        kind: "queued_plan_swarm",
        recommendedReason: queued.created.length > 1 ? "multiple_swarm_lane_tasks_queued" : "single_swarm_lane_task_queued",
        objective: params.arguments.task,
        evidence: planned.evidence,
        swarm: queued.swarm,
        created: queued.created
      })
    );
  }
};

function handlePlanMcpTool(id, name, args = {}, metadata) {
  const handler = PLAN_MCP_TOOL_HANDLERS[name];
  return handler ? handler({ id, args, metadata }) : null;
}

export { PLAN_MCP_TOOL_HANDLERS, handlePlanMcpTool };
