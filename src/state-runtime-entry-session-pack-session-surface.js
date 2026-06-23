import { runtimeSessionPackFromSources } from "./state-runtime-packs.js";

export function runtimeSessionPackSurface(input = {}, { runtimeWorkerPack, runtimeOwnerPack, runtimeVerifierPack, runtimeRoles }) {
  return runtimeSessionPackFromSources(input, {
    runtimeWorkerPack,
    runtimeOwnerPack,
    runtimeVerifierPack,
    runtimeRoles
  });
}
