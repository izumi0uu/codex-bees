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
import { createNamedTextPayload, createSuccess } from "./state-mcp-runtime-response.js";
import { createUnknownEntityError, requireArgument } from "./state-mcp-runtime-tool-helpers.js";

const SWARM_QUERY_MCP_TOOL_HANDLERS = {
  swarm_list({ id, args, metadata }) {
    const params = { arguments: args };
    const filters = {
      status: params.arguments?.status,
      topology: params.arguments?.topology,
      owner: params.arguments?.owner
    };
    const swarms = listSwarmsView(filters, { detailed: params.arguments?.detailed === true });

    return createSuccess(id, createNamedTextPayload("swarms", swarms));
  },

  swarm_get({ id, args, metadata }) {
    const params = { arguments: args };
    const idRequired = requireArgument(id, "swarm_get", params.arguments, "id");
    if (idRequired) return idRequired;

    const swarm = getSwarmView(params.arguments.id);
    if (!swarm) {
      return createUnknownEntityError(id, "swarm", params.arguments.id);
    }

    return createSuccess(id, createNamedTextPayload("swarm", swarm));
  },

  swarm_archive_list({ id, args, metadata }) {
    return createSuccess(id, createNamedTextPayload("archivedSwarms", listArchivedSwarmsView()));
  },

  swarm_archive_get({ id, args, metadata }) {
    const params = { arguments: args };
    const idRequired = requireArgument(id, "swarm_archive_get", params.arguments, "id");
    if (idRequired) return idRequired;

    const archivedSwarm = getArchivedSwarmView(params.arguments.id);
    if (!archivedSwarm) {
      return createUnknownEntityError(id, "swarm", params.arguments.id, { archived: true });
    }

    return createSuccess(id, createNamedTextPayload("archivedSwarm", archivedSwarm));
  },

  swarm_bundle({ id, args, metadata }) {
    const params = { arguments: args };
    const idRequired = requireArgument(id, "swarm_bundle", params.arguments, "id");
    if (idRequired) return idRequired;

    const bundle = swarmBundle(params.arguments.id);
    if (!bundle) {
      return createUnknownEntityError(id, "swarm", params.arguments.id);
    }

    return createSuccess(id, createNamedTextPayload("bundle", bundle));
  },

  swarm_blockers({ id, args, metadata }) {
    const params = { arguments: args };
    const idRequired = requireArgument(id, "swarm_blockers", params.arguments, "id");
    if (idRequired) return idRequired;

    const blockers = swarmBlockers(params.arguments.id);
    if (!blockers) {
      return createUnknownEntityError(id, "swarm", params.arguments.id);
    }

    return createSuccess(id, createNamedTextPayload("blockers", blockers));
  },

  swarm_closeout({ id, args, metadata }) {
    const params = { arguments: args };
    const idRequired = requireArgument(id, "swarm_closeout", params.arguments, "id");
    if (idRequired) return idRequired;

    const closeout = swarmCloseout(params.arguments.id);
    if (!closeout) {
      return createUnknownEntityError(id, "swarm", params.arguments.id);
    }

    return createSuccess(id, createNamedTextPayload("closeout", closeout));
  },

  swarm_dispatch_bundle({ id, args, metadata }) {
    const params = { arguments: args };
    const idRequired = requireArgument(id, "swarm_dispatch_bundle", params.arguments, "id");
    if (idRequired) return idRequired;

    const dispatchBundle = swarmDispatchBundle(params.arguments.id);
    if (!dispatchBundle) {
      return createUnknownEntityError(id, "swarm", params.arguments.id);
    }

    return createSuccess(id, createNamedTextPayload("dispatchBundle", dispatchBundle));
  },

  swarm_brief({ id, args, metadata }) {
    const params = { arguments: args };
    const idRequired = requireArgument(id, "swarm_brief", params.arguments, "id");
    if (idRequired) return idRequired;

    const brief = swarmBrief(params.arguments.id);
    if (!brief) {
      return createUnknownEntityError(id, "swarm", params.arguments.id);
    }

    return createSuccess(id, createNamedTextPayload("brief", brief));
  },

  swarm_check({ id, args, metadata }) {
    const params = { arguments: args };
    const idRequired = requireArgument(id, "swarm_check", params.arguments, "id");
    if (idRequired) return idRequired;

    const validation = validateSwarm(params.arguments.id);
    if (!validation) {
      return createUnknownEntityError(id, "swarm", params.arguments.id);
    }

    return createSuccess(id, createNamedTextPayload("validation", validation));
  },

  swarm_overview({ id, args, metadata }) {
    const params = { arguments: args };
    const idRequired = requireArgument(id, "swarm_overview", params.arguments, "id");
    if (idRequired) return idRequired;

    const overview = swarmOverview(params.arguments.id);
    if (!overview) {
      return createUnknownEntityError(id, "swarm", params.arguments.id);
    }

    return createSuccess(id, createNamedTextPayload("overview", overview));
  }
};

function handleSwarmQueryMcpTool(id, name, args = {}, metadata) {
  const handler = SWARM_QUERY_MCP_TOOL_HANDLERS[name];
  return handler ? handler({ id, args, metadata }) : null;
}

export { SWARM_QUERY_MCP_TOOL_HANDLERS, handleSwarmQueryMcpTool };
