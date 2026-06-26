import { runtimeRoleCatalog } from "../../state-role-catalog.js";
import { buildTaskValidationViewFromSources } from "../../state-rules.js";
import { validateTaskFromSources } from "./core.js";

export function validateTaskSurface(id, sources = {}) {
  return validateTaskFromSources(id, {
    ...sources,
    buildTaskValidationViewFromSources,
    runtimeRoleCatalog
  });
}
