import {
  getArchivedSwarmView,
  getSwarmView,
  listArchivedSwarmsView,
  listSwarmsView,
  swarmBlockers,
  swarmBrief,
  swarmBundle,
  swarmCloseout,
  swarmDispatchBundle,
  swarmOverview,
  validateSwarm
} from "./state-runtime.js";
import { createError, createSuccess, createTextPayload } from "./state-mcp-runtime-response.js";

const SWARM_QUERY_MCP_TOOL_HANDLERS = {
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
  }
};

function handleSwarmQueryMcpTool(id, name, args = {}, metadata) {
  const handler = SWARM_QUERY_MCP_TOOL_HANDLERS[name];
  return handler ? handler({ id, args, metadata }) : null;
}

export { SWARM_QUERY_MCP_TOOL_HANDLERS, handleSwarmQueryMcpTool };
