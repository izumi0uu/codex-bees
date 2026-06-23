import { requireOption, readPositiveIntegerOption } from "./state-cli-helpers.js";
import { verifierBundle } from "./state-runtime.js";
import { writeNamedView } from "./state-cli-view-writers.js";

export function handleVerifierBundle() {
  const role = requireOption("--role");
  const workerId = requireOption("--worker");
  const bundle = verifierBundle({
    role,
    workerId,
    limit: readPositiveIntegerOption("--limit")
  });
  writeNamedView("bundle", bundle);
}
