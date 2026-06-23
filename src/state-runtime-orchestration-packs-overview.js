import {
  buildRuntimeCloseoutPackSummary,
  buildRuntimeCloseoutPackView,
  buildRuntimeHandoffPackSummary,
  buildRuntimeHandoffPackView,
  buildRuntimeOperatorPackSummary,
  buildRuntimeOperatorPackView,
  buildRuntimeRecoveryPackSummary,
  buildRuntimeRecoveryPackView,
  buildRuntimeReviewPackSummary,
  buildRuntimeReviewPackView,
  buildRuntimeSignalPackSummary,
  buildRuntimeSignalPackView,
  buildRuntimeSummaryPackSummary,
  buildRuntimeSummaryPackView,
  buildRuntimeTriagePackSummary,
  buildRuntimeTriagePackView,
  deriveRuntimeCloseoutPackReason,
  deriveRuntimeCloseoutPackSurface,
  deriveRuntimeHandoffPackReason,
  deriveRuntimeHandoffPackSurface,
  deriveRuntimeOperatorPackReason,
  deriveRuntimeOperatorPackSurface,
  deriveRuntimeRecoveryPackReason,
  deriveRuntimeRecoveryPackSurface,
  deriveRuntimeReviewPackReason,
  deriveRuntimeReviewPackSurface,
  deriveRuntimeSignalPackReason,
  deriveRuntimeSignalPackSurface,
  deriveRuntimeSummaryPackReason,
  deriveRuntimeSummaryPackSurface,
  deriveRuntimeTriagePackReason,
  deriveRuntimeTriagePackSurface
} from "./state-runtime-views.js";
import { describeRole } from "./state-task-core.js";

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
