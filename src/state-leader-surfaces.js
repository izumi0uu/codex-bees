import { compareLeaderWorkspaceEntries } from "./state-queue-views.js";
import { describeRole } from "./state-task-core.js";
import {
  buildLeaderAssignmentDispatchBundleView,
  buildLeaderAssignmentDispatchPackView,
  buildLeaderAssignmentDispatchView,
  buildLeaderAssignmentLaunchPlanView,
  buildLeaderAssignmentsView,
  buildLeaderQueueSummary,
  buildLeaderQueueView,
  deriveLeaderAssignmentDispatchBundleReason,
  deriveLeaderAssignmentDispatchReason,
  deriveLeaderAssignmentLaunchPlanReason,
  deriveLeaderAssignmentsReason,
  deriveLeaderQueueReason
} from "./state-dashboard-views.js";
import {
  buildLeaderWorkspaceSummary,
  buildLeaderWorkspaceSwarmEntry,
  buildLeaderWorkspaceView,
  deriveLeaderAssignmentDispatchPackReason
} from "./state-runtime-views.js";
import {
  buildSwarmBundleSummary,
  deriveLeaderWorkspaceReason
} from "./state-swarm-views.js";

export function leaderWorkspaceFromSources(
  input = {},
  {
    listSwarmOverviews,
    swarmBrief,
    swarmBundle
  }
) {
  return buildLeaderWorkspaceView(
    input,
    {
      listSwarmOverviews,
      buildLeaderWorkspaceSwarmEntry,
      swarmBrief,
      swarmBundle,
      buildSwarmBundleSummary,
      compareLeaderWorkspaceEntries
    },
    {
      deriveLeaderWorkspaceReason,
      buildLeaderWorkspaceSummary
    }
  );
}

export function leaderQueueFromSources(
  input = {},
  {
    leaderWorkspace
  }
) {
  return buildLeaderQueueView(
    input,
    {
      leaderWorkspace
    },
    {
      deriveLeaderQueueReason,
      buildLeaderQueueSummary
    }
  );
}

export function leaderAssignmentsFromSources(
  input = {},
  {
    leaderWorkspace,
    swarmBrief,
    taskBrief
  }
) {
  return buildLeaderAssignmentsView(
    input,
    {
      leaderWorkspace,
      swarmBrief,
      taskBrief
    },
    {
      deriveLeaderAssignmentsReason
    }
  );
}

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
