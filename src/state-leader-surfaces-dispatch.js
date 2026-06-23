import { describeRole } from "./state-task-core.js";
import {
  buildLeaderAssignmentDispatchBundleView,
  buildLeaderAssignmentDispatchPackView,
  buildLeaderAssignmentDispatchView,
  buildLeaderAssignmentLaunchPlanView,
  deriveLeaderAssignmentDispatchBundleReason,
  deriveLeaderAssignmentDispatchReason,
  deriveLeaderAssignmentLaunchPlanReason
} from "./state-dashboard-views.js";
import {
  deriveLeaderAssignmentDispatchPackReason
} from "./state-runtime-leader-pack-dispatch-views.js";

export function leaderAssignmentDispatchFromSources(
  input = {},
  {
    leaderAssignments
  }
) {
  return buildLeaderAssignmentDispatchView(
    input,
    {
      leaderAssignments,
      describeRole
    },
    {
      deriveLeaderAssignmentDispatchReason
    }
  );
}

export function leaderAssignmentDispatchPackFromSources(
  input = {},
  {
    leaderAssignments,
    leaderAssignmentDispatch
  }
) {
  return buildLeaderAssignmentDispatchPackView(
    input,
    {
      leaderAssignments,
      leaderAssignmentDispatch
    },
    {
      deriveLeaderAssignmentDispatchPackReason
    }
  );
}

export function leaderAssignmentDispatchBundleFromSources(
  input = {},
  {
    leaderAssignmentDispatchPack
  }
) {
  return buildLeaderAssignmentDispatchBundleView(
    input,
    {
      leaderAssignmentDispatchPack
    },
    {
      deriveLeaderAssignmentDispatchBundleReason
    }
  );
}

export function leaderAssignmentLaunchPlanFromSources(
  input = {},
  {
    leaderAssignmentDispatchBundle
  }
) {
  return buildLeaderAssignmentLaunchPlanView(
    input,
    {
      leaderAssignmentDispatchBundle
    },
    {
      deriveLeaderAssignmentLaunchPlanReason
    }
  );
}
