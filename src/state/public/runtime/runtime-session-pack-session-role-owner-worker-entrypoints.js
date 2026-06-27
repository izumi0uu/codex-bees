import {
  runtimeOwnerPackSurface,
  runtimeWorkerPackSurface
} from "../../runtime/entry/surfaces.js";

export function createStateRuntimeSessionPackSessionRoleOwnerWorkerEntryPoints(api) {
  const runtimeOwnerPackSources = {
    workerSession: api.workerSession,
    workerHandoff: api.workerHandoff,
    workerCloseout: api.workerCloseout,
    taskNext: api.taskNext
  };
  const runtimeOwnerPack = (input = {}) =>
    runtimeOwnerPackSurface(input, runtimeOwnerPackSources);

  const runtimeWorkerPackSources = {
    workerSession: api.workerSession,
    workerHandoff: api.workerHandoff,
    workerCloseout: api.workerCloseout,
    taskNext: api.taskNext
  };
  const runtimeWorkerPack = (input = {}) =>
    runtimeWorkerPackSurface(input, runtimeWorkerPackSources);

  return {
    runtimeOwnerPack,
    runtimeWorkerPack
  };
}
