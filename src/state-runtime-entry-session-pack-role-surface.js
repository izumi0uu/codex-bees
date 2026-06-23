import { runtimeRolePackFromSources } from "./state-runtime-packs.js";

export function runtimeRolePackSurface(input = {}, { runtimeRoles, runtimeSessionPack, runtimeOwnerPack, runtimeVerifierPack }) {
  return runtimeRolePackFromSources(input, {
    runtimeRoles,
    runtimeSessionPack,
    runtimeOwnerPack,
    runtimeVerifierPack
  });
}
