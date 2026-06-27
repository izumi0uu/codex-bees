import { runtimeRoleCatalog } from "../role/catalog.js";
import { buildTaskValidationViewFromSources } from "../rules/index.js";
import { validateTaskFromSources } from "./core.js";

export function validateTaskSurface(id, sources = {}) {
  return validateTaskFromSources(id, {
    ...sources,
    buildTaskValidationViewFromSources,
    runtimeRoleCatalog
  });
}
