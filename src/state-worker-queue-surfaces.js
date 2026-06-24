import { getRuntimeCatalog } from "./catalog.js";
import {
  assignmentFollowupCommand,
  assignmentPickupOutcome,
  buildPreviewTaskAssignmentViewFromSources,
  buildPreviewTaskPickupViewFromSources,
  buildTaskAssignmentPickupViewFromSources,
  buildTaskInboxViewFromSources,
  buildTaskNextViewFromSources,
  buildTaskPickupViewFromSources,
  isClaimableTask,
  normalizeNextMode,
  pickupFollowupCommand,
  pickupOutcome,
  sortInboxTasks,
  sortNextCandidates,
  summarizeInboxTask
} from "./state-queue-views.js";
import {
  deriveTaskAssignmentPickupReason,
  deriveTaskAssignmentPreviewReason,
  deriveTaskInboxReason,
  deriveTaskNextReason,
  deriveTaskPickupPreviewReason,
  deriveTaskPickupReason
} from "./state-reasons.js";
import { describeRole, describeRoleWithContract } from "./state-task-core.js";

export function taskInboxFromSources(input = {}, sources = {}) {
  return buildTaskInboxViewFromSources(
    input,
    {
      ...sources,
      getRuntimeCatalog,
      sortInboxTasks,
      summarizeInboxTask,
      isClaimableTask,
      describeRole
    },
    {
      deriveTaskInboxReason
    }
  );
}

export function taskNextFromSources(input = {}, sources = {}) {
  return buildTaskNextViewFromSources(
    input,
    {
      ...sources,
      normalizeNextMode,
      sortNextCandidates,
      describeRole,
      summarizeInboxTask
    },
    {
      deriveTaskNextReason
    }
  );
}

export function taskPickupFromSources(input = {}, sources = {}) {
  return buildTaskPickupViewFromSources(
    input,
    {
      ...sources,
      describeRole,
      summarizeInboxTask,
      pickupFollowupCommand,
      pickupOutcome,
      normalizeNextMode
    },
    {
      deriveTaskPickupReason
    }
  );
}

export function taskAssignmentPickupFromSources(input = {}, sources = {}) {
  return buildTaskAssignmentPickupViewFromSources(
    input,
    {
      ...sources,
      describeRole,
      normalizeNextMode,
      summarizeInboxTask,
      assignmentPickupOutcome,
      assignmentFollowupCommand
    },
    {
      deriveTaskAssignmentPickupReason
    }
  );
}

export function previewTaskAssignmentFromSources(input = {}, sources = {}) {
  return buildPreviewTaskAssignmentViewFromSources(
    input,
    {
      ...sources,
      describeRole: describeRoleWithContract,
      normalizeNextMode,
      summarizeInboxTask,
      assignmentPickupOutcome,
      assignmentFollowupCommand
    },
    {
      deriveTaskAssignmentPreviewReason
    }
  );
}

export function previewTaskPickupFromSources(input = {}, sources = {}) {
  return buildPreviewTaskPickupViewFromSources(
    input,
    {
      ...sources,
      describeRole: describeRoleWithContract,
      normalizeNextMode,
      pickupOutcome,
      pickupFollowupCommand
    },
    {
      deriveTaskPickupPreviewReason
    }
  );
}
