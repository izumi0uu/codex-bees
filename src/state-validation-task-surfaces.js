import { validateTaskFromSources } from "./state-task-core.js";
import { runtimeRoleCatalog } from "./state-role-catalog.js";
import { buildTaskValidationViewFromSources } from "./state-rules.js";

export function validateTaskSurface(id, sources = {}) {
  return validateTaskFromSources(id, {
    ...sources,
    buildTaskValidationViewFromSources,
    runtimeRoleCatalog
  });
}
