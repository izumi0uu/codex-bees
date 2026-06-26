import {
  archiveSwarmMutation,
  initSwarmMutation,
  reopenSwarmMutation,
  restoreSwarmMutation,
  updateSwarmMutation
} from "../../state-runtime.js";
import { createNamedTextPayload, createSuccess } from "./runtime-response.js";
import {
  createMcpResultError,
  createUnknownEntityError,
  requireArgument
} from "./runtime-tool-helpers.js";

export const SWARM_LIFECYCLE_CONTRACT_MCP_TOOL_HANDLERS = {
  swarm_init({ id, args }) {
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

  swarm_archive({ id, args }) {
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

  swarm_restore({ id, args }) {
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

  swarm_reopen({ id, args }) {
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

  swarm_update({ id, args }) {
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
  }
};
