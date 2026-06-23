import { requireOption, readPositiveIntegerOption, write } from "./state-cli-helpers.js";
import { verifierBundle } from "./state-runtime.js";

export function handleVerifierBundle() {
  const role = requireOption("--role");
  const workerId = requireOption("--worker");
  const bundle = verifierBundle({
    role,
    workerId,
    limit: readPositiveIntegerOption("--limit")
  });
  write(JSON.stringify({ bundle }, null, 2) + "\n");
}
