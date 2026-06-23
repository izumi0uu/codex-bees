import {
  runtimeActivity,
  runtimeAlerts,
  runtimeCloseout,
  runtimeDashboard,
  runtimeDispatch,
  runtimeFocus,
  runtimeHandoffs,
  runtimeRecovery,
  runtimeReview,
  runtimeRoles
} from "./state-runtime.js";
import { createSuccess, createTextPayload } from "./state-mcp-runtime-response.js";

const RUNTIME_OVERVIEW_MCP_TOOL_HANDLERS = {
  runtime_activity({ id, args, metadata }) {
    const params = { arguments: args };
    return createSuccess(
      id,
      createTextPayload({ activity: runtimeActivity({ limit: params.arguments?.limit }) })
    );
  },

  runtime_closeout({ id, args, metadata }) {
    return createSuccess(id, createTextPayload({ closeout: runtimeCloseout() }));
  },

  runtime_handoffs({ id, args, metadata }) {
    return createSuccess(id, createTextPayload({ handoffs: runtimeHandoffs() }));
  },

  runtime_recovery({ id, args, metadata }) {
    return createSuccess(id, createTextPayload({ recovery: runtimeRecovery() }));
  },

  runtime_dashboard({ id, args, metadata }) {
    return createSuccess(id, createTextPayload({ dashboard: runtimeDashboard() }));
  },

  runtime_dispatch({ id, args, metadata }) {
    return createSuccess(id, createTextPayload({ dispatch: runtimeDispatch() }));
  },

  runtime_focus({ id, args, metadata }) {
    return createSuccess(id, createTextPayload({ focus: runtimeFocus() }));
  },

  runtime_review({ id, args, metadata }) {
    return createSuccess(id, createTextPayload({ review: runtimeReview() }));
  },

  runtime_alerts({ id, args, metadata }) {
    return createSuccess(id, createTextPayload({ alerts: runtimeAlerts() }));
  },

  runtime_roles({ id, args, metadata }) {
    const params = { arguments: args };
    return createSuccess(
      id,
      createTextPayload({ roles: runtimeRoles({ limit: params.arguments?.limit }) })
    );
  }
};

function handleRuntimeOverviewMcpTool(id, name, args = {}, metadata) {
  const handler = RUNTIME_OVERVIEW_MCP_TOOL_HANDLERS[name];
  return handler ? handler({ id, args, metadata }) : null;
}

export { RUNTIME_OVERVIEW_MCP_TOOL_HANDLERS, handleRuntimeOverviewMcpTool };
