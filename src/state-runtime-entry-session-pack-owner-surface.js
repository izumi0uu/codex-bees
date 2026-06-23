import { runtimeOwnerPackFromSources } from "./state-runtime-packs.js";

export function runtimeOwnerPackSurface(input = {}, { workerSession, workerHandoff, workerCloseout, taskNext }) {
  return runtimeOwnerPackFromSources(input, {
    workerSession,
    workerHandoff,
    workerCloseout,
    taskNext
  });
}
