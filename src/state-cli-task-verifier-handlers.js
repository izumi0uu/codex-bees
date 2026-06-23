import { readRequiredRoleWorkerOptions } from "./state-cli-role-worker-options.js";
import { verifierBundle } from "./state-runtime.js";
import { writeNamedView } from "./state-cli-view-writers.js";

export function handleVerifierBundle() {
  const bundle = verifierBundle(readRequiredRoleWorkerOptions({ limit: true }));
  writeNamedView("bundle", bundle);
}
