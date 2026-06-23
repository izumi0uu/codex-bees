import { runtimePickupPackFromSources } from "./state-runtime-packs.js";

export function runtimePickupPackSurface(input = {}, { workerSession, taskNext, previewTaskPickup, runtimeRolePack }) {
  return runtimePickupPackFromSources(input, {
    workerSession,
    taskNext,
    previewTaskPickup,
    runtimeRolePack
  });
}
