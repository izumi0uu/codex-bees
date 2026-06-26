import {
  addTaskLifecycle,
  annotateTaskMutation,
  archiveTaskMutation,
  reopenTaskMutation,
  restoreTaskMutation,
  updateTaskMutation,
  validateTask
} from "../../state-runtime.js";
import { createNamedTextPayload, createSuccess } from "./runtime-response.js";
import {
  createMcpResultError,
  createUnknownEntityError,
  requireArgument,
  requireArguments
} from "./runtime-tool-helpers.js";

const TASK_MAINTENANCE_MCP_TOOL_HANDLERS = {
  task_add({ id, args, metadata }) {
    const params = { arguments: args };
    const titleRequired = requireArgument(id, "task_add", params.arguments, "title");
    if (titleRequired) return titleRequired;

    const task = addTaskLifecycle({
      title: params.arguments.title,
      status: params.arguments.status,
      owner: params.arguments.owner,
      verifier: params.arguments.verifier,
      objective: params.arguments.objective,
      lane: params.arguments.lane,
      lanePurpose: params.arguments.lanePurpose,
      swarmId: params.arguments.swarmId,
      scope: params.arguments.scope,
      dependsOn: params.arguments.dependsOn,
      acceptance: params.arguments.acceptance,
      verification: params.arguments.verification,
      notes: params.arguments.notes
    });

    return createSuccess(id, createNamedTextPayload("created", task));
  },

  task_annotate({ id, args, metadata }) {
    const params = { arguments: args };
    const annotateRequired = requireArguments(id, "task_annotate", params.arguments, ["id", "content"]);
    if (annotateRequired) return annotateRequired;

    const annotated = annotateTaskMutation({
      id: params.arguments.id,
      actor: params.arguments.actor,
      kind: params.arguments.kind,
      content: params.arguments.content
    });
    if (!annotated) {
      return createUnknownEntityError(id, "task", params.arguments.id);
    }
    if (annotated.error) {
      return createMcpResultError(id, annotated);
    }

    return createSuccess(id, createNamedTextPayload("annotated", annotated));
  },

  task_update({ id, args, metadata }) {
    const params = { arguments: args };
    const idRequired = requireArgument(id, "task_update", params.arguments, "id");
    if (idRequired) return idRequired;

    const task = updateTaskMutation({
      id: params.arguments.id,
      title: params.arguments.title,
      status: params.arguments.status,
      owner: params.arguments.owner,
      verifier: params.arguments.verifier,
      objective: params.arguments.objective,
      lane: params.arguments.lane,
      lanePurpose: params.arguments.lanePurpose,
      swarmId: params.arguments.swarmId,
      scope: params.arguments.scope,
      dependsOn: params.arguments.dependsOn,
      acceptance: params.arguments.acceptance,
      verification: params.arguments.verification,
      notes: params.arguments.notes
    });

    if (!task) {
      return createUnknownEntityError(id, "task", params.arguments.id);
    }
    if (task.error) {
      return createMcpResultError(id, task);
    }

    return createSuccess(id, createNamedTextPayload("updated", task));
  },

  task_check({ id, args, metadata }) {
    const params = { arguments: args };
    const idRequired = requireArgument(id, "task_check", params.arguments, "id");
    if (idRequired) return idRequired;

    const validation = validateTask(params.arguments.id);
    if (!validation) {
      return createUnknownEntityError(id, "task", params.arguments.id);
    }

    return createSuccess(id, createNamedTextPayload("validation", validation));
  },

  task_archive({ id, args, metadata }) {
    const params = { arguments: args };
    const idRequired = requireArgument(id, "task_archive", params.arguments, "id");
    if (idRequired) return idRequired;

    const archived = archiveTaskMutation({
      id: params.arguments.id,
      archivedBy: params.arguments.archivedBy,
      notes: params.arguments.notes
    });

    if (!archived) {
      return createUnknownEntityError(id, "task", params.arguments.id);
    }
    if (archived.error) {
      return createMcpResultError(id, archived);
    }

    return createSuccess(id, createNamedTextPayload("archived", archived));
  },

  task_restore({ id, args, metadata }) {
    const params = { arguments: args };
    const idRequired = requireArgument(id, "task_restore", params.arguments, "id");
    if (idRequired) return idRequired;

    const restored = restoreTaskMutation({
      id: params.arguments.id,
      restoredBy: params.arguments.restoredBy,
      notes: params.arguments.notes
    });

    if (!restored) {
      return createUnknownEntityError(id, "task", params.arguments.id, { archived: true });
    }
    if (restored.error) {
      return createMcpResultError(id, restored);
    }

    return createSuccess(id, createNamedTextPayload("restored", restored));
  },

  task_reopen({ id, args, metadata }) {
    const params = { arguments: args };
    const idRequired = requireArgument(id, "task_reopen", params.arguments, "id");
    if (idRequired) return idRequired;

    const reopened = reopenTaskMutation({
      id: params.arguments.id,
      reopenedBy: params.arguments.reopenedBy,
      notes: params.arguments.notes
    });

    if (!reopened) {
      return createUnknownEntityError(id, "task", params.arguments.id);
    }
    if (reopened.error) {
      return createMcpResultError(id, reopened);
    }

    return createSuccess(id, createNamedTextPayload("reopened", reopened));
  }
};

function handleTaskMaintenanceMcpTool(id, name, args = {}, metadata) {
  const handler = TASK_MAINTENANCE_MCP_TOOL_HANDLERS[name];
  return handler ? handler({ id, args, metadata }) : null;
}

export { TASK_MAINTENANCE_MCP_TOOL_HANDLERS, handleTaskMaintenanceMcpTool };
