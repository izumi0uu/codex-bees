import { getRuntimeContractView } from "./contract-view.js";
import { getRuntimeCliGuide } from "./cli-guide.js";
import { createLoadedValueView } from "../state/core/view-helpers.js";

export function getRuntimeReadyView() {
  const guide = getRuntimeCliGuide();
  return createLoadedValueView("runtime_ready_view", "contract", getRuntimeContractView(), {
    recommendedReason: "runtime_entry_ready",
    counts: {
      nextSteps: guide.next.length
    },
    extra: {
      status: "ready",
      guideMode: guide.guideMode,
      summary: guide.summary,
      stateCounts: guide.stateCounts,
      suggestedCommands: guide.suggestions,
      next: guide.next
    }
  });
}
