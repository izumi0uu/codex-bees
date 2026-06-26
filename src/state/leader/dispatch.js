import { describeRole } from "../task/core.js";
import {
  buildLeaderAssignmentDispatchBundleView,
  buildLeaderAssignmentDispatchPackView,
  buildLeaderAssignmentDispatchView,
  buildLeaderAssignmentLaunchPlanView,
  deriveLeaderAssignmentDispatchBundleReason,
  deriveLeaderAssignmentDispatchReason,
  deriveLeaderAssignmentLaunchPlanReason
} from "../dashboard/views.js";
import {
  deriveLeaderAssignmentDispatchPackReason
} from "../runtime/leader-pack/dispatch-views.js";

export function leaderAssignmentDispatchFromSources(
  input = {},
  sources = {}
) {
  return buildLeaderAssignmentDispatchView(
    input,
    {
      ...sources,
      describeRole
    },
    {
      deriveLeaderAssignmentDispatchReason
    }
  );
}

export function leaderAssignmentDispatchPackFromSources(
  input = {},
  sources = {}
) {
  return buildLeaderAssignmentDispatchPackView(
    input,
    sources,
    {
      deriveLeaderAssignmentDispatchPackReason
    }
  );
}

export function leaderAssignmentDispatchBundleFromSources(
  input = {},
  sources = {}
) {
  return buildLeaderAssignmentDispatchBundleView(
    input,
    sources,
    {
      deriveLeaderAssignmentDispatchBundleReason
    }
  );
}

export function leaderAssignmentLaunchPlanFromSources(
  input = {},
  sources = {}
) {
  return buildLeaderAssignmentLaunchPlanView(
    input,
    sources,
    {
      deriveLeaderAssignmentLaunchPlanReason
    }
  );
}
