import { getRuntimeContractView } from "./runtime-contract.js";
import { createLoadedValueView } from "./state-view-helpers.js";

export function getRuntimeReadyView() {
  return createLoadedValueView("runtime_ready_view", "contract", getRuntimeContractView(), {
    recommendedReason: "runtime_entry_ready",
    counts: {
      nextSteps: 6
    },
    extra: {
      status: "ready",
      next: [
        "use `codex-bees init` to materialize the shipped .codex project assets",
        "use `codex-bees doctor` to inspect runtime boundaries",
        "use `codex-bees tools` to inspect current MCP tool catalog",
        "use `codex-bees task:add --title ...` to create local work items",
        "use `codex-bees swarm:init --objective ...` to stage a bounded local swarm",
        "use `codex-bees mcp` to start the stdio MCP surface"
      ]
    }
  });
}
