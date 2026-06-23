import { runtimeWorkerPackFromSources } from "./state-runtime-packs.js";

export function runtimeWorkerPackSurface(input = {}, { workerSession, workerHandoff, workerCloseout, taskNext }) {
  return runtimeWorkerPackFromSources(input, {
    workerSession,
    workerHandoff,
    workerCloseout,
    taskNext
  });
}
