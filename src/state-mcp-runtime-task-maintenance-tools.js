import {
  addTaskLifecycle,
  annotateTaskMutation,
  archiveTaskMutation,
  reopenTaskMutation,
  restoreTaskMutation,
  updateTaskMutation,
  validateTask
} from "./state-runtime.js";
import { createError, createSuccess, createTextPayload } from "./state-mcp-runtime-response.js";

const TASK_MAINTENANCE_MCP_TOOL_HANDLERS = {
  task_add({ id, args, metadata }) {
    const params = { arguments: args };
    if (!params.arguments?.title) {
      return createError(id, -32602, "task_add requires arguments.title");
    }

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

    return createSuccess(id, createTextPayload({ created: task }));
  },

  task_annotate({ id, args, metadata }) {
    const params = { arguments: args };
    if (!params.arguments?.id) {
      return createError(id, -32602, "task_annotate requires arguments.id");
    }
    if (!params.arguments?.content) {
      return createError(id, -32602, "task_annotate requires arguments.content");
    }

    const annotated = annotateTaskMutation({
      id: params.arguments.id,
      actor: params.arguments.actor,
      kind: params.arguments.kind,
      content: params.arguments.content
    });
    if (!annotated) {
      return createError(id, -32602, `Unknown task id: ${params.arguments.id}`);
    }
    if (annotated.error) {
      return createError(id, -32602, annotated.error);
    }

    return createSuccess(id, createTextPayload({ annotated }));
  },

  task_update({ id, args, metadata }) {
    const params = { arguments: args };
    if (!params.arguments?.id) {
      return createError(id, -32602, "task_update requires arguments.id");
    }

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
      return createError(id, -32602, `Unknown task id: ${params.arguments.id}`);
    }
    if (task.error) {
      return createError(id, -32602, task.error);
    }

    return createSuccess(id, createTextPayload({ updated: task }));
  },

  task_check({ id, args, metadata }) {
    const params = { arguments: args };
    if (!params.arguments?.id) {
      return createError(id, -32602, "task_check requires arguments.id");
    }

    const validation = validateTask(params.arguments.id);
    if (!validation) {
      return createError(id, -32602, `Unknown task id: ${params.arguments.id}`);
    }

    return createSuccess(id, createTextPayload({ validation }));
  },

  task_archive({ id, args, metadata }) {
    const params = { arguments: args };
    if (!params.arguments?.id) {
      return createError(id, -32602, "task_archive requires arguments.id");
    }

    const archived = archiveTaskMutation({
      id: params.arguments.id,
      archivedBy: params.arguments.archivedBy,
      notes: params.arguments.notes
    });

    if (!archived) {
      return createError(id, -32602, `Unknown task id: ${params.arguments.id}`);
    }
    if (archived.error) {
      return createError(id, -32602, archived.error);
    }

    return createSuccess(id, createTextPayload({ archived }));
  },

  task_restore({ id, args, metadata }) {
    const params = { arguments: args };
    if (!params.arguments?.id) {
      return createError(id, -32602, "task_restore requires arguments.id");
    }

    const restored = restoreTaskMutation({
      id: params.arguments.id,
      restoredBy: params.arguments.restoredBy,
      notes: params.arguments.notes
    });

    if (!restored) {
      return createError(id, -32602, `Unknown archived task id: ${params.arguments.id}`);
    }
    if (restored.error) {
      return createError(id, -32602, restored.error);
    }

    return createSuccess(id, createTextPayload({ restored }));
  },

  task_reopen({ id, args, metadata }) {
    const params = { arguments: args };
    if (!params.arguments?.id) {
      return createError(id, -32602, "task_reopen requires arguments.id");
    }

    const reopened = reopenTaskMutation({
      id: params.arguments.id,
      reopenedBy: params.arguments.reopenedBy,
      notes: params.arguments.notes
    });

    if (!reopened) {
      return createError(id, -32602, `Unknown task id: ${params.arguments.id}`);
    }
    if (reopened.error) {
      return createError(id, -32602, reopened.error);
    }

    return createSuccess(id, createTextPayload({ reopened }));
  }
};

function handleTaskMaintenanceMcpTool(id, name, args = {}, metadata) {
  const handler = TASK_MAINTENANCE_MCP_TOOL_HANDLERS[name];
  return handler ? handler({ id, args, metadata }) : null;
}

export { TASK_MAINTENANCE_MCP_TOOL_HANDLERS, handleTaskMaintenanceMcpTool };
