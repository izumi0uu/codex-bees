import { describeRole } from "./state-task-core.js";
import { normalizeNextMode } from "./state-queue-views.js";
import {
  buildRuntimeAssignmentPackSummary,
  buildRuntimeAssignmentPackView,
  buildRuntimeCloseoutPackSummary,
  buildRuntimeCloseoutPackView,
  buildRuntimeControlPackSummary,
  buildRuntimeControlPackView,
  buildRuntimeDispatchPackSummary,
  buildRuntimeDispatchPackView,
  buildRuntimeExecutionPackSummary,
  buildRuntimeExecutionPackView,
  buildRuntimeHandoffPackSummary,
  buildRuntimeHandoffPackView,
  buildRuntimeLeaderPackSummary,
  buildRuntimeLeaderPackView,
  buildRuntimeOperatorPackSummary,
  buildRuntimeOperatorPackView,
  buildRuntimeOwnerPackSummary,
  buildRuntimeOwnerPackView,
  buildRuntimePickupPackSummary,
  buildRuntimePickupPackView,
  buildRuntimeQueuePackSummary,
  buildRuntimeQueuePackView,
  buildRuntimeRecoveryPackSummary,
  buildRuntimeRecoveryPackView,
  buildRuntimeReviewPackSummary,
  buildRuntimeReviewPackView,
  buildRuntimeRolePackSummary,
  buildRuntimeRolePackView,
  buildRuntimeSessionPackSummary,
  buildRuntimeSessionPackView,
  buildRuntimeSignalPackSummary,
  buildRuntimeSignalPackView,
  buildRuntimeSummaryPackSummary,
  buildRuntimeSummaryPackView,
  buildRuntimeTriagePackSummary,
  buildRuntimeTriagePackView,
  buildRuntimeVerifierPackSummary,
  buildRuntimeVerifierPackView,
  buildRuntimeWorkerPackSummary,
  buildRuntimeWorkerPackView,
  buildRuntimeWorkspacePackSummary,
  buildRuntimeWorkspacePackView,
  deriveRuntimeAssignmentPackReason,
  deriveRuntimeAssignmentPackSurface,
  deriveRuntimeCloseoutPackReason,
  deriveRuntimeCloseoutPackSurface,
  deriveRuntimeControlPackReason,
  deriveRuntimeControlPackSurface,
  deriveRuntimeDispatchPackReason,
  deriveRuntimeDispatchPackSurface,
  deriveRuntimeExecutionPackReason,
  deriveRuntimeExecutionPackSurface,
  deriveRuntimeHandoffPackReason,
  deriveRuntimeHandoffPackSurface,
  deriveRuntimeLeaderPackReason,
  deriveRuntimeLeaderPackSurface,
  deriveRuntimeOperatorPackReason,
  deriveRuntimeOperatorPackSurface,
  deriveRuntimeOwnerPackReason,
  deriveRuntimeOwnerPackSurface,
  deriveRuntimePickupPackReason,
  deriveRuntimePickupPackSurface,
  deriveRuntimeQueuePackReason,
  deriveRuntimeQueuePackSurface,
  deriveRuntimeRecoveryPackReason,
  deriveRuntimeRecoveryPackSurface,
  deriveRuntimeReviewPackReason,
  deriveRuntimeReviewPackSurface,
  deriveRuntimeRolePackReason,
  deriveRuntimeRolePackSurface,
  deriveRuntimeSessionPackReason,
  deriveRuntimeSessionPackSurface,
  deriveRuntimeSignalPackReason,
  deriveRuntimeSignalPackSurface,
  deriveRuntimeSummaryPackReason,
  deriveRuntimeSummaryPackSurface,
  deriveRuntimeTriagePackReason,
  deriveRuntimeTriagePackSurface,
  deriveRuntimeVerifierPackReason,
  deriveRuntimeVerifierPackSurface,
  deriveRuntimeWorkerPackReason,
  deriveRuntimeWorkerPackSurface,
  deriveRuntimeWorkspacePackReason,
  deriveRuntimeWorkspacePackSurface
} from "./state-runtime-views.js";

