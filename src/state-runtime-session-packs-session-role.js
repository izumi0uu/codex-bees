import { describeRole } from "./state-task-core.js";
import {
  buildRuntimeRolePackSummary,
  buildRuntimeRolePackView,
  buildRuntimeSessionPackSummary,
  buildRuntimeSessionPackView,
  buildRuntimeVerifierPackSummary,
  buildRuntimeVerifierPackView,
  deriveRuntimeRolePackReason,
  deriveRuntimeRolePackSurface,
  deriveRuntimeSessionPackReason,
  deriveRuntimeSessionPackSurface,
  deriveRuntimeVerifierPackReason,
  deriveRuntimeVerifierPackSurface
} from "./state-runtime-views.js";

export function runtimeSessionPackFromSources(
  input = {},
  {
    runtimeWorkerPack,
    runtimeOwnerPack,
    runtimeVerifierPack,
    runtimeRoles
  }
) {
  return buildRuntimeSessionPackView(
    input,
    {
      runtimeWorkerPack,
      runtimeOwnerPack,
      runtimeVerifierPack,
      runtimeRoles,
      describeRole
    },
    {
      deriveRuntimeSessionPackSurface,
      deriveRuntimeSessionPackReason,
      buildRuntimeSessionPackSummary
    }
  );
}

export function runtimeRolePackFromSources(
  input = {},
  {
    runtimeRoles,
    runtimeSessionPack,
    runtimeOwnerPack,
    runtimeVerifierPack
  }
) {
  return buildRuntimeRolePackView(
    input,
    {
      runtimeRoles,
      runtimeSessionPack,
      runtimeOwnerPack,
      runtimeVerifierPack,
      describeRole
    },
    {
      deriveRuntimeRolePackSurface,
      deriveRuntimeRolePackReason,
      buildRuntimeRolePackSummary
    }
  );
}

export function runtimeVerifierPackFromSources(
  input = {},
  {
    runtimeReview,
    verifierBundle,
    workerCloseout,
    taskNext
  }
) {
  return buildRuntimeVerifierPackView(
    input,
    {
      runtimeReview,
      verifierBundle,
      workerCloseout,
      taskNext,
      describeRole
    },
    {
      deriveRuntimeVerifierPackSurface,
      deriveRuntimeVerifierPackReason,
      buildRuntimeVerifierPackSummary
    }
  );
}
