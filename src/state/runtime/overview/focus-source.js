import { buildRuntimeFocusSummary } from "../entities.js";
import { buildRuntimeFocusSources, buildRuntimeFocusViewFromSources } from "../views.js";

export function runtimeFocusFromSources(sources = {}) {
  return buildRuntimeFocusViewFromSources(
    {
      ...sources
    },
    {
      buildRuntimeFocusSources,
      buildRuntimeFocusSummary
    }
  );
}
