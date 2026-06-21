import { listAgentRoleIds } from "./catalog.js";

export function runtimeRoleCatalog() {
  return {
    agents: listAgentRoleIds()
  };
}