export function runtimeSummaryPackFromSources(
  input = {},
  {
    runtimeDashboard,
    runtimeAlerts,
    runtimeFocus,
    runtimeHandoffs,
    runtimeRecovery,
    runtimeCloseout,
    leaderAssignmentDispatchBundle,
    leaderAssignmentLaunchPlan
  }
) {
  return buildRuntimeSummaryPackView(
    input,
    {
      runtimeDashboard,
      runtimeAlerts,
      runtimeFocus,
      runtimeHandoffs,
      runtimeRecovery,
      runtimeCloseout,
      leaderAssignmentDispatchBundle,
      leaderAssignmentLaunchPlan
    },
    {
      deriveRuntimeSummaryPackSurface,
      deriveRuntimeSummaryPackReason,
      buildRuntimeSummaryPackSummary
    }
  );
}
export function runtimeOperatorPackFromSources({
  runtimeDashboard,
  runtimeFocus,
  runtimeAlerts,
  runtimeHandoffs,
  runtimeCloseout
}) {
  return buildRuntimeOperatorPackView(
    {
      runtimeDashboard,
      runtimeFocus,
      runtimeAlerts,
      runtimeHandoffs,
      runtimeCloseout
    },
    {
      deriveRuntimeOperatorPackSurface,
      deriveRuntimeOperatorPackReason,
      buildRuntimeOperatorPackSummary
    }
  );
}
export function runtimeDispatchPackFromSources(
  input = {},
  {
    runtimeDispatch,
    leaderAssignmentDispatchPack,
    leaderAssignmentDispatchBundle,
    leaderAssignmentLaunchPlan,
    runtimeRoles,
    runtimeHandoffs
  }
) {
  return buildRuntimeDispatchPackView(
    input,
    {
      runtimeDispatch,
      leaderAssignmentDispatchPack,
      leaderAssignmentDispatchBundle,
      leaderAssignmentLaunchPlan,
      runtimeRoles,
      runtimeHandoffs
    },
    {
      deriveRuntimeDispatchPackSurface,
      deriveRuntimeDispatchPackReason,
      buildRuntimeDispatchPackSummary
    }
  );
}
export function runtimeRecoveryPackFromSources({
  runtimeRecovery,
  runtimeHandoffs,
  runtimeFocus
}) {
  return buildRuntimeRecoveryPackView(
    {
      runtimeRecovery,
      runtimeHandoffs,
      runtimeFocus
    },
    {
      deriveRuntimeRecoveryPackSurface,
      deriveRuntimeRecoveryPackReason,
      buildRuntimeRecoveryPackSummary
    }
  );
}
export function runtimeCloseoutPackFromSources(
  input = {},
  {
    runtimeCloseout,
    runtimeSummaryPack,
    runtimeLeaderPack
  }
) {
  return buildRuntimeCloseoutPackView(
    input,
    {
      runtimeCloseout,
      runtimeSummaryPack,
      runtimeLeaderPack
    },
    {
      deriveRuntimeCloseoutPackSurface,
      deriveRuntimeCloseoutPackReason,
      buildRuntimeCloseoutPackSummary
    }
  );
}
export function runtimeReviewPackFromSources(
  input = {},
  {
    runtimeReview,
    runtimeRoles,
    runtimeVerifierPack
  }
) {
  return buildRuntimeReviewPackView(
    input,
    {
      runtimeReview,
      runtimeRoles,
      runtimeVerifierPack,
      describeRole
    },
    {
      deriveRuntimeReviewPackSurface,
      deriveRuntimeReviewPackReason,
      buildRuntimeReviewPackSummary
    }
  );
}
export function runtimeQueuePackFromSources(
  input = {},
  {
    leaderQueue,
    runtimeDashboard,
    runtimeFocus,
    leaderAssignmentDispatchBundle,
    leaderAssignmentLaunchPlan
  }
) {
  return buildRuntimeQueuePackView(
    input,
    {
      leaderQueue,
      runtimeDashboard,
      runtimeFocus,
      leaderAssignmentDispatchBundle,
      leaderAssignmentLaunchPlan
    },
    {
      deriveRuntimeQueuePackSurface,
      deriveRuntimeQueuePackReason,
      buildRuntimeQueuePackSummary
    }
  );
}
export function runtimeWorkspacePackFromSources(
  input = {},
  {
    runtimeDashboard,
    runtimeDispatch,
    leaderAssignmentDispatchBundle,
    leaderAssignmentLaunchPlan,
    runtimeReview,
    runtimeRecovery
  }
) {
  return buildRuntimeWorkspacePackView(
    input,
    {
      runtimeDashboard,
      runtimeDispatch,
      leaderAssignmentDispatchBundle,
      leaderAssignmentLaunchPlan,
      runtimeReview,
      runtimeRecovery
    },
    {
      deriveRuntimeWorkspacePackSurface,
      deriveRuntimeWorkspacePackReason,
      buildRuntimeWorkspacePackSummary
    }
  );
}
export function runtimeControlPackFromSources(
  input = {},
  {
    runtimeSummaryPack,
    runtimeWorkspacePack,
    runtimeOperatorPack,
    runtimeLeaderPack
  }
) {
  return buildRuntimeControlPackView(
    input,
    {
      runtimeSummaryPack,
      runtimeWorkspacePack,
      runtimeOperatorPack,
      runtimeLeaderPack
    },
    {
      deriveRuntimeControlPackSurface,
      deriveRuntimeControlPackReason,
      buildRuntimeControlPackSummary
    }
  );
}
export function runtimeSignalPackFromSources(
  input = {},
  {
    runtimeFocus,
    runtimeAlerts,
    runtimeActivity,
    runtimeRoles
  }
) {
  return buildRuntimeSignalPackView(
    input,
    {
      runtimeFocus,
      runtimeAlerts,
      runtimeActivity,
      runtimeRoles
    },
    {
      deriveRuntimeSignalPackSurface,
      deriveRuntimeSignalPackReason,
      buildRuntimeSignalPackSummary
    }
  );
}
export function runtimeHandoffPackFromSources({
  runtimeHandoffs,
  runtimeDispatch,
  runtimeReview,
  runtimeRecovery
}) {
  return buildRuntimeHandoffPackView(
    {
      runtimeHandoffs,
      runtimeDispatch,
      runtimeReview,
      runtimeRecovery
    },
    {
      deriveRuntimeHandoffPackSurface,
      deriveRuntimeHandoffPackReason,
      buildRuntimeHandoffPackSummary
    }
  );
}
export function runtimeTriagePackFromSources({
  runtimeFocus,
  runtimeAlerts,
  runtimeReview,
  runtimeRecovery
}) {
  return buildRuntimeTriagePackView(
    {
      runtimeFocus,
      runtimeAlerts,
      runtimeReview,
      runtimeRecovery
    },
    {
      deriveRuntimeTriagePackSurface,
      deriveRuntimeTriagePackReason,
      buildRuntimeTriagePackSummary
    }
  );
}
export function runtimeLeaderPackFromSources(
  input = {},
  {
    leaderWorkspace,
    leaderQueue,
    runtimeDispatch,
    leaderAssignmentDispatchPack,
    leaderAssignmentDispatchBundle,
    leaderAssignmentLaunchPlan,
    runtimeCloseout
  }
) {
  return buildRuntimeLeaderPackView(
    input,
    {
      leaderWorkspace,
      leaderQueue,
      runtimeDispatch,
      leaderAssignmentDispatchPack,
      leaderAssignmentDispatchBundle,
      leaderAssignmentLaunchPlan,
      runtimeCloseout
    },
    {
      deriveRuntimeLeaderPackSurface,
      deriveRuntimeLeaderPackReason,
      buildRuntimeLeaderPackSummary
    }
  );
}
