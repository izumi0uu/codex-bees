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
} from "./state-runtime.js";
import { createNamedTextPayload, createSuccess, createTextPayload } from "./state-mcp-runtime-response.js";
import { createUnknownEntityError, requireArgument } from "./state-mcp-runtime-tool-helpers.js";

const MEMORY_MCP_TOOL_HANDLERS = {
  memory_store({ id, args, metadata }) {
    const params = { arguments: args };
    const contentRequired = requireArgument(id, "memory_store", params.arguments, "content");
    if (contentRequired) return contentRequired;
    
    const memory = storeMemoryMutation({
      content: params.arguments.content,
      namespace: params.arguments.namespace,
      kind: params.arguments.kind,
      title: params.arguments.title,
      agent: params.arguments.agent,
      tags: params.arguments.tags,
      notes: params.arguments.notes
    });
    
    return createSuccess(id, createNamedTextPayload("stored", memory));
  },

  memory_get({ id, args, metadata }) {
    const params = { arguments: args };
    const idRequired = requireArgument(id, "memory_get", params.arguments, "id");
    if (idRequired) return idRequired;
    
    const memory = getMemoryView(params.arguments.id);
    if (!memory) {
      return createUnknownEntityError(id, "memory", params.arguments.id);
    }
    
    return createSuccess(id, createNamedTextPayload("memory", memory));
  },

  memory_list({ id, args, metadata }) {
    const params = { arguments: args };
    const memories = listMemoriesView({
      namespace: params.arguments?.namespace,
      kind: params.arguments?.kind,
      agent: params.arguments?.agent,
      tags: params.arguments?.tags
    });
    
    return createSuccess(id, createNamedTextPayload("memories", memories));
  },

  memory_search({ id, args, metadata }) {
    const params = { arguments: args };
    const queryRequired = requireArgument(id, "memory_search", params.arguments, "query");
    if (queryRequired) return queryRequired;
    
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
