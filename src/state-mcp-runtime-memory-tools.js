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

const MEMORY_MCP_TOOL_HANDLERS = {
  memory_store({ id, args, metadata }) {
    const params = { arguments: args };
    if (!params.arguments?.content) {
      return createError(id, -32602, "memory_store requires arguments.content");
    }
    
    const memory = storeMemoryMutation({
      content: params.arguments.content,
      namespace: params.arguments.namespace,
      kind: params.arguments.kind,
      title: params.arguments.title,
      agent: params.arguments.agent,
      tags: params.arguments.tags,
      notes: params.arguments.notes
    });
    
    return createSuccess(id, createTextPayload({ stored: memory }));
  },

  memory_get({ id, args, metadata }) {
    const params = { arguments: args };
    if (!params.arguments?.id) {
      return createError(id, -32602, "memory_get requires arguments.id");
    }
    
    const memory = getMemoryView(params.arguments.id);
    if (!memory) {
      return createError(id, -32602, `Unknown memory id: ${params.arguments.id}`);
    }
    
    return createSuccess(id, createTextPayload({ memory }));
  },

  memory_list({ id, args, metadata }) {
    const params = { arguments: args };
    const memories = listMemoriesView({
      namespace: params.arguments?.namespace,
      kind: params.arguments?.kind,
      agent: params.arguments?.agent,
      tags: params.arguments?.tags
    });
    
    return createSuccess(id, createTextPayload({ memories }));
  },

  memory_search({ id, args, metadata }) {
    const params = { arguments: args };
    if (!params.arguments?.query) {
      return createError(id, -32602, "memory_search requires arguments.query");
    }
    
    const limit =
      Number.isFinite(Number(params.arguments.limit)) && Number(params.arguments.limit) > 0
        ? Number(params.arguments.limit)
        : 10;
    const results = searchMemoriesView(
      params.arguments.query,
      {
        namespace: params.arguments.namespace,
        kind: params.arguments.kind,
        agent: params.arguments.agent,
        tags: params.arguments.tags
      },
      limit
    );
    
    return createSuccess(id, createTextPayload(results));
  }
};

function handleMemoryMcpTool(id, name, args = {}, metadata) {
  const handler = MEMORY_MCP_TOOL_HANDLERS[name];
  return handler ? handler({ id, args, metadata }) : null;
}

export { MEMORY_MCP_TOOL_HANDLERS, handleMemoryMcpTool };
