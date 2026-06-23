import {
  buildRuntimeActivitySummary,
  buildRuntimeHandoffsSummary,
  buildRuntimeRecoverySummary,
  buildRuntimeReviewSummary,
  buildRuntimeReviewView,
  buildRuntimeReviewViewFromSources,
  deriveRuntimeActivityReason,
  deriveRuntimeHandoffsReason,
  deriveRuntimeRecoveryReason,
  deriveRuntimeReviewReason
} from "./state-dashboard-views.js";
import {
  buildRuntimeActivityEntry,
  buildRuntimeActivityView,
  buildRuntimeActivityViewFromState,
  buildRuntimeCloseoutTaskEntry,
  buildRuntimeCloseoutView,
  buildRuntimeCloseoutViewFromState,
  buildRuntimeHandoffEntry,
  buildRuntimeHandoffsView,
  buildRuntimeHandoffsViewFromState,
  buildRuntimeRecoveryEntry,
  buildRuntimeRecoveryView,
  buildRuntimeRecoveryViewFromState,
  chooseRuntimeCloseoutNext,
  compareRuntimeActivityEntries,
  compareRuntimeCloseoutSwarms,
  compareRuntimeCloseoutTasks,
  compareRuntimeHandoffEntries,
  compareRuntimeHandoffGroups,
  compareRuntimeRecoveryEntries,
  compareRuntimeRecoveryGroups,
  isRuntimeRecoveryTask,
  runtimeHandoffActorKey
} from "./state-runtime-entities.js";
import {
  compareTasksByUpdatedAt
} from "./state-queue-views.js";
import {
  buildRuntimeReviewTaskEntry,
  compareRuntimeReviewGroups
} from "./state-task-views.js";
import { describeRole } from "./state-task-core.js";
import {
  buildRuntimeCloseoutSummary,
  buildRuntimeCloseoutSwarmEntry,
  deriveRuntimeCloseoutReason
} from "./state-swarm-views.js";

export function runtimeReviewFromSources({
  loadState,
  normalizeTask,
  taskBrief
}) {
  return buildRuntimeReviewViewFromSources(
    {
      loadState,
      normalizeTask,
      compareTasksByUpdatedAt,
      describeRole,
      taskBrief,
      buildRuntimeReviewTaskEntry,
      compareRuntimeReviewGroups
    },
    {
      deriveRuntimeReviewReason,
      buildRuntimeReviewSummary,
      buildRuntimeReviewView
    },
    {
      buildRuntimeReviewView
    }
  );
}

export function runtimeActivityFromSources(
  input = {},
  {
    loadState,
    normalizeTask,
    normalizeSwarm,
    taskBrief,
    swarmBrief
  }
) {
  return buildRuntimeActivityViewFromState(
    input,
    {
      loadState,
      normalizeTask,
      normalizeSwarm,
      taskBrief,
      swarmBrief,
      buildRuntimeActivityEntry,
      compareRuntimeActivityEntries
    },
    {
      deriveRuntimeActivityReason,
      buildRuntimeActivitySummary,
      buildRuntimeActivityView
    }
  );
}

export function runtimeHandoffsFromSources({
  loadState,
  normalizeTask,
  taskBrief
}) {
  return buildRuntimeHandoffsViewFromState(
    {
      loadState,
      normalizeTask,
      taskBrief
    },
    {
      buildRuntimeHandoffEntry,
      compareRuntimeHandoffEntries,
      runtimeHandoffActorKey,
      compareRuntimeHandoffGroups,
      deriveRuntimeHandoffsReason,
      buildRuntimeHandoffsSummary,
      buildRuntimeHandoffsView
    }
  );
}

export function runtimeCloseoutFromSources({
  loadState,
  normalizeTask,
  taskReport,
  listSwarmOverviews,
  swarmCloseout
}) {
  return buildRuntimeCloseoutViewFromState(
    {
      loadState,
      normalizeTask,
      taskReport,
      listSwarmOverviews,
      swarmCloseout
    },
    {
      buildRuntimeCloseoutTaskEntry,
      compareRuntimeCloseoutTasks,
      buildRuntimeCloseoutSwarmEntry,
      compareRuntimeCloseoutSwarms,
      chooseRuntimeCloseoutNext,
      deriveRuntimeCloseoutReason,
      buildRuntimeCloseoutSummary,
      buildRuntimeCloseoutView
    }
  );
}

export function runtimeRecoveryFromSources({
  loadState,
  normalizeTask,
  taskBrief
}) {
  return buildRuntimeRecoveryViewFromState(
    {
      loadState,
      normalizeTask,
      taskBrief
    },
    {
      isRuntimeRecoveryTask,
      buildRuntimeRecoveryEntry,
      compareRuntimeRecoveryEntries,
      compareRuntimeRecoveryGroups,
      deriveRuntimeRecoveryReason,
      buildRuntimeRecoverySummary,
      buildRuntimeRecoveryView
    }
  );
}
