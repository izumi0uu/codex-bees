import { buildRuntimeFocusSummary, buildRuntimeFocusView } from "./state-runtime-entities.js";
import { buildRuntimeFocusSources, buildRuntimeFocusViewFromSources } from "./state-runtime-views.js";

export function runtimeFocusFromSources(sources = {}) {
  return buildRuntimeFocusViewFromSources(
    {
      ...sources,
      buildRuntimeFocusView
    },
    {
      buildRuntimeFocusSources,
      buildRuntimeFocusSummary
    },
    {
      buildRuntimeFocusViewFromSources
    }
  );
}
