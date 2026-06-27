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
} from "../../state-runtime.js";
import {
  buildRuntimeDispatchRankingView,
  buildRuntimeFocusCandidatesView
} from "../runtime/ranking/views.js";
import { createNamedTextPayload, createSuccess } from "./runtime-response.js";

const RUNTIME_OVERVIEW_MCP_TOOL_HANDLERS = {
  runtime_activity({ id, args, metadata }) {
    const params = { arguments: args };
    return createSuccess(
      id,
      createNamedTextPayload("activity", runtimeActivity({ limit: params.arguments?.limit }))
    );
  },

  runtime_closeout({ id, args, metadata }) {
    return createSuccess(id, createNamedTextPayload("closeout", runtimeCloseout()));
  },

  runtime_handoffs({ id, args, metadata }) {
    return createSuccess(id, createNamedTextPayload("handoffs", runtimeHandoffs()));
  },

  runtime_recovery({ id, args, metadata }) {
    return createSuccess(id, createNamedTextPayload("recovery", runtimeRecovery()));
  },

  runtime_dashboard({ id, args, metadata }) {
    return createSuccess(id, createNamedTextPayload("dashboard", runtimeDashboard()));
  },

  runtime_dispatch({ id, args, metadata }) {
    return createSuccess(id, createNamedTextPayload("dispatch", runtimeDispatch()));
  },

  runtime_dispatch_ranking({ id, args, metadata }) {
    return createSuccess(
      id,
      createNamedTextPayload("dispatchRanking", buildRuntimeDispatchRankingView(runtimeDispatch()))
    );
  },

  runtime_focus({ id, args, metadata }) {
    return createSuccess(id, createNamedTextPayload("focus", runtimeFocus()));
  },

  runtime_focus_candidates({ id, args, metadata }) {
    return createSuccess(
      id,
      createNamedTextPayload("focusCandidates", buildRuntimeFocusCandidatesView(runtimeFocus()))
    );
  },

  runtime_review({ id, args, metadata }) {
    return createSuccess(id, createNamedTextPayload("review", runtimeReview()));
  },

  runtime_alerts({ id, args, metadata }) {
    return createSuccess(id, createNamedTextPayload("alerts", runtimeAlerts()));
  },

  runtime_roles({ id, args, metadata }) {
    const params = { arguments: args };
    return createSuccess(
      id,
      createNamedTextPayload("roles", runtimeRoles({ limit: params.arguments?.limit }))
    );
  }
};

function handleRuntimeOverviewMcpTool(id, name, args = {}, metadata) {
  const handler = RUNTIME_OVERVIEW_MCP_TOOL_HANDLERS[name];
  return handler ? handler({ id, args, metadata }) : null;
}

export { RUNTIME_OVERVIEW_MCP_TOOL_HANDLERS, handleRuntimeOverviewMcpTool };
