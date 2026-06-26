import { readRequiredRoleWorkerOptions } from "./role-worker-options.js";
import { verifierBundle } from "../../state-runtime.js";
import { writeNamedView } from "./view-writers.js";

export function handleVerifierBundle() {
  const bundle = verifierBundle(readRequiredRoleWorkerOptions({ limit: true }));
  writeNamedView("bundle", bundle);
}
